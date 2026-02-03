# SailorSkills Billing System

## Overview

Automated billing for SailorSkills hull cleaning services via Stripe invoices.

## Files

```
~/clawd/
├── billing/                          # Monthly billing data
│   ├── january_2026_billing.csv      # Services to bill
│   ├── january_2026_billed.txt       # Boats already billed (prevents double-billing)
│   ├── february_2026_billing.csv     # Next month (create as needed)
│   └── ...
├── scripts/billing/
│   ├── sailorskills-invoice.sh       # Main billing script
│   ├── invoice-january.sh            # Legacy January-specific script
│   └── README.md                     # This file
```

## Quick Start

### 1. Create Monthly Billing File

Create `~/clawd/billing/{month}_{year}_billing.csv`:

```csv
Boat,Date,HullTotal,Anode,AnodeType,Total
Meliora,2026-02-15,125.72,0,,125.72
Omega,2026-02-20,152.66,31.92,1" shaft,184.58
```

### 2. Bill Boats

```bash
cd ~/clawd/scripts/billing

# Interactive mode (recommended)
./sailorskills-invoice.sh

# List unbilled boats
./sailorskills-invoice.sh --list

# Dry run (preview without charging)
./sailorskills-invoice.sh --dry-run

# Bill specific boat(s)
./sailorskills-invoice.sh "Meliora"
./sailorskills-invoice.sh "Meliora" "Omega" "Halo"

# Bill all unbilled
./sailorskills-invoice.sh --all
```

## Daily Workflow

After each day of diving:

1. Add completed services to the month's billing CSV
2. Run `./sailorskills-invoice.sh "Boat1" "Boat2" ...` for the boats you serviced
3. Done! Boats are marked as billed to prevent double-billing

## CSV Format

| Column | Description | Example |
|--------|-------------|---------|
| Boat | Vessel name (must match Notion) | Meliora |
| Date | Service date | 2026-02-15 |
| HullTotal | Hull cleaning charge | 125.72 |
| Anode | Anode charge (0 if none) | 31.92 |
| AnodeType | Anode description | 1" shaft |
| Total | HullTotal + Anode | 157.64 |

## Pricing Reference

### Hull Cleaning
- **Recurring:** $4.49/ft
- **One-time:** $5.99/ft
- **Powerboat/Cat:** +25%
- **2nd prop:** +10%

### Growth Surcharges
| Transition | Surcharge |
|------------|-----------|
| Minimal only | 0% |
| Mod only | 0% |
| Min→Heavy | 25% |
| Mod→Heavy | 37.5% |
| Heavy only | 50% |
| Heavy→Severe | 75% |
| Severe only | 100% |

### Anode Pricing
Formula: **(cost × 1.5) + $15 labor**

| Anode | Your Cost | Charge |
|-------|-----------|--------|
| 1" shaft (Camp X-3) | $11.28 | $31.92 |
| DP-612H hull (Heavy) | $85.36 | $143.04 |
| Beneteau 30mm prop | $8.91 | $28.37 |
| DF-80 Variprop | $20.97 | $46.46 |

Look up other anodes in Supabase `anodes_catalog` table.

## Requirements

- **1Password CLI** (`op`) - for API key access
- **Stripe key** in 1Password: "Howard Billing Automation Key"
- **Notion key** in 1Password: "Notion API Key" (for customer email lookup)
- Customer emails must be in Notion Client List database

## Stripe Behavior

- **Card on file:** Charges immediately, sends receipt
- **No card:** Sends invoice with payment link (7 days due)

## Troubleshooting

### "No email in Notion"
- Check boat name matches exactly in Notion Client List
- Ensure Email field is filled for that customer

### "Failed to get Stripe customer"  
- Check 1Password authentication
- Verify Stripe key permissions (Customers, Invoices, Charges: Write)

### Double-billing prevention
- Billed boats tracked in `{month}_billed.txt`
- To re-bill, remove boat name from that file

## Full Documentation

- Billing System: `~/Obsidian/SailorSkills/Billing System.md`
- January Billing: `~/Obsidian/SailorSkills/January 2026 Billing.md`
