# Handoff

*Last updated: 2026-02-02 17:20 PST*
*Branch: main*
*Agent: Howard*

## Current Task

SailorSkills billing automation — January 2026 billing complete, Stripe workflow designed.

## Completed This Session

### Billing Rules Finalized
- **Graduated growth surcharges** (Brian's clarification):
  - Min→Heavy: 25%, Mod→Heavy: 37.5%, Heavy: 50%, Heavy→Severe: 75%, Severe: 100%
- **Anode formula:** (cost × 1.5) + $15 labor per anode

### January 2026 Billing
- 52 hull cleaning services: $9,125.47
- 9 anodes installed: $444.86
- **Total: $9,570.33**
- Full breakdown in `~/Obsidian/SailorSkills/January 2026 Billing.md`

### Stripe Invoice Design
- Use Stripe Invoices with line items (not simple charges)
- Custom fields: Vessel name, Service Date
- Line items: Hull Cleaning (bundled surcharges), Anodes (separate)
- Workflow: auto-charge if card on file, send invoice if not

### Documentation Created
- `~/Obsidian/SailorSkills/Billing System.md` — full billing reference
- Includes pricing rules, anode catalog, Stripe CLI commands, workflow

### Test Data
- Created "Test Vessel - Howard" in Notion (standardhuman@gmail.com)

## Key Context

### Data Access
- **Notion API:** `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`
- **Notion Client DB:** `0ae0e330-780b-4764-956e-12e8ee344ea2`
- **Supabase:** `fzygakldvvzxmahkdylq.supabase.co`
- **Supabase keys:** In `~/AI/business/sailorskills-platform/sailorskills-inventory/.env`

### 2-Prop Boats (19 total)
Amaterasu, Andiamo, Chew Toy, Could Be Worse, Cowboys Dream, Dark Star, Lil Bear, Loose Eel, One Prolonged Blast, Raindancer II, Ramble On, Rumble, Serenity, Sky Wanderer, Take it Easy, The Circus Police, Truth and Culture, VillaSey, Yachty By Nature

## Next Steps

1. **Stripe CLI login** — need `stripe login` or API key
2. **Test invoice** — send test to Test Vessel - Howard
3. **Build Notion crawler** — current search misses ~40% of Conditions databases
4. **Invoice generation script** — automate the monthly billing process
