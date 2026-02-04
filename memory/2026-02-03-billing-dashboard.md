# 2026-02-03 Billing Dashboard Session

## Billing Dashboard - Major Features Added

### Location
`~/clawd/billing-dashboard/` - React + Express + Tailwind

### Access
- Local: http://localhost:5173
- Tailscale: http://100.122.230.53:5173 (Mac mini)
- API: port 3001

### Key Features Built Today

1. **Generate Month from Notion**
   - Filters by actual service date in Conditions database (not Start Time)
   - Optional filters: `filterPlan=true`, `filterStartTime=true`
   - Traverses: Client List → Boat Page → Service Log → synced_block → Conditions

2. **Stripe Integration**
   - Invoice line items show date first: "January 9, 2026 - Hull Cleaning - Mojo"
   - Custom field "Service Performed" for clarity
   - Returns stripeUrl for dashboard links

3. **Payment Method Indicator**
   - 💳 = Card on file (auto-charge)
   - 📧 = No card (sends invoice)
   - Shows in Card column + summary bar

4. **Special Pricing Rules** (in server/index.ts)
   ```typescript
   const GRATIS_BOATS = ['Junebug'];  // Brian's shared boat - always free
   const CAPPED_BOATS = {
     'Glitch': 99,
     'Twilight Zone': 99,
     'Maiden California': 99,
     "O'Mar": 99
   };
   ```

5. **Billed Status with Stripe Links**
   - Saved to `{month}_billed.json` with invoiceId, stripeUrl, status
   - Dashboard shows clickable "✓ Charged" or "✓ Sent" linking to Stripe

6. **Bulk Reset**
   - Select boats with checkboxes
   - "Reset X Billed" button to clear billed status for selected boats

### Database Name Fix
Conditions databases can be named "Conditions" OR "Service" - code searches for both.
Fixed Junebug ("Junebug Service" → "Junebug Conditions") and Solo ("Services (1)" → "Solo Conditions").

### Test Vessel Created in Notion
- 38ft Power boat, 2 props
- Owner: Brian Cline, standardhuman@gmail.com
- Has January 15 service with Mod→Heavy growth + 2x 1" shaft anodes
- Used for testing billing flow

### Important: Stripe Key
Stripe key is stored in memory only - needs to be re-entered after server restart.
Key location: 1Password "Howard Stripe Billing Automation Key"

### January 2026 Final Numbers
- 53 boats serviced
- ~$9,711.90 total (after caps and gratis applied)
