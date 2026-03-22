# Unified Invoices Schema — Agreed Spec

**Date:** 2026-03-18
**Agreed by:** Pro PM, SailorSkills PM, Howard
**Status:** Ready for parallel migration

---

## Schema

```sql
CREATE TABLE invoices (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_log_id              UUID REFERENCES service_logs(id),
  boat_id                     UUID REFERENCES boats(id),
  customer_id                 UUID REFERENCES auth.users(id),
  provider_id                 UUID REFERENCES auth.users(id),
  invoice_number              TEXT,  -- auto-generated via trigger if NULL (PREFIX-YYYYMM-NNNN)
  amount_cents                INT NOT NULL DEFAULT 0,
  currency                    TEXT DEFAULT 'usd',
  status                      TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','sent','paid','overdue','void','cancelled')),
  description                 TEXT,
  line_items                  JSONB DEFAULT '[]',
  due_date                    DATE,
  sent_via                    TEXT,
  sent_at                     TIMESTAMPTZ,
  paid_at                     TIMESTAMPTZ,
  payment_method              TEXT,
  stripe_payment_intent_id    TEXT,
  stripe_checkout_session_id  TEXT,
  payment_token               TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);
```

## Line Items JSONB Shape

```json
[
  {
    "description": "Hull cleaning - monthly service",
    "quantity": 1,
    "unit_price_cents": 15000,
    "amount_cents": 15000,
    "service_type": "hull_cleaning"  // optional
  }
]
```

- `service_type` is optional — Pro populates from service categories, marketplace uses for portal filtering, neither side breaks if absent.
- Top-level `amount_cents` = SUM of line item `amount_cents`.

## Amount Enforcement Trigger

When `line_items` is non-empty, a trigger recomputes `amount_cents` from line items on INSERT/UPDATE. For simple single-amount invoices (empty line_items), application code sets `amount_cents` directly.

```sql
CREATE OR REPLACE FUNCTION recalc_invoice_amount() RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_array_length(COALESCE(NEW.line_items, '[]'::jsonb)) > 0 THEN
    NEW.amount_cents := COALESCE(
      (SELECT SUM(
        COALESCE(
          (item->>'amount_cents')::INT,
          (item->>'quantity')::INT * (item->>'unit_price_cents')::INT
        )
      ) FROM jsonb_array_elements(NEW.line_items) AS item),
      0
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_invoice_amount
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION recalc_invoice_amount();
```

## Invoice Number Auto-Generation Trigger

Fires when `invoice_number IS NULL`. Format: `PREFIX-YYYYMM-NNNN`. Ported from Pro's existing trigger.

## RLS Policies

| Policy | Who | Access |
|--------|-----|--------|
| Provider CRUD | `provider_id = auth.uid()` | Full CRUD on own invoices |
| Customer read | `customer_id = auth.uid()` | Read-only on own invoices |
| Public pay link | `payment_token` match (unauthenticated) | Read single invoice |
| Public portal | Boat's `share_token` match (unauthenticated) | Read invoices for that boat (billing tab) |
| Admin | Admin role | Full CRUD on all invoices |

## Migration Plan — Pro

- Add `customer_id` UUID FK (currently derived from boat owner)
- Rename `amount` DECIMAL(10,2) → `amount_cents` INT (data migration: `amount * 100`)
- Add columns: `currency`, `description`, `line_items`, `due_date`, `updated_at`
- Add `overdue`, `cancelled` to status CHECK constraint
- Add customer-reads RLS policy
- Add amount enforcement trigger
- Fix TS types to match DB

## Migration Plan — Marketplace

- Rename `boat_owner_id` → `customer_id`
- Add columns: `service_log_id`, `sent_via`, `sent_at`, `payment_method`, `stripe_checkout_session_id`, `payment_token`
- Add `void` to status CHECK constraint (keep `overdue`/`cancelled`)
- Add invoice_number auto-generation trigger
- Add amount enforcement trigger
- Fix TS types to match DB

## Decisions

- **`stripe_invoice_id` / `stripe_payment_link`**: Deferred. Neither side uses Stripe Invoices API today. Easy migration later if needed.
- **Amount format**: `amount_cents` INT (Stripe-native, no floating point issues).
- **Status superset**: `draft, sent, paid, overdue, void, cancelled`.
- **Enforcement**: DB trigger, not application code (two apps writing = two places to get math wrong).
- **Migrations**: Parallel — no cross-dependency.

## Overdue Transition — Cron

Daily scheduled job (pg_cron or edge function):

```sql
UPDATE invoices
SET status = 'overdue', updated_at = NOW()
WHERE status = 'sent'
  AND due_date < CURRENT_DATE;
```

Both sides run independently against their own DBs. Provider notifications on overdue flip are a follow-up.

## Void vs Cancelled

Both remain in the CHECK constraint. `void` is the canonical status in application code (standard accounting term). `cancelled` is available as a display alias if the customer portal needs friendlier language. In practice, treat them as equivalent — "this invoice won't be paid."

## Not In Scope

- Stripe Invoices API integration
- Admin role implementation (Pro — marketplace already has it)
