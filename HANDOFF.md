# Handoff

*Last updated: 2026-02-02 11:31 PST*
*Branch: main*
*Agent: Howard*

## Current Task

Building a billing automation workflow for Brian's SailorSkills hull cleaning business. Goal: automate monthly billing by reading service logs from Notion, calculating charges with surcharges and anodes, and processing through Stripe.

## State

**Discovery Phase - MOSTLY COMPLETE:**
- Mapped Notion client database structure (100 boats)
- Mapped Conditions database structure (service logs with Date, Growth, Anodes, Installed, Notes)
- Found pricing config in Supabase (growth surcharges, anode markup, labor rates)
- Found anodes_catalog in Supabase with pricing

**Data Collection - PARTIALLY BLOCKED:**
- Found 61 "Conditions" databases via Notion search API
- Queried those and found 28 January 2026 services
- Brian says there should be ~55 services
- **Root cause identified:** Notion search API doesn't index deeply nested databases
- Databases inside "Service Log" child pages aren't showing up in search results

## Key Context

### Notion Structure (per boat)
```
Client List Entry (page in database 0ae0e330-780b-4764-956e-12e8ee344ea2)
├── {Boat} Service Log (child_page)
│   └── {Boat} Conditions (inline database) ← SERVICE DATA HERE
│       - Date, Growth (multi-select), Anodes (multi-select), Installed (number), Notes
└── {Boat} Admin (inline database) ← IGNORE (just time tracking)
```

### Billing Logic
- **Base rate:** $4.50/ft (recurring) or $6.00/ft (one-time)
- **Growth surcharges (from Supabase):**
  - Minimal/Moderate: 0%
  - Heavy: 50%
  - Severe: 100%
- **Powerboat surcharge:** 25%
- **Catamaran surcharge:** 25%
- **Anode pricing:** (cost × 1.5) + $15 labor per anode

### API Keys & Connections
- **Notion API key:** `~/.config/notion/api_key` (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)
- **Notion Client DB:** `0ae0e330-780b-4764-956e-12e8ee344ea2`
- **Supabase (archived):** `fzygakldvvzxmahkdylq.supabase.co` - has anodes_catalog, business_pricing_config
- **Stripe:** CLI installed but not authenticated - need `stripe login` or API key

### Files Created This Session
- `/tmp/conditions_clean.txt` - 61 Conditions database IDs found via search
- `/tmp/all_boats.json` - 100 boats from client database with type, length, props
- `/tmp/boats_with_conditions.txt` - boats where Conditions db was found
- `/tmp/all_boat_names.txt` - all boat names

## Next Steps

1. **Fix database discovery:** Instead of searching, crawl each boat page:
   - Get all 100 boat pages from Client List
   - For each boat, get child blocks → find "Service Log" child_page
   - For that page, get child blocks → find Conditions database (may be nested in columns)
   - Cache the database IDs for reuse

2. **Query all January 2026 services** once we have complete database list

3. **Build billing preview:** Generate a report showing each service with:
   - Boat name, date, type, length
   - Base charge, surcharges, anode charges
   - Total per service

4. **Set up Stripe access:** Either `stripe login` or get API key from Brian

5. **Design charging workflow:** Decide on detailed Stripe line items vs simple total + email receipt

## Open Questions

1. **Growth levels:** Notion uses "Minimal,Heavy" (comma-separated). Does that mean "Heavy" level, or an in-between? I assumed if "Heavy" appears → 50% surcharge
2. **Anode identification:** "612HD" in notes - need to map these shorthand names to anodes_catalog entries
3. **Stripe approach:** Detailed line items in Stripe, or total charge + detailed email receipt?

## Files Changed

- `/Users/brian/clawd/HANDOFF.md` - this file
- Various /tmp files for data caching
