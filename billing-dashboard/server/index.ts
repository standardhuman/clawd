import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load env from sailorskills-platform
const envPath = join(process.env.HOME || '', 'AI/business/sailorskills-platform/.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const app = express();
app.use(cors());
app.use(express.json());

const BILLING_DIR = join(process.env.HOME || '', 'clawd/billing');
const NOTION_DB_ID = '0ae0e330-780b-4764-956e-12e8ee344ea2';

// Store Stripe key in memory (set via API)
let stripeKey: string | null = null;

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
    
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    
    const boats = await Promise.all(lines.slice(1).map(async (line) => {
      const values = line.split(',');
      const boat: any = {};
      headers.forEach((h, i) => boat[h] = values[i]);
      
      // Check if billed
      boat.billed = billedList.includes(boat.Boat);
      
      // Fetch email from Notion
      try {
        const email = await getCustomerEmail(boat.Boat);
        boat.email = email || null;
      } catch {
        boat.email = null;
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

// Get customer email from Notion
async function getCustomerEmail(boatName: string): Promise<string | null> {
  const token = getNotionToken();
  if (!token) return null;
  
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
    return data.results?.[0]?.properties?.Email?.email || null;
  } catch {
    return null;
  }
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
app.post('/api/invoice', async (req, res) => {
  if (!stripeKey) {
    return res.status(400).json({ error: 'Stripe key not configured' });
  }
  
  const { boat, hull, anode, anodeType, total, email, month } = req.body;
  
  try {
    // Find or create customer
    const searchRes = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`, {
      headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
    });
    const searchData = await searchRes.json();
    
    let customerId = searchData.data?.[0]?.id;
    
    if (!customerId) {
      const createRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: { 
          'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `email=${encodeURIComponent(email)}&description=${encodeURIComponent(boat + ' owner')}`
      });
      const createData = await createRes.json();
      customerId = createData.id;
    }
    
    // Check payment method
    const custRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
      headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
    });
    const custData = await custRes.json();
    const hasCard = !!custData.invoice_settings?.default_payment_method;
    
    // Create invoice items
    const hullCents = Math.round(parseFloat(hull) * 100);
    await fetch('https://api.stripe.com/v1/invoiceitems', {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `customer=${customerId}&amount=${hullCents}&currency=usd&description=${encodeURIComponent(`Hull Cleaning - ${boat} - ${month}`)}`
    });
    
    if (parseFloat(anode) > 0) {
      const anodeCents = Math.round(parseFloat(anode) * 100);
      await fetch('https://api.stripe.com/v1/invoiceitems', {
        method: 'POST',
        headers: { 
          'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `customer=${customerId}&amount=${anodeCents}&currency=usd&description=${encodeURIComponent(`Anode: ${anodeType} - Installed`)}`
      });
    }
    
    // Create invoice
    const collectionMethod = hasCard ? 'charge_automatically' : 'send_invoice';
    let invoiceBody = `customer=${customerId}&collection_method=${collectionMethod}&custom_fields[0][name]=Vessel&custom_fields[0][value]=${encodeURIComponent(boat)}&custom_fields[1][name]=Service Date&custom_fields[1][value]=${encodeURIComponent(month)}`;
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
    if (hasCard) {
      await fetch(`https://api.stripe.com/v1/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${Buffer.from(stripeKey + ':').toString('base64')}` }
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
    
    // Mark as billed
    const billedPath = join(BILLING_DIR, `${month.toLowerCase().replace(' ', '_')}_billed.txt`);
    const existing = existsSync(billedPath) ? readFileSync(billedPath, 'utf-8') : '';
    if (!existing.split('\n').includes(boat)) {
      writeFileSync(billedPath, existing + (existing ? '\n' : '') + boat);
    }
    
    res.json({ 
      success: true, 
      invoiceId, 
      status: hasCard ? 'charged' : 'sent',
      hasCard
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Billing API running on http://localhost:${PORT}`);
  console.log(`Notion token: ${getNotionToken() ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`Stripe key: not set (use POST /api/stripe-key)`);
});

// Generate billing CSV for a month from Notion data
app.post('/api/generate/:year/:month', async (req, res) => {
  const { year, month } = req.params;
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
  
  try {
    // Query boats with Plan = Subbed or One-time, and Start Time in the month
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          and: [
            { or: [
              { property: 'Plan', select: { equals: 'Subbed' }},
              { property: 'Plan', select: { equals: 'One-time' }}
            ]},
            { property: 'Start Time', date: { on_or_after: startDate }},
            { property: 'Start Time', date: { before: endDate }}
          ]
        },
        page_size: 100
      })
    });
    
    const data = await response.json();
    
    if (!data.results) {
      return res.status(500).json({ error: 'Failed to query Notion', details: data });
    }
    
    // Process boats and calculate pricing
    const boats = data.results.map((page: any) => {
      const props = page.properties;
      const boat = props.Boat?.title?.[0]?.plain_text || 'Unknown';
      const plan = props.Plan?.select?.name || 'Subbed';
      const startTime = props['Start Time']?.date?.start || '';
      const length = props.Length?.number || 30;
      const boatType = props['Boat Type']?.select?.name || 'Sail';
      const numProps = props.Props?.number || 1;
      
      // Pricing calculation
      const rate = plan === 'One-time' ? 5.99 : 4.49;
      const base = length * rate;
      const typeSurcharge = boatType === 'Power' ? base * 0.25 : 0;
      const propSurcharge = numProps > 1 ? base * 0.10 * (numProps - 1) : 0;
      const hullTotal = base + typeSurcharge + propSurcharge;
      
      // Extract just the date part
      const serviceDate = startTime ? startTime.split('T')[0] : '';
      
      return {
        boat,
        date: serviceDate,
        length,
        type: boatType,
        plan,
        props: numProps,
        hullTotal: hullTotal.toFixed(2),
        anode: '0',
        anodeType: '',
        total: hullTotal.toFixed(2),
        // Extra info for review
        needsGrowth: true
      };
    });
    
    // Sort by date
    boats.sort((a: any, b: any) => a.date.localeCompare(b.date));
    
    // Generate CSV content
    const csvHeader = 'Boat,Date,HullTotal,Anode,AnodeType,Total';
    const csvRows = boats.map((b: any) => 
      `${b.boat},${b.date},${b.hullTotal},${b.anode},${b.anodeType},${b.total}`
    );
    const csv = [csvHeader, ...csvRows].join('\n');
    
    // Save to file
    const filename = `${monthName.toLowerCase()}_${year}_billing.csv`;
    const filepath = join(BILLING_DIR, filename);
    writeFileSync(filepath, csv);
    
    res.json({
      success: true,
      month: `${monthName} ${year}`,
      filename,
      count: boats.length,
      boats,
      note: 'Growth surcharges not included - add manually or edit CSV'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate billing' });
  }
});
