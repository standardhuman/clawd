# Handoff

*Last updated: 2026-02-04 06:51 PST*
*Branch: main*
*Commit: 777ae9b*

## Current Task

January 2026 billing for SailorSkills — invoicing all clients via Stripe.

## State

**Billing is ~95% complete.**

### Done
- Built billing dashboard with Notion integration (auto-fetches growth surcharges, anodes from Conditions databases)
- Fixed critical bug: invoices weren't charging cards because `payment_method` wasn't passed to Stripe `/pay` call
- Charged 31 stuck invoices that were sitting "open"
- Handled Tom Purcell price complaint (voided $135.82, sent new $99 invoice, Brian sent explanation email)
- Marked Bret Laurent (Meliora) as paid by check

### Remaining Open Invoices (correct — no cards on file)
| Amount | Customer | Boat | Notes |
|--------|----------|------|-------|
| $99 | Tom Purcell | Que Sera Sera | New Jan invoice at reduced rate |
| $288.64 | Lexie Price | Innamorata | No card |
| $172.87 | Peter Baczek | Diva | No card |
| $161.64 | Craig Aufenkamp | Salty Lady | No card |
| $148.17 | Paul Weismann | Mojo | No card |
| $202.05 | Greta Mart | Pearl | No card |
| $121.23 | Lu Luna | Msafiri | No card |
| $99 | Tom Purcell | Que Sera Sera | December invoice (unclear if paid) |
| $90 | Casey | ? | **Card declined** — needs follow-up |

### Old Invoices (not from January)
- Shannon Scott $304.02 — December 2025, leave as is
- Tom Purcell $135.82 — Voided (was the original before adjustment)

## Key Context

### Billing Dashboard Location
`~/clawd/billing-dashboard/` — React + Express + Tailwind
- Local: http://localhost:5173
- API: http://localhost:3001
- Start: `cd ~/clawd/billing-dashboard && npm run dev`

### Stripe Key
Stored in `~/clawd/billing-dashboard/.env` (STRIPE_SECRET_KEY)
Also available in 1Password: "Howard Stripe Billing Automation Key"

### The Payment Method Bug (FIXED)
Many Stripe customers have cards attached but no `default_payment_method` set. When we called `/invoices/{id}/pay` without specifying which card, Stripe couldn't charge. Fix: now we explicitly pass `payment_method=${paymentMethodId}` to the pay call.

### Pricing Structure
- Subscription rate: $4.49/ft
- One-time rate: $5.99/ft
- Growth surcharges: Mod→Heavy = 37.5%, Heavy = 50%, Severe = 100%
- Capped boats: Glitch, Twilight Zone, Maiden California, O'Mar @ $99
- Gratis: Junebug (Brian's shared boat)

### Tom Purcell Situation
- Complained about price increase ($99 → $135.82)
- Increase was from growth surcharge (Mod→Heavy = 37.5%)
- Brian decided to honor $99 this time as he hadn't communicated the policy
- Voided original invoice, sent new $99 invoice
- Brian sent explanation email about growth surcharge policy

## Next Steps

1. **Follow up on Casey's declined card** — needs updated payment method
2. **February billing** — Robin is the only boat so far (serviced 2026-02-02, $157.15)
3. **Monitor open invoices** — customers without cards will pay via invoice link

## Files Changed

- `billing-dashboard/server/index.ts` — payment_method fix
- `billing/january_2026_billed.json` — invoice tracking
- `billing/january_2026_billing.csv` — January data

## Related Docs

- `memory/2026-02-03-billing-dashboard.md` — Dashboard build notes
- `memory/2026-02-03-billing-csv-generation.md` — Notion traversal details
