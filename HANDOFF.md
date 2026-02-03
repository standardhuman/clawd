# Handoff

*Last updated: 2026-02-03 14:13 PST*
*Branch: main*
*Agent: Howard*

## Current Task

SailorSkills billing system — CLI script + web dashboard for invoicing customers via Stripe.

## State: Ready to Bill

### ✅ Completed This Session

1. **Stripe integration** — CLI connected, test invoice sent & received
   - Restricted API key created: "Howard Billing Automation Key" (in 1Password)
   - Permissions: Customers, Invoices, Charges (Write)
   - Test invoice charged $248 to Brian, receipt received

2. **Notion integration** — Howard token working
   - Token saved in `~/AI/business/sailorskills-platform/.env` as `NOTION_HOWARD_TOKEN`
   - Database: `0ae0e330-780b-4764-956e-12e8ee344ea2`
   - Field name is "Boat" (not "Name") for vessel lookup

3. **January 2026 billing finalized**
   - 52 boats, $9,873.89 total
   - Corrections applied: Halo anode ($28.37 Beneteau 30mm), The Circus Police (one-time rate)
   - CSV: `~/clawd/billing/january_2026_billing.csv`

4. **CLI billing script** — `~/clawd/scripts/billing/sailorskills-invoice.sh`
   - Interactive mode, dry-run, batch, or individual boat billing
   - Tracks billed boats to prevent double-billing
   - Reads Stripe key from 1Password, Notion token from .env

5. **Web dashboard** — `~/clawd/billing-dashboard/`
   - React + Tailwind + Express backend
   - Month selector, billing queue, invoice preview, batch send
   - Start with: `cd ~/clawd/billing-dashboard && npm run dev`
   - Frontend: http://localhost:5173 | Backend: http://localhost:3001

### Documentation Updated
- `~/Obsidian/SailorSkills/Billing System.md` — full pricing rules, script usage
- `~/Obsidian/SailorSkills/January 2026 Billing.md` — corrected totals
- `~/clawd/scripts/billing/README.md` — script reference

## Next Steps

1. **Bill January 2026** — Use dashboard or CLI when Mac Mini is back (need 1Password for Stripe key)
2. **Create February CSV** — Add boats as services complete, bill incrementally
3. **Mac Mini issue** — Brian lost remote access (Tailscale down?). Needs physical power cycle. Set `sudo systemsetup -setrestartpowerfailure on` once back.

## Key Files

| Purpose | Location |
|---------|----------|
| Billing CLI | `~/clawd/scripts/billing/sailorskills-invoice.sh` |
| Web Dashboard | `~/clawd/billing-dashboard/` |
| January CSV | `~/clawd/billing/january_2026_billing.csv` |
| Billed tracker | `~/clawd/billing/january_2026_billed.txt` |
| Notion token | `~/AI/business/sailorskills-platform/.env` (NOTION_HOWARD_TOKEN) |
| Stripe key | 1Password → "Howard Billing Automation Key" |

## Anode Pricing Reference

Formula: `(cost × 1.5) + $15`

| Anode | Cost | Charge |
|-------|------|--------|
| 1" shaft (Camp X-3) | $11.28 | $31.92 |
| Beneteau 30mm prop | $8.91 | $28.37 |
| DF-80 Variprop | $20.97 | $46.46 |
| DP-612H hull (Heavy) | $85.36 | $143.04 |

Lookup other anodes in Supabase `anodes_catalog` table.
