# Handoff

*Last updated: 2026-02-05 12:55 PST*
*Workspace: ~/clawd*

## Session Summary

Successfully onboarded **Scott Cyphers (Perpetua)** and **Dennis Zinn (Jennie Ann)** to Notion, then updated the onboarding workflow and scripts.

## Completed This Session

### Customer Onboarding
- ✅ **Scott Cyphers (Perpetua)** — full onboarding via script
  - Notion entry, Admin database, Service Log
  - YouTube playlist created
  - Redirect deployed: `/perpetua`
  
- ✅ **Dennis Zinn (Jennie Ann)** — fixed incomplete setup
  - Added missing: Dock (O), Slip (705), Interval (2)
  - Created YouTube playlist
  - Created Conditions database
  - Redirect already existed: `/jennie-ann`

- ✅ Both Service Log pages published and redirects working

### Script & Workflow Updates
- ✅ Updated `onboard-customer.ts` to:
  1. Create Conditions database inside Service Log
  2. Auto-add redirects to vercel.json
  3. Auto-deploy to Vercel
  4. Show prominent reminder about manual Notion publish step

- ✅ Updated workflow documentation:
  - `docs/workflows/new-customer-onboarding.md` — now reflects implemented state

## Key Learnings Captured

**Supabase order data architecture:**
- `boats` table — boat details only (no service interval!)
- `customer_services` table — has `frequency`, `service_type`, `base_price`
- To find a customer's service frequency: check `customer_services` by `boat_id`

**Notion API limitations:**
- Cannot publish pages to web (manual step required)
- Cannot create databases inside synced_blocks
- Conditions database created as direct child of Service Log page instead

## Files Changed

```
~/AI/business/sailorskills/scripts/onboard-customer.ts  (Conditions DB, auto-deploy)
~/AI/business/sailorskills/docs/workflows/new-customer-onboarding.md  (updated docs)
~/AI/business/sailorskills/marketplace/vercel.json  (+perpetua redirect)
```

## Next Steps (if continuing)

1. Test the updated onboard script with the next new customer
2. Consider adding: customer notification email after setup complete
3. Consider adding: auto-trigger from Supabase webhook

## Commits This Session

- `94649de` feat: add /perpetua redirect for Scott Cyphers
- `8986e77` feat(scripts): add Conditions database, auto-deploy redirects, publish reminder
- `0b41c0c` docs: update onboarding workflow to reflect implemented script
