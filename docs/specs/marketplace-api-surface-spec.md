# SailorSkills Marketplace API — MVP Surface Spec

**Date:** March 13, 2026
**Author:** Reese (Product) / Howard (Chief of Staff)
**Status:** Draft — awaiting Brian's review

---

## Who Consumes This

- **Marina management apps** — embed provider search so slip holders can find trusted services
- **Boatyard management systems** — surface trust-ranked providers when scheduling haulouts/repairs
- **Marine service aggregators** — pull verified provider listings with trust signals into their directories

These consumers don't have their own trust data. The API's value is exposing SailorSkills' trust graph — the thing nobody else has.

---

## Auth Model

**API keys**, issued per consumer via an admin dashboard.

- Key sent as `Authorization: Bearer sk_live_...` header
- Each key is scoped to a **marina or geographic region** (consumers only see providers relevant to their area)
- Rate limit: 100 req/min per key (MVP; bump later)
- Keys are revocable. No OAuth for v1 — adds complexity without clear benefit at this stage. Revisit when consumer count exceeds ~10 or if user-delegated access becomes necessary.

Key issuance is manual (Brian approves each partner). This is intentional — the trust model extends to API consumers too.

---

## Endpoints

### 1. `GET /v1/providers/search`

Find providers by skill and location, ranked by trust graph proximity to a reference user (or to the network root if no user context).

**Query params:**
| Param | Type | Required | Example |
|-------|------|----------|---------|
| `skill` | string | yes | `hull_cleaning` |
| `location` | string | no | `Berkeley Marina` |
| `lat` / `lng` | number | no | `37.8652` / `-122.3167` |
| `radius_mi` | number | no | `15` (default: 25) |
| `limit` | integer | no | `10` (default: 10, max: 50) |

**Response** `200 OK`:
```json
{
  "providers": [
    {
      "id": "uuid",
      "name": "Bay Marine Electric",
      "skills": ["electrical", "electronics"],
      "service_area": "East Bay Marinas",
      "trust_tier": "high",
      "trust_score": 0.84,
      "recommendation_summary": {
        "recommend": 18,
        "with_caveats": 2,
        "not_recommended": 0,
        "total_reviews": 20
      },
      "verified": true
    }
  ],
  "meta": { "total": 42, "returned": 10 }
}
```

Trust paths are **not** exposed externally (privacy). Consumers get `trust_tier` (high/medium/low) and a numeric score — enough to rank results without leaking the graph topology.

Backed by the existing `find_providers_by_trust_path` Postgres function, with the API key's scoped region used as the `target_location` default.

---

### 2. `GET /v1/providers/{id}`

Provider profile with reviews and trust connections (public-facing subset).

**Response** `200 OK`:
```json
{
  "id": "uuid",
  "name": "SailorSkills Hull Cleaning",
  "description": "Professional hull cleaning...",
  "skills": ["hull_cleaning"],
  "service_areas": ["Berkeley Marina", "Emeryville Marina"],
  "verified": true,
  "trust_tier": "high",
  "recommendation_summary": {
    "recommend": 23,
    "with_caveats": 3,
    "not_recommended": 1,
    "total_reviews": 27,
    "verified_reviews": 22
  },
  "referral_network": [
    { "provider_id": "uuid", "name": "Bay Marine Electric", "for_skill": "electrical" }
  ],
  "professional_vouches": 5,
  "recent_reviews": [
    {
      "reviewer_name": "Mike R.",
      "marina": "Berkeley Marina",
      "service_type": "hull_cleaning",
      "recommendation": "yes",
      "body": "Fair price, clean work...",
      "service_date": "2026-01",
      "reviewer_verified": true
    }
  ]
}
```

Reviews are public (matching the web app). Provider-to-provider referral links are included — these drive cross-discovery, which is valuable to aggregators.

---

### 3. `GET /v1/trust/path`

Show the trust path between two users or between a user and a provider. This is the "why should I trust this provider?" query.

**Query params:**
| Param | Type | Required |
|-------|------|----------|
| `from_user` | uuid | yes |
| `to_user` OR `to_provider` | uuid | yes |

**Response** `200 OK`:
```json
{
  "connected": true,
  "path_length": 2,
  "trust_tier": "high",
  "path": [
    { "name": "Mike R.", "relationship": "recommends", "strength": "strong" },
    { "name": "Dave S.", "relationship": "worked_with", "strength": "standard" }
  ]
}
```

**Response** `200 OK` (no path):
```json
{
  "connected": false,
  "path_length": null,
  "trust_tier": "none",
  "path": []
}
```

This endpoint is the differentiator. No other marine services platform can answer "how do I know this provider is good?" with an actual chain of trusted relationships. Backed by `get_trust_path_between`.

**Privacy note:** Path data includes first names and relationship types only — no user IDs, no contact info. API consumers can display "Recommended through 2 people you trust" without exposing the graph.

---

### 4. `GET /v1/providers/{id}/recommendations`

Get providers that a specific provider recommends (their referral network). Enables "if you liked X, you might need Y" flows.

**Response** `200 OK`:
```json
{
  "provider_id": "uuid",
  "provider_name": "SailorSkills Hull Cleaning",
  "recommends": [
    {
      "provider_id": "uuid",
      "name": "Bay Marine Electric",
      "skill": "electrical",
      "endorsement": "When I find electrical issues during a hull clean, these are who I call.",
      "vouch_types": ["refer_clients", "trust_their_work"]
    }
  ]
}
```

This powers the "complementary services" use case. A boatyard scheduling a haulout can pull the bottom painter's referral network and offer the boat owner a bundled service package — all pre-vetted through trust connections.

---

## What's Intentionally NOT in v1

- **Write operations** — no creating reviews, vouches, or providers via API. The trust graph is too sensitive to open up without careful consideration of abuse vectors.
- **User management / OAuth** — API consumers don't need to auth as individual users. If that changes, we add OAuth then.
- **Webhooks** — useful eventually (new provider in your area, new review on a provider you surface), but not MVP.
- **Bulk export** — protect the graph. Consumers query, they don't download.

---

## Technical Notes

- Deploy as Supabase Edge Functions (already have the pattern from `boat-assistant`)
- All four endpoints map to existing Postgres functions — no new query logic needed for v1
- API key table: `api_keys(id, key_hash, consumer_name, scoped_region, rate_limit, revoked_at, created_at)`
- Rate limiting via Supabase middleware or edge function wrapper
- Versioned at `/v1/` from day one

---

## Open Questions for Brian

1. **Pricing model?** Free for launch partners, usage-based later? Or always free to drive adoption?
2. **First partner?** Who should we approach first — a marina management system, a boatyard, or a service aggregator?
3. **Trust path privacy:** Spec shows first names only in path responses. Too much? Too little?
