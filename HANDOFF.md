# Handoff

*Last updated: 2026-02-02 14:31 PST*
*Branch: main*
*Agent: Howard*

## Current Task

Pulled props data and January 2026 anode work from Notion for SailorSkills billing.

## Completed This Session

### Props Data (boats with 2 props)
Yachty By Nature, VillaSey, Truth and Culture, The Circus Police, Take it Easy, Sky Wanderer, Serenity, Rumble, Ramble On, Raindancer II, One Prolonged Blast, Loose Eel, Lil Bear, Dark Star, Cowboys Dream, Could Be Worse, Chew Toy, Andiamo, Amaterasu

### January 2026 Anode Work

| Boat | Date | Anodes | Notes |
|------|------|--------|-------|
| Martha | Jan 14 | Replaced | (no notes) |
| Phoenix | Jan 23 | Replaced | Installed 1" shaft anode |
| **Merope** | Jan 30 | **Missing**, Replaced | Installed 2x heavy duty anodes |
| The Circus Police | Jan 30 | Good, Replaced | Installed 612HD |
| Halo | Jan 26 | Fair, Replaced | Installed prop anode |
| Innamorata | Jan 25 | Replaced | Installed (2) 1" shaft anodes |
| Omega | Jan 11 | Good, Replaced | Replaced one 1-inch shaft anode |
| Bennu | Jan 11 | Replaced | Replaced the shaft anode. Signs of electrolysis on prop abated |

**Merope** is the one marked "Missing" — likely the boat Brian is tracking.

## Key Context

### Notion API Access
- **API key:** `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`
- **Client DB:** `0ae0e330-780b-4764-956e-12e8ee344ea2`
- **Props field:** Number type in client database
- **Conditions databases:** 100 found via search, queried for January data

### Files Created
- `/tmp/conditions_dbs.txt` — All 100 Conditions database IDs with names

## Billing Context (from previous session)

### Billing Logic
- **Base rate:** $4.50/ft (recurring) or $6.00/ft (one-time)
- **Growth surcharges:** Minimal/Moderate: 0%, Heavy: 50%, Severe: 100%
- **Powerboat surcharge:** 25%
- **Catamaran surcharge:** 25%
- **Anode pricing:** (cost × 1.5) + $15 labor per anode

### Outstanding
- Stripe access still needed (`stripe login` or API key)
- Full billing preview not yet generated
- Need to map anode shorthand names (612HD, etc.) to catalog pricing
