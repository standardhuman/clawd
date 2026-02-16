import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { getConditionsDatabase, getServiceConditions, calculateGrowthSurcharge, parseAnodeFromNotes } from './notion-helpers.js';

// Load env from local .env first, then sailorskills-platform as fallback
dotenv.config(); // Load local .env
const platformEnvPath = join(process.env.HOME || '', 'AI/business/sailorskills-platform/.env');
if (existsSync(platformEnvPath)) {
  dotenv.config({ path: platformEnvPath });
}

const app = express();
app.use(cors());
app.use(express.json());

const BILLING_DIR = join(process.env.HOME || '', 'clawd/billing');
const NOTION_DB_ID = '0ae0e330-780b-4764-956e-12e8ee344ea2';

// Special pricing rules
const GRATIS_BOATS = ['Junebug'];  // Always free
const CAPPED_BOATS: Record<string, number> = {
  'Glitch': 99,
  'Twilight Zone': 99,
  'Maiden California': 99,
  "O'Mar": 99
};

// Store Stripe key in memory (loaded from env or set via API)
let stripeKey: string | null = process.env.STRIPE_SECRET_KEY || null;

// Get Notion token
const getNotionToken = () => process.env.NOTION_HOWARD_TOKEN || process.env.NOTION_TOKEN;

// List available billing months
app.get('/api/months', (req, res) => {
  try {
    const files = readdirSync(BILLING_DIR).filter(f => f.endsWith('_billing.csv'));
    const months = files.map(f => {
      const match = f.match(/^(\w+)_(\d{4})_billing\.csv$/);
      if (match) {
        return { id: f.replace('_billing.csv', ''), name: `${match[1].charAt(0).toUpperCase() + match[1].slice(1)} ${match[2]}`, file: f };
      }
      return null;
    }).filter(Boolean);
    res.json(months);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list months' });
  }
});

// Get billing data for a month
app.get('/api/billing/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const csvPath = join(BILLING_DIR, `${month}_billing.csv`);
    const billedPath = join(BILLING_DIR, `${month}_billed.txt`);
    
    if (!existsSync(csvPath)) {
      return res.status(404).json({ error: 'Billing file not found' });
    }
    
    const csv = readFileSync(csvPath, 'utf-8');
    const billedList = existsSync(billedPath) 
      ? readFileSync(billedPath, 'utf-8').split('\n').filter(Boolean)
      : [];
    
    // Load rich billing data if available
    const billedJsonPath = join(BILLING_DIR, `${month}_billed.json`);
    let billedData: Record<string, any> = {};
    if (existsSync(billedJsonPath)) {
      try {
        billedData = JSON.parse(readFileSync(billedJsonPath, 'utf-8'));
      } catch {}
    }
    
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    
    const boats = await Promise.all(lines.slice(1).map(async (line) => {
      const values = line.split(',');
      const boat: any = {};
      headers.forEach((h, i) => boat[h] = values[i]);
      
      // Check if billed and get invoice details
      boat.billed = billedList.includes(boat.Boat);
      if (billedData[boat.Boat]) {
        boat.invoiceId = billedData[boat.Boat].invoiceId;
        boat.stripeUrl = billedData[boat.Boat].stripeUrl;
        boat.billedAt = billedData[boat.Boat].billedAt;
        boat.billedStatus = billedData[boat.Boat].status;
      }
      
      // Fetch customer info from Notion and find in Stripe
      try {
        const { email, ownerName } = await getCustomerInfo(boat.Boat);
        boat.email = email || null;
        boat.ownerName = ownerName || null;
        
        // Check if customer has payment method on file
        if ((boat.email || boat.ownerName) && stripeKey) {
          try {
            const customer = await findStripeCustomer(boat.email, boat.ownerName, stripeKey);
            if (customer) {
              boat.stripeCustomerId = customer.id;
              boat.stripeCustomerEmail = customer.email;  // Track what email Stripe has
              
              // Check for default payment method first
              if (customer.invoice_settings?.default_payment_method) {
                boat.hasCard = true;
              } else {
                // Check for any attached payment methods
                const pmRes = await fetch(`https://api.stripe.com/v1/payment_methods?customer=${customer.id}&type=card&limit=1`, {
                  headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
                });
                const pmData = await pmRes.json();
                boat.hasCard = pmData.data?.length > 0;
              }
            } else {
              boat.hasCard = false;
            }
          } catch {
            boat.hasCard = null; // Unknown
          }
        } else {
          boat.hasCard = null;
        }
      } catch {
        boat.email = null;
        boat.hasCard = null;
      }
      
      return boat;
    }));
    
    const total = boats.reduce((sum, b) => sum + parseFloat(b.Total || 0), 0);
    const billedCount = boats.filter(b => b.billed).length;
    
    res.json({
      month,
      boats,
      summary: {
        total: boats.length,
        billed: billedCount,
        pending: boats.length - billedCount,
        amount: total.toFixed(2)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load billing data' });
  }
});

// Get customer info (email + owner name) from Notion
async function getCustomerInfo(boatName: string): Promise<{ email: string | null, ownerName: string | null }> {
  const token = getNotionToken();
  if (!token) return { email: null, ownerName: null };
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { property: 'Boat', title: { equals: boatName } }
      })
    });
    
    const data = await response.json();
    const props = data.results?.[0]?.properties;
    if (!props) return { email: null, ownerName: null };
    
    const email = props.Email?.email || null;
    const firstName = props['First Name']?.rich_text?.[0]?.plain_text || '';
    const lastName = props['Last Name']?.rich_text?.[0]?.plain_text || '';
    const ownerName = [firstName, lastName].filter(Boolean).join(' ') || null;
    
    return { email, ownerName };
  } catch {
    return { email: null, ownerName: null };
  }
}

// Legacy function for backwards compatibility
async function getCustomerEmail(boatName: string): Promise<string | null> {
  const info = await getCustomerInfo(boatName);
  return info.email;
}

// Find Stripe customer by email or name
async function findStripeCustomer(email: string | null, ownerName: string | null, stripeKey: string): Promise<any | null> {
  const authHeader = { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` };
  
  // Try email first (most reliable when it matches)
  if (email) {
    // Handle multiple emails (comma-separated) - try first one
    const primaryEmail = email.split(',')[0].trim();
    const searchRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(primaryEmail)}&limit=1`, {
      headers: authHeader
    });
    const searchData = await searchRes.json();
    if (searchData.data?.[0]) {
      return searchData.data[0];
    }
    
    // Try case-insensitive email match (Stripe search is case-sensitive)
    const emailLower = primaryEmail.toLowerCase();
    const emailUpper = primaryEmail.toUpperCase();
    if (emailLower !== primaryEmail) {
      const lowerRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(emailLower)}&limit=1`, {
        headers: authHeader
      });
      const lowerData = await lowerRes.json();
      if (lowerData.data?.[0]) return lowerData.data[0];
    }
    if (emailUpper !== primaryEmail && emailUpper !== emailLower) {
      const upperRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(emailUpper)}&limit=1`, {
        headers: authHeader
      });
      const upperData = await upperRes.json();
      if (upperData.data?.[0]) return upperData.data[0];
    }
    
    // Try email with common username variations (first initial + lastname)
    // e.g., paul@domain.com might be pweismann@domain.com in Stripe
    if (ownerName) {
      const domain = primaryEmail.split('@')[1];
      const nameParts = ownerName.toLowerCase().split(/[\s,]+/).filter(p => p.length > 1);
      if (nameParts.length >= 2 && domain) {
        // Try firstInitial + lastName @ domain
        const firstInitial = nameParts[0][0];
        const lastName = nameParts[nameParts.length - 1];
        const altEmail = `${firstInitial}${lastName}@${domain}`;
        const altRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(altEmail)}&limit=1`, {
          headers: authHeader
        });
        const altData = await altRes.json();
        if (altData.data?.[0]) return altData.data[0];
      }
    }
  }
  
  // Fall back to name search if email didn't find a customer (searches recent 100)
  if (ownerName) {
    const listRes = await fetch(`https://api.stripe.com/v1/customers?limit=100`, {
      headers: authHeader
    });
    const listData = await listRes.json();
    
    const firstName = ownerName.split(/[\s,]+/)[0].toLowerCase();
    const nameParts = ownerName.toLowerCase().split(/[\s,]+/).filter(p => p.length > 2);
    
    const customer = listData.data?.find((c: any) => {
      const customerName = (c.name || '').toLowerCase().trim();
      if (!customerName || customerName.length < 3) return false;
      
      if (customerName === firstName && firstName.length > 3) return true;
      
      const matchedParts = nameParts.filter(part => customerName.includes(part));
      return matchedParts.length >= 2;
    });
    
    if (customer) return customer;
  }
  
  return null;
}

app.get('/api/customer/:boat', async (req, res) => {
  const email = await getCustomerEmail(req.params.boat);
  res.json({ email });
});

// Set Stripe key
app.post('/api/stripe-key', (req, res) => {
  const { key } = req.body;
  if (!key || !key.startsWith('rk_live_') && !key.startsWith('sk_live_')) {
    return res.status(400).json({ error: 'Invalid Stripe key' });
  }
  stripeKey = key;
  res.json({ success: true });
});

// Check if Stripe key is set
app.get('/api/stripe-key/status', (req, res) => {
  res.json({ configured: !!stripeKey });
});

// Create and send invoice
// Service date clarity is critical - customers are being billed after the fact
app.post('/api/invoice', async (req, res) => {
  if (!stripeKey) {
    return res.status(400).json({ error: 'Stripe key not configured' });
  }
  
  const { boat, hull, anode, anodeType, total, email, month, serviceDate, stripeCustomerId: passedCustomerId, ownerName } = req.body;
  
  try {
    // Find existing customer using smart lookup, or create new one
    let customerId = passedCustomerId;
    let hasCard = false;
    
    if (!customerId) {
      // Try smart lookup first
      const existingCustomer = await findStripeCustomer(email, ownerName, stripeKey);
      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }
    
    if (!customerId) {
      // Create new customer only if not found
      const createRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: { 
          'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `email=${encodeURIComponent(email)}&description=${encodeURIComponent(boat + ' owner')}&name=${encodeURIComponent(ownerName || boat + ' owner')}`
      });
      const createData = await createRes.json();
      customerId = createData.id;
    }
    
    // Check payment method - look at default AND attached payment methods
    // Store the actual payment method ID so we can use it for charging
    let paymentMethodId: string | null = null;
    
    const custRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
      headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
    });
    const custData = await custRes.json();
    
    if (custData.invoice_settings?.default_payment_method) {
      hasCard = true;
      paymentMethodId = custData.invoice_settings.default_payment_method;
    } else {
      // Check for any attached payment methods
      const pmRes = await fetch(`https://api.stripe.com/v1/payment_methods?customer=${customerId}&type=card&limit=1`, {
        headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
      });
      const pmData = await pmRes.json();
      hasCard = pmData.data?.length > 0;
      if (hasCard && pmData.data[0]) {
        paymentMethodId = pmData.data[0].id;
      }
    }
    
    // Format service date for display (e.g., "January 15, 2026" or just "January 2026")
    const serviceDateDisplay = serviceDate 
      ? new Date(serviceDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : month;
    
    // Create invoice items - date FIRST so it's immediately visible
    const hullCents = Math.round(parseFloat(hull) * 100);
    const hullDesc = `${serviceDateDisplay} - Hull Cleaning - ${boat}`;
    await fetch('https://api.stripe.com/v1/invoiceitems', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `customer=${customerId}&amount=${hullCents}&currency=usd&description=${encodeURIComponent(hullDesc)}`
    });
    
    if (parseFloat(anode) > 0) {
      const anodeCents = Math.round(parseFloat(anode) * 100);
      const anodeDesc = `${serviceDateDisplay} - Anode Replacement: ${anodeType} - ${boat}`;
      await fetch('https://api.stripe.com/v1/invoiceitems', {
        method: 'POST',
        headers: { 
          'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `customer=${customerId}&amount=${anodeCents}&currency=usd&description=${encodeURIComponent(anodeDesc)}`
      });
    }
    
    // Create invoice with clear service date in custom fields
    const collectionMethod = hasCard ? 'charge_automatically' : 'send_invoice';
    let invoiceBody = `customer=${customerId}&collection_method=${collectionMethod}`;
    invoiceBody += `&custom_fields[0][name]=Vessel&custom_fields[0][value]=${encodeURIComponent(boat)}`;
    invoiceBody += `&custom_fields[1][name]=Service Performed&custom_fields[1][value]=${encodeURIComponent(serviceDateDisplay)}`;
    invoiceBody += `&description=${encodeURIComponent(`Monthly hull cleaning service for ${boat}. Service was performed on ${serviceDateDisplay}.`)}`;
    if (!hasCard) invoiceBody += '&days_until_due=7';
    
    const invoiceRes = await fetch('https://api.stripe.com/v1/invoices', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: invoiceBody
    });
    const invoiceData = await invoiceRes.json();
    const invoiceId = invoiceData.id;
    
    // Finalize
    await fetch(`https://api.stripe.com/v1/invoices/${invoiceId}/finalize`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
    });
    
    // Pay or send
    if (hasCard && paymentMethodId) {
      // Explicitly pass payment_method to ensure charge goes through
      await fetch(`https://api.stripe.com/v1/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 
          'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `payment_method=${paymentMethodId}`
      });
      
      // Get charge and send receipt
      const invRes = await fetch(`https://api.stripe.com/v1/invoices/${invoiceId}`, {
        headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
      });
      const invData = await invRes.json();
      
      if (invData.charge) {
        await fetch(`https://api.stripe.com/v1/charges/${invData.charge}`, {
          method: 'POST',
          headers: { 
            'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `receipt_email=${encodeURIComponent(email)}`
        });
      }
    } else {
      await fetch(`https://api.stripe.com/v1/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
      });
    }
    
    // Mark as billed with invoice details (JSON file for richer data)
    const billedJsonPath = join(BILLING_DIR, `${month.toLowerCase().replace(' ', '_')}_billed.json`);
    let billedData: Record<string, any> = {};
    if (existsSync(billedJsonPath)) {
      try {
        billedData = JSON.parse(readFileSync(billedJsonPath, 'utf-8'));
      } catch {}
    }
    billedData[boat] = {
      invoiceId,
      status: hasCard ? 'charged' : 'sent',
      billedAt: new Date().toISOString(),
      amount: total,
      stripeUrl: `https://dashboard.stripe.com/invoices/${invoiceId}`
    };
    writeFileSync(billedJsonPath, JSON.stringify(billedData, null, 2));
    
    // Also keep legacy txt file for backward compat
    const billedPath = join(BILLING_DIR, `${month.toLowerCase().replace(' ', '_')}_billed.txt`);
    const existing = existsSync(billedPath) ? readFileSync(billedPath, 'utf-8') : '';
    if (!existing.split('\n').includes(boat)) {
      writeFileSync(billedPath, existing + (existing ? '\n' : '') + boat);
    }
    
    res.json({ 
      success: true, 
      invoiceId, 
      status: hasCard ? 'charged' : 'sent',
      hasCard,
      stripeUrl: `https://dashboard.stripe.com/invoices/${invoiceId}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Reset billed status for specific boats
app.post('/api/billing/:month/reset', (req, res) => {
  const { month } = req.params;
  const { boats } = req.body;  // Array of boat names to reset
  
  const billedJsonPath = join(BILLING_DIR, `${month}_billed.json`);
  const billedTxtPath = join(BILLING_DIR, `${month}_billed.txt`);
  
  let resetCount = 0;
  
  // Update JSON file
  if (existsSync(billedJsonPath)) {
    try {
      const billedData = JSON.parse(readFileSync(billedJsonPath, 'utf-8'));
      for (const boat of boats) {
        if (billedData[boat]) {
          delete billedData[boat];
          resetCount++;
        }
      }
      writeFileSync(billedJsonPath, JSON.stringify(billedData, null, 2));
    } catch {}
  }
  
  // Update TXT file
  if (existsSync(billedTxtPath)) {
    const existing = readFileSync(billedTxtPath, 'utf-8').split('\n').filter(Boolean);
    const updated = existing.filter(b => !boats.includes(b));
    writeFileSync(billedTxtPath, updated.join('\n'));
  }
  
  res.json({ success: true, resetCount, boats });
});

// ==================== EMAIL ENDPOINTS ====================

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'brian@sailorskills.com';

// Get all clients with email addresses (for email panel)
app.get('/api/email/clients', async (req, res) => {
  const token = getNotionToken();
  if (!token) return res.status(400).json({ error: 'Notion token not configured' });

  try {
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined;

    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            or: [
              { property: 'Plan', select: { equals: 'Subbed' } },
              { property: 'Plan', select: { equals: 'One-time' } }
            ]
          },
          page_size: 100,
          ...(startCursor && { start_cursor: startCursor })
        })
      });

      const data = await response.json();
      allResults = allResults.concat(data.results || []);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const clients = allResults
      .map((page: any) => {
        const props = page.properties;
        return {
          boat: props.Boat?.title?.[0]?.plain_text || 'Unknown',
          firstName: props['First Name']?.rich_text?.[0]?.plain_text || '',
          email: props.Email?.email || null,
          plan: props.Plan?.select?.name || '',
          startTime: props['Start Time']?.date?.start || null,
          serviceLogUrl: props['Service Log']?.url || null
        };
      })
      .filter((c: any) => c.email);

    res.json({ clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load clients' });
  }
});

// Email templates
function renderUpcomingEmail(vars: { firstName: string; boatName: string; monthName: string; seasonalMessage: string; closingMessage: string }) {
  return {
    subject: `${vars.boatName} dive service is coming up!`,
    body: `Hi ${vars.firstName},

${vars.seasonalMessage}

Just a heads-up that ${vars.boatName} is scheduled for dive service this ${vars.monthName}. I'll be in touch closer to the date to coordinate timing.

${vars.closingMessage}

Thanks,
Brian
SailorSkills.com | BrianCline.co`
  };
}

function renderPostServiceEmail(vars: { firstName: string; boatName: string; serviceDate: string; serviceLog: string; note: string; seasonalMessage: string; closingMessage: string }) {
  const datePart = vars.serviceDate
    ? new Date(vars.serviceDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'recently';

  let body = `Hi ${vars.firstName},

${vars.seasonalMessage}

${vars.boatName} was serviced on ${datePart}. Everything is looking good down there!`;

  if (vars.serviceLog) {
    body += `\n\nYou can view the service log here: ${vars.serviceLog}`;
  }

  if (vars.note) {
    body += `\n\n${vars.note}`;
  }

  body += `\n\n${vars.closingMessage}

Thanks,
Brian
SailorSkills.com | BrianCline.co`;

  return {
    subject: `${vars.boatName} has been serviced!`,
    body
  };
}

// Get full client info including service log URL from Notion
async function getFullClientInfo(boatName: string): Promise<{ email: string | null, ownerName: string | null, serviceLogUrl: string | null, firstName: string | null }> {
  const token = getNotionToken();
  if (!token) return { email: null, ownerName: null, serviceLogUrl: null, firstName: null };

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { property: 'Boat', title: { equals: boatName } }
      })
    });

    const data = await response.json();
    const props = data.results?.[0]?.properties;
    if (!props) return { email: null, ownerName: null, serviceLogUrl: null, firstName: null };

    const email = props.Email?.email || null;
    const firstName = props['First Name']?.rich_text?.[0]?.plain_text || null;
    const lastName = props['Last Name']?.rich_text?.[0]?.plain_text || '';
    const ownerName = [firstName, lastName].filter(Boolean).join(' ') || null;
    const serviceLogUrl = props['Service Log']?.url || null;

    return { email, ownerName, serviceLogUrl, firstName };
  } catch {
    return { email: null, ownerName: null, serviceLogUrl: null, firstName: null };
  }
}

// Preview emails
app.post('/api/email/preview', async (req, res) => {
  const token = getNotionToken();
  if (!token) return res.status(400).json({ error: 'Notion token not configured' });

  const { template, boats, seasonalMessage, closingMessage, serviceDate, note, monthName } = req.body;

  try {
    // Get client info for each boat (including per-boat service log URL)
    const previews = await Promise.all((boats as string[]).map(async (boatName) => {
      const { email, ownerName, serviceLogUrl, firstName: fn } = await getFullClientInfo(boatName);
      const firstName = fn || ownerName?.split(' ')[0] || 'there';

      let rendered;
      if (template === 'post-service') {
        rendered = renderPostServiceEmail({
          firstName, boatName, serviceDate, serviceLog: serviceLogUrl || '', note, seasonalMessage, closingMessage
        });
      } else {
        rendered = renderUpcomingEmail({
          firstName, boatName, monthName: monthName || new Date().toLocaleString('en-US', { month: 'long' }),
          seasonalMessage, closingMessage
        });
      }

      return {
        boat: boatName,
        firstName,
        email: email || '',
        subject: rendered.subject,
        body: rendered.body,
        serviceLogUrl,
        status: 'pending' as const
      };
    }));

    res.json({ previews: previews.filter(p => p.email) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate previews' });
  }
});

// Send a single email via Resend
app.post('/api/email/send', async (req, res) => {
  if (!RESEND_API_KEY) {
    return res.status(400).json({ error: 'Resend API key not configured. Add RESEND_API_KEY to .env' });
  }

  const { to, subject, body, boat } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Brian <${FROM_EMAIL}>`,
        to: [to],
        subject,
        text: body
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Email sent to ${to} for ${boat}: ${data.id}`);
      res.json({ success: true, id: data.id });
    } else {
      console.error(`Email failed for ${boat}:`, data);
      res.json({ success: false, error: data.message || 'Send failed' });
    }
  } catch (err) {
    console.error(`Email error for ${boat}:`, err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Get available templates
app.get('/api/email/templates', (req, res) => {
  res.json({
    templates: [
      { id: 'upcoming', name: 'Upcoming Service', description: 'Notify clients about upcoming monthly service' },
      { id: 'post-service', name: 'Post-Service', description: 'Follow up after completing service' }
    ]
  });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';  // Bind to all interfaces for Tailscale access
app.listen(PORT, HOST, () => {
  console.log(`Billing API running on http://${HOST}:${PORT}`);
  console.log(`Notion token: ${getNotionToken() ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`Stripe key: ${stripeKey ? 'configured from env' : 'not set (use POST /api/stripe-key or add STRIPE_SECRET_KEY to .env)'}`);
});

// Generate billing CSV for a month from Notion data (with growth + anode lookup)
// Logic: Bill boats that have a Conditions entry (service log) within the target month
// Query params (all optional):
//   filterPlan=true  - only include Plan = Subbed or One-time (default: false)
//   filterStartTime=true - only include boats with Start Time before end of month (default: false)
app.post('/api/generate/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const filterPlan = req.query.filterPlan === 'true';
  const filterStartTime = req.query.filterStartTime === 'true';
  const token = getNotionToken();
  
  if (!token) {
    return res.status(400).json({ error: 'Notion token not configured' });
  }
  
  const monthNum = parseInt(month);
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = monthNum === 12 
    ? `${parseInt(year) + 1}-01-01`
    : `${year}-${(monthNum + 1).toString().padStart(2, '0')}-01`;
  
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[monthNum];
  
  console.log(`Generating ${monthName} ${year} - filters: Plan=${filterPlan}, StartTime=${filterStartTime}`);
  
  try {
    // Build Notion filter based on options
    let notionFilter: any = undefined;
    
    if (filterPlan && filterStartTime) {
      notionFilter = {
        and: [
          { or: [
            { property: 'Plan', select: { equals: 'Subbed' }},
            { property: 'Plan', select: { equals: 'One-time' }}
          ]},
          { property: 'Start Time', date: { on_or_before: endDate }}
        ]
      };
    } else if (filterPlan) {
      notionFilter = {
        or: [
          { property: 'Plan', select: { equals: 'Subbed' }},
          { property: 'Plan', select: { equals: 'One-time' }}
        ]
      };
    } else if (filterStartTime) {
      notionFilter = {
        property: 'Start Time', date: { on_or_before: endDate }
      };
    }
    // If no filters, query all boats
    
    let allBoats: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    
    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...(notionFilter && { filter: notionFilter }),
          page_size: 100,
          ...(startCursor && { start_cursor: startCursor })
        })
      });
      
      const data = await response.json();
      
      if (!data.results) {
        return res.status(500).json({ error: 'Failed to query Notion', details: data });
      }
      
      allBoats = allBoats.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }
    
    const filterDesc = filterPlan ? 'Plan=Subbed/One-time' : 'all boats';
    console.log(`Found ${allBoats.length} boats (${filterDesc})`);
    
    // Process boats in parallel batches (limit concurrency to avoid rate limits)
    const BATCH_SIZE = 10;
    const boatsWithService: any[] = [];
    
    const processBoat = async (page: any): Promise<any | null> => {
      const props = page.properties;
      const boatPageId = page.id;
      const boat = props.Boat?.title?.[0]?.plain_text || 'Unknown';
      const plan = props.Plan?.select?.name || 'Subbed';
      const length = props.Length?.number || 30;
      const boatType = props['Boat Type']?.select?.name || 'Sail';
      const numProps = props.Props?.number || 1;
      
      try {
        const conditionsDbId = await getConditionsDatabase(boatPageId, token);
        if (!conditionsDbId) return null;
        
        const conditions = await getServiceConditions(conditionsDbId, startDate, endDate, token);
        if (!conditions) return null;
        
        // Found a service entry! Calculate billing
        const serviceDate = conditions.date;
        
        // Base pricing
        const rate = plan === 'One-time' ? 5.99 : 4.49;
        const base = length * rate;
        const typeSurcharge = boatType === 'Power' ? base * 0.25 : 0;
        const propSurcharge = numProps > 1 ? base * 0.10 * (numProps - 1) : 0;
        const baseTotal = base + typeSurcharge + propSurcharge;
        
        // Growth surcharge
        const growth = calculateGrowthSurcharge(conditions.growth);
        const growthPercent = growth.percent;
        const growthDesc = growth.description;
        
        // Anode
        let anodeCost = 0;
        let anodeType = '';
        const anode = parseAnodeFromNotes(conditions.notes, conditions.anodes);
        if (anode) {
          anodeCost = anode.cost;
          anodeType = anode.type;
        }
        
        const growthSurcharge = baseTotal * growthPercent;
        let hullTotal = baseTotal + growthSurcharge;
        let total = hullTotal + anodeCost;
        
        // Apply special pricing rules
        let priceNote = '';
        if (GRATIS_BOATS.includes(boat)) {
          hullTotal = 0;
          total = anodeCost;  // Still charge for anodes if any
          priceNote = 'Gratis';
        } else if (CAPPED_BOATS[boat]) {
          const cap = CAPPED_BOATS[boat];
          if (hullTotal > cap) {
            hullTotal = cap;
            total = hullTotal + anodeCost;
            priceNote = `Capped at $${cap}`;
          }
        }
        
        return {
          boat,
          date: serviceDate,
          length,
          type: boatType,
          plan,
          props: numProps,
          baseTotal: baseTotal.toFixed(2),
          growthPercent: (growthPercent * 100).toFixed(1) + '%',
          growthDesc,
          hullTotal: hullTotal.toFixed(2),
          anode: anodeCost.toFixed(2),
          anodeType,
          total: total.toFixed(2),
          priceNote,
          conditionsFound: true
        };
      } catch (err) {
        console.error(`Error checking conditions for ${boat}:`, err);
        return null;
      }
    };
    
    // Process in batches
    for (let i = 0; i < allBoats.length; i += BATCH_SIZE) {
      const batch = allBoats.slice(i, i + BATCH_SIZE);
      console.log(`Processing boats ${i + 1}-${Math.min(i + BATCH_SIZE, allBoats.length)} of ${allBoats.length}...`);
      
      const results = await Promise.all(batch.map(processBoat));
      boatsWithService.push(...results.filter(r => r !== null));
    }
    
    // Sort by date
    boatsWithService.sort((a: any, b: any) => a.date.localeCompare(b.date));
    
    // Generate CSV content
    const csvHeader = 'Boat,Date,HullTotal,Anode,AnodeType,Total';
    const csvRows = boatsWithService.map((b: any) => 
      `${b.boat},${b.date},${b.hullTotal},${b.anode},${b.anodeType},${b.total}`
    );
    const csv = [csvHeader, ...csvRows].join('\n');
    
    // Save to file
    const filename = `${monthName.toLowerCase()}_${year}_billing.csv`;
    const filepath = join(BILLING_DIR, filename);
    writeFileSync(filepath, csv);
    
    const totalAmount = boatsWithService.reduce((sum: number, b: any) => sum + parseFloat(b.total), 0);
    
    console.log(`Generated ${monthName} ${year}: ${boatsWithService.length} boats serviced, $${totalAmount.toFixed(2)}`);
    
    res.json({
      success: true,
      month: `${monthName} ${year}`,
      filename,
      count: boatsWithService.length,
      totalBoatsChecked: allBoats.length,
      totalAmount: totalAmount.toFixed(2),
      filters: {
        plan: filterPlan,
        startTime: filterStartTime,
        conditionsInMonth: true  // Always required - service must be logged in target month
      },
      boats: boatsWithService
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate billing' });
  }
});
