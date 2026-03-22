# Security Review: Supabase Security Advisor Alert (March 15, 2026)

**Reviewed by:** Cyrus (Security Specialist)
**Date:** 2026-03-17
**Trigger:** Supabase Security Advisor email alert

## Executive Summary

Three projects flagged. The **Staging** project (active development) has the most issues and needs remediation. The two deletion-bound projects have low immediate risk given their ~2-week remaining lifespan and empty/test data, but I've documented their issues for completeness.

---

## Risk Assessment by Project

### 1. Sailor Skills - Staging (`dxyzxcmhhhepjndxunwx`)

**Overall:** 🔴 High — This is the active development project and has real security gaps.

#### 🔴 Critical

**4 tables with RLS disabled + full anon access:**
- `boat_owners` — RLS off, anon has SELECT/INSERT/UPDATE/DELETE/TRUNCATE
- `orders` — RLS off, anon has SELECT/INSERT/UPDATE/DELETE/TRUNCATE
- `service_orders` — RLS off, anon has SELECT/INSERT/UPDATE/DELETE/TRUNCATE
- `video_durations` — RLS off, anon has SELECT/INSERT/UPDATE/DELETE/TRUNCATE

**Impact:** Anyone with the project's anon key (embedded in the frontend JS) can read, write, modify, or delete all data in these tables. Currently 0 rows in all four, but as soon as data lands there, it's exposed.

**Remediation:**
```sql
ALTER TABLE boat_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_durations ENABLE ROW LEVEL SECURITY;

-- Then add appropriate policies for each table
-- Example for video_durations (likely provider-owned):
CREATE POLICY "Providers manage their own durations"
  ON video_durations FOR ALL
  USING (true)  -- adjust to actual ownership logic
  WITH CHECK (true);
```

#### 🟡 Medium

**7 SECURITY DEFINER functions without `search_path` set:**
- `get_boat_by_share_token`
- `get_service_logs_by_share_token`
- `get_anodes_by_share_token`
- `get_invoices_by_share_token`
- `get_invoice_by_payment_token`
- `validate_share_token`
- `trigger_service_complete_notification`

**Impact:** A SECURITY DEFINER function without an explicit `search_path` is vulnerable to search path injection. An attacker could create a malicious function in the `public` schema that shadows a system function, then the SECURITY DEFINER function would execute it with elevated privileges.

**Remediation:** Add `SET search_path = public` (or appropriate schemas) to each function:
```sql
CREATE OR REPLACE FUNCTION get_boat_by_share_token(token text)
RETURNS TABLE(...)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  ...
$function$;
```

**5 Edge Functions with JWT verification disabled:**
- `send-notification` — verify_jwt: false
- `send-invoice` — verify_jwt: false
- `stripe-webhook` — verify_jwt: false *(acceptable — Stripe sends webhooks without JWT)*
- `youtube-auth` — verify_jwt: false
- `youtube-upload` — verify_jwt: false

**Impact:** These functions can be called by anyone without authentication. For `stripe-webhook` this is expected (Stripe verifies via signature). For the others, this means unauthenticated users could trigger notifications, invoices, or YouTube operations.

**Remediation:**
- `stripe-webhook`: Keep verify_jwt: false (verify Stripe signature in function body instead)
- `send-notification`, `send-invoice`: Enable JWT verification or add internal auth check
- `youtube-auth`, `youtube-upload`: Enable JWT verification

#### 🟢 Low

**PITR not enabled** — Point-in-Time Recovery is off. Daily backups are running (WAL-G). For a staging project this is acceptable, but should be enabled before production launch.

**Password minimum length is 6** — Below modern recommendations (8+ with complexity). Not critical for staging.

**Email autoconfirm enabled** — Users can sign up and immediately access the app without email verification. Fine for staging/development.

**No network restrictions** — Database accepts connections from 0.0.0.0/0. Standard for Supabase free tier but worth restricting for production.

---

### 2. Delete me by March 31 - Boat Wise (`wtpbptqkbebfserjtyti`)

**Overall:** 🟡 Moderate — 1 issue flagged, minimal risk given deletion timeline.

#### 🟡 Medium

**`spatial_ref_sys` table has RLS disabled + full anon access**

**Impact:** This is a PostGIS system table containing spatial reference system definitions. It's read-only reference data (coordinate system definitions). An attacker could technically INSERT/UPDATE/DELETE rows, but this doesn't expose user data — it's geographic metadata.

**Additional notes:**
- All user-facing tables (boats, profiles, services, etc.) have RLS enabled ✅
- SECURITY DEFINER functions all have `search_path` set ✅
- 2 Edge Functions without JWT: `boat-assistant`, `get-relevant-providers`
- PITR not enabled (irrelevant — project being deleted)

**Risk before deletion:** 🟢 Low. No user data is exposed. The spatial_ref_sys issue is a PostGIS artifact, not a real vulnerability.

---

### 3. Sailor Skills Marketplace and Pro (`aaxnoeirtjlizdhnbqbr`)

**Overall:** 🟡 Moderate — 3 issues flagged, being deleted March 31.

#### 🟡 Medium

**`spatial_ref_sys` table has RLS disabled + full anon access** — Same PostGIS artifact as BoatWise. Not a real data exposure risk.

**18 SECURITY DEFINER functions without `search_path` set** — Including `handle_new_user`, `claim_placeholder_profile`, `search_providers`, and various others. This is a larger attack surface than the other projects.

**7 Edge Functions without JWT verification** — YouTube integration functions and `process-voice`.

**Risk before deletion:** 🟢 Low. The project is being decommissioned. No new development is happening. Unless it's actively serving users in production, these are theoretical risks that will self-resolve on deletion.

⚠️ **However:** If this project is still serving live traffic (real boat owners accessing portals, etc.), the SECURITY DEFINER functions without search_path are a real concern. Verify whether any production traffic still hits this project before ignoring.

---

## Summary of Findings

| Finding | Staging | BoatWise | SS Marketplace |
|---|---|---|---|
| Tables without RLS (exposed to anon) | 🔴 4 tables | 🟡 1 (PostGIS) | 🟡 1 (PostGIS) |
| SECURITY DEFINER without search_path | 🟡 7 functions | ✅ 0 | 🟡 18 functions |
| Edge Functions without JWT | 🟡 5 functions | 🟡 2 functions | 🟡 7 functions |
| PITR disabled | 🟢 (staging) | ✅ (deleting) | ✅ (deleting) |
| Weak password policy | 🟢 6 chars | 🟢 6 chars | 🟢 6 chars |
| Network restrictions | 🟢 Open | 🟢 Open | 🟢 Open |
| Email autoconfirm | 🟢 On | ✅ Off | 🟢 On |

## Recommendations

### Immediate (this week)
1. **Enable RLS on the 4 unprotected Staging tables** — `boat_owners`, `orders`, `service_orders`, `video_durations`. Even though they're empty now, they'll get data soon.
2. **Add `SET search_path = public` to all 7 SECURITY DEFINER functions** in Staging.
3. **Enable JWT verification** on `send-notification`, `send-invoice`, `youtube-auth`, `youtube-upload` edge functions (or add internal auth checks).

### Before production launch
4. Enable PITR on the production project.
5. Increase minimum password length to 8+ with required character classes.
6. Disable email autoconfirm (require email verification).
7. Consider network restrictions if only specific IPs need direct DB access.

### Deletion-bound projects
8. Confirm both BoatWise and SS Marketplace are not serving live production traffic. If they are, the SECURITY DEFINER issues in SS Marketplace need attention.
9. Proceed with March 31 deletion as planned. No urgent remediation needed for either.

## Testing Performed
- [x] RLS policy audit (all public tables across 3 projects)
- [x] SECURITY DEFINER function search_path audit
- [x] Auth configuration review (password policy, MFA, autoconfirm)
- [x] Network restriction review
- [x] Edge function JWT verification audit
- [x] Storage bucket exposure check (all private ✅)
- [x] PITR/backup status check
- [x] Anon role permission audit on unprotected tables
- [ ] Manual penetration test (not performed — would require active exploitation)
- [ ] Secret scanning (CLI token exists at `~/.supabase/access-token` — ensure this isn't committed to git)

## Notes

- The Security Advisor likely flags **6 errors for Staging** as: 4 RLS-disabled tables + the SECURITY DEFINER search_path issue (possibly counted per-function or as one category) + edge function JWT issues. The exact mapping to Supabase's UI categories may differ slightly since I ran equivalent checks via the Management API rather than the dashboard directly.
- The Supabase dashboard's Security Advisor was inaccessible via browser (requires interactive login). All findings were derived from SQL queries via the Management API and REST config endpoints, which cover the same ground.
- The `spatial_ref_sys` table appearing in BoatWise and SS Marketplace is a PostGIS system table — it's a known false positive in Supabase's Security Advisor. Enabling RLS on it isn't typically recommended as it can break PostGIS functionality.
