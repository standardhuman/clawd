# Handoff

*Last updated: 2026-02-03 15:10 PST*
*Branch: main*
*Agent: Howard*

## Current State: Billing Dashboard with Auto-Conditions

### ✅ Completed

1. **Notion Conditions traversal working**
   - Path: Client List → Boat Page → Service Log → synced_block → Conditions
   - Auto-extracts growth levels and anode replacements
   - Found 50/53 boats' conditions for January 2026

2. **Billing dashboard** — `~/clawd/billing-dashboard/`
   - "Generate Month" button pulls from Notion automatically
   - Calculates growth surcharges from Conditions multi-select
   - Parses anode types from Notes field
   - Start: `cd ~/clawd/billing-dashboard && npm run dev`

3. **CLI billing script** — `~/clawd/scripts/billing/sailorskills-invoice.sh`

4. **Stripe integration** — Test invoice sent successfully
   - Key in 1Password: "Howard Billing Automation Key"

### 🔧 Still Manual

- $99 caps for Glitch, Twilight Zone, Maiden California
- Some anode type edge cases (Notes text parsing)
- January total: $9,622.54 auto-calculated vs $9,873.89 manual (caps + anode diffs)

### Key Files

| Purpose | Location |
|---------|----------|
| Billing Dashboard | `~/clawd/billing-dashboard/` |
| Notion helpers | `~/clawd/billing-dashboard/server/notion-helpers.ts` |
| January CSV | `~/clawd/billing/january_2026_billing.csv` |
| Memory: Notion structure | `~/clawd/memory/2026-02-03.md` |

### Notion API Reference

```
Conditions path: Boat Page → Service Log (child_page) → synced_block → Conditions (child_database)
Fields: Date, Growth (multi-select), Anodes (multi-select), Installed (number), Notes (rich_text)
```

### Next Steps

1. Add $99 cap logic for specific boats
2. Bill January 2026 via dashboard
3. Test February generation with Robin
