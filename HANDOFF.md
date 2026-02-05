# Handoff

*Last updated: 2026-02-05 10:55 PST*
*Workspace: ~/clawd*

## Current Task

Looking up **Scott Cyphers' order** (boat: Perpetua) to onboard him into Notion.

## State

**Done:**
- Found Scott Cyphers in archived Supabase
- Discovered order data architecture (service interval is in `customer_services` table, NOT `boats`)
- Retrieved full order details

**Ready to do:**
- Onboard Scott Cyphers to Notion using the onboarding script

## Scott Cyphers Order Details

- **Boat**: Perpetua (Corbin MK 1, 39')
- **Marina**: Berkeley, Dock O, Slip 703
- **Email**: scottpcyphers@gmail.com
- **Phone**: 707-337-8436
- **Service**: Recurring Cleaning & Anodes
- **Interval**: Quarterly (3 months)
- **Price**: $205.50
- **Notes**: "All anodes need replacing. I came from fresh water. Thank you."
- **Supabase boat_id**: 52fa0ba4-53da-42ad-aadc-be42df5e9548
- **Created**: 2026-02-02

## Key Discovery

**SailorSkills order data architecture:**
- `boats` table — boat details only (no service interval!)
- `customer_services` table — has `frequency`, `service_type`, `base_price`, `notes`
- `service_orders` table — has `service_interval`
- `service_schedules` table — for recurring, has `interval_months`

**To find a customer's service frequency**: Check `customer_services` table by `boat_id`, not `boats`.

## Next Steps

1. Run onboarding script to add Scott Cyphers to Notion (3-month interval)
2. Confirm onboarding completed successfully

## Other Recent Orders (in customer_services)

- Dennis Zinn — Jennie Ann, bi-monthly, $218.70 (Feb 3) — may also need onboarding
- Greg Barnes — The circus police, one-time, $273.00 (Jan 28)
