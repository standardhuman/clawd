# SailorSkills Billing Dashboard

Web interface for reviewing and sending invoices via Stripe.

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
