# Handoff

*Last updated: 2026-02-03 18:57 PST*
*Branch: main*
*Agent: Howard*

## Current Task

SailorSkills billing dashboard - fully functional with Notion integration, Stripe invoicing, and special pricing rules.

## State: Ready to Bill January 2026

### ✅ Done

1. **Billing Dashboard** — `~/clawd/billing-dashboard/`
   - React + Tailwind + Express
   - Accessible via Tailscale: http://100.122.230.53:5173
   - Generate Month pulls from Notion Conditions databases
   - Shows payment method status (💳 card / 📧 invoice)
   - Stripe links for billed boats
   - Bulk select + reset functionality

2. **Service Date Clarity in Stripe**
   - Line items: "January 9, 2026 - Hull Cleaning - Boat"
   - Custom field: "Service Performed: January 9, 2026"
   - Invoice description explains billing for past service

3. **Special Pricing Rules**
   - Gratis: Junebug (Brian's shared boat)
   - $99 cap: Glitch, Twilight Zone, Maiden California, O'Mar

4. **January 2026 Ready**
   - 53 boats, ~$9,711.90 total
   - All Conditions databases found (fixed naming for Junebug, Solo)

5. **Test Vessel** in Notion
   - 38ft Power, 2 props, Brian Cline owner
   - Service log with growth surcharges + anodes
   - Used for testing billing flow

### 🔧 Notes

- **Stripe key** resets on server restart - enter in dashboard or via API
- Key in 1Password: "Howard Stripe Billing Automation Key"
- Server runs on port 3001, Vite on 5173

## Files Changed This Session

| File | Purpose |
|------|---------|
| `billing-dashboard/server/index.ts` | API + special pricing rules |
| `billing-dashboard/server/notion-helpers.ts` | Broader DB name matching |
| `billing-dashboard/src/App.tsx` | UI + Stripe links + reset |
| `billing-dashboard/package.json` | Added --host for Tailscale |

## Next Steps

1. **Bill January 2026** — Open dashboard, set Stripe key, review, send
2. **Test with Test Vessel** — Verify full flow works
3. **Bill February incrementally** — As services complete
