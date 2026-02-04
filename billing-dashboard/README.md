# SailorSkills Billing Dashboard

Web interface for reviewing and sending invoices via Stripe.

## Anode Pricing Reference

**Pricing Source:** Supabase `anodes_catalog` table + `pricing_settings` strategy

**Supabase Project:** `fzygakldvvzxmahkdylq` (Archived- Sailor Skills)

**Current Pricing Strategy (as of Feb 2026):**
- 30% markup on supplier cost (sale_price from catalog)
- $2.00 minimum markup
- Round to nearest cent

**Common Shaft Anodes:**
| Size | Product | Supplier Cost | Customer Price |
|------|---------|---------------|----------------|
| 1" standard | Camp X-3 | $11.28 | $14.66 |
| 1" heavy | Camp X-3A | $13.66 | $17.76 |
| 1-1/8" standard | Camp X-4 | $12.94 | $16.82 |
| 1-1/8" heavy | Reliance X-4H | $13.98 | $18.17 |

**To look up pricing:**
1. Query `anodes_catalog` in Supabase for `sale_price`
2. Apply markup: `sale_price × 1.30` (or check `pricing_settings` for current rate)
3. Ensure minimum $2 markup

**Related code:**
- Pricing utility: `sailorskills-platform/sailorskills-billing/src/utils/pricing.js`
- Catalog scraper: `sailorskills-platform/sailorskills-inventory/anode-system/`

## Quick Start

```bash
cd ~/clawd/billing-dashboard
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## First Use

1. Open http://localhost:5173
2. Paste your Stripe key (`rk_live_...`) when prompted
3. Select a billing month
4. Review boats, then send invoices individually or in batch

## Features

- **Month selector** — loads billing CSV from `~/clawd/billing/`
- **Billing queue** — shows all boats with status, email, amounts
- **Filters** — All / Ready / No Email / Billed
- **Invoice preview** — click any boat to see full invoice details
- **Batch send** — select multiple and send at once
- **Real-time status** — updates as invoices are sent

## Billing Files

CSV files should be at: `~/clawd/billing/{month}_{year}_billing.csv`

Format:
```csv
Boat,Date,HullTotal,Anode,AnodeType,Total
Meliora,2026-01-15,125.72,0,,125.72
```

## API

The backend connects to:
- **Notion** (Howard integration) — customer email lookup
- **Stripe** — invoice creation and payment

Notion token is read from `~/AI/business/sailorskills-platform/.env`
Stripe key is provided via the UI (stored in memory only, never persisted)

## Development

```bash
# Frontend only
npm run client

# Backend only
npm run server

# Both
npm run dev
```
