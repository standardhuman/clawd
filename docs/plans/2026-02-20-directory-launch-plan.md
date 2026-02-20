# SailorSkills Directory Launch Plan

**Date:** February 20, 2026
**Goal:** Get the marine services directory live and to market ASAP
**Context:** Rebrand — "SailorSkills" becomes the marketplace. Brian's dive business gets a new name (BC Marine, Brian's Beautiful Bottoms, etc.)

---

## The Situation

### What We Have
- **marketplace.sailorskills.com** — React/Vite SPA on Vercel, already has:
  - Service provider directory with search, categories, location-based filtering
  - PostGIS-powered `get_relevant_providers` RPC for geo-search
  - Provider profile pages
  - AI troubleshooting assistant (Claude-powered)
  - Cost estimator, boat portal, service logs, billing
  - Auth, invoicing, Stripe integration
  - Supabase backend (production: `aaxnoeirtjlizdhnbqbr`)
  - Boat name redirects in vercel.json (e.g., /jennie-ann → Notion service log)
- **sailorskills.com** — Currently on Wix (Brian's hull cleaning business site)
- **SailorSkills Pro** — iOS app for service providers (hull cleaners, divers)
- **173+ boats** in Notion client database
- **~100 active customers** receiving service log links

### What Needs to Happen
1. `sailorskills.com` → the marketplace (directory + AI assistant + boat owner portal)
2. Brian's dive business → new brand (new name, new domain, but still a featured provider ON the marketplace)
3. Directory seeded with real Bay Area marine service providers
4. SEO optimized for "hull cleaning San Francisco", "marine services Bay Area", etc.

---

## The Rebrand

| Before | After |
|--------|-------|
| sailorskills.com = Brian's dive business | sailorskills.com = The Marketplace |
| marketplace.sailorskills.com = marketplace | sailorskills.com = marketplace (primary domain) |
| "SailorSkills" = hull cleaning company | "SailorSkills" = marine services platform |
| Brian IS SailorSkills | Brian's new brand is ONE provider on SailorSkills |

Brian's dive business becomes a provider profile on the marketplace, with its own branding. The marketplace is the platform; Brian's business is the anchor tenant.

---

## Phase 1: Seed the Directory (This Weekend)

**Goal:** 50+ real marine service providers in the database, live and searchable.

### Step 1: Define Categories (Update from current)
Current categories are too narrow. Expand to match the annual plan:

```
Hull Cleaning & Diving
Bottom Painting
Detailing & Brightwork
Engine & Mechanical
Electrical & Electronics
Rigging & Sailmaking
Fiberglass & Gelcoat
Canvas & Upholstery
Plumbing & Systems
Marine Surveying
Sailing Instruction
Boat Transport & Hauling
General Maintenance
```

### Step 2: Scrape & Enrich (Frey Chu Playbook)
1. **Outscraper** — Pull Google Maps data for marine services in SF Bay Area
   - Search queries: "hull cleaning [marina]", "marine mechanic [city]", "boat repair [city]", "rigger [city]", "marine electrician [city]"
   - Geographies: Berkeley, Emeryville, Oakland, Alameda, Sausalito, Richmond, San Francisco, Redwood City
   - Fields: name, address, phone, website, rating, reviews, categories, hours
   - Cost: ~$20-30 for 200-500 results

2. **Claude Code enrichment** — For each provider:
   - Classify into our service categories
   - Extract description from website (if available)
   - Normalize address to geocodable format
   - Flag duplicates

3. **Crawl4AI verification** — Spot-check websites are live, pull additional details

4. **Brian's personal knowledge** — The real moat:
   - Flag providers Brian knows personally → "Verified" status
   - Add providers NOT on Google (dock-side operators, word-of-mouth only)
   - Add notes on specialties, quality, reliability
   - Set Brian's new business as the featured hull cleaning provider

### Step 3: Load into Supabase
- Bulk insert into `service_providers` table
- Geocode addresses → PostGIS `location` field
- Set `is_active = true`, populate `google_place_id` where available

### Step 4: Brian's Business as Anchor Provider
- Create provider profile for Brian's new brand
- Migrate service history from Notion (showcase 173+ boats served)
- Feature as "Trusted Provider" with verified badge
- Link to SailorSkills Pro for instant booking

---

## Phase 2: Make It Discoverable (Week 1)

### SEO
- **Server-side rendering** — Current SPA won't index well. Options:
  - Add `@tanstack/react-router` SSR, OR
  - Generate static provider pages at build time, OR  
  - Proxy key pages through a lightweight Next.js layer
- **Meta tags** — Title, description, OG tags for every provider and category page
- **Structured data** — Schema.org `LocalBusiness` markup on provider pages
- **Location pages** — `/hull-cleaning/berkeley`, `/marine-electrician/alameda`, etc.
- **Sitemap.xml** — Auto-generated from provider + category data

### Domain Cutover
1. Point `sailorskills.com` DNS from Wix to Vercel
2. Keep boat-name redirects (vercel.json) for existing customers
3. Set up `www.sailorskills.com` → `sailorskills.com` redirect
4. Brian's new brand gets its own subdomain or external domain

### Landing Page
- Rewrite hero: "Find Trusted Marine Services in the Bay Area"
- Prominent search bar: search by service type + location
- Featured providers section (Brian's business = #1)
- "AI Boat Expert" assistant still accessible
- Trust signals: "50+ verified providers", "serving SF Bay since 2020"

---

## Phase 3: Go to Market (Week 2-3)

### Immediate Distribution
1. **Brian's 100+ existing customers** — Email blast: "SailorSkills just got bigger. Find any marine service you need."
2. **Marina bulletin boards** — QR code flyers at Berkeley, Emeryville, Oakland, Alameda marinas
3. **Facebook Groups** — "SF Bay Sailors", "Berkeley Marina Community", etc.
4. **Latitude 38 Crew Party** (March 5) — Perfect launch event. Print cards, talk it up.

### Provider Outreach
- Email/call the 15-20 providers Brian knows: "We're building the Bay Area's marine services directory. Want a free listing?"
- Free listings create supply. Paid "featured" listings ($50-100/mo) come later.
- Every provider Brian lists is a potential SailorSkills Pro customer down the road.

### Content
- Blog posts targeting long-tail SEO:
  - "Best Hull Cleaning Services in Berkeley Marina"
  - "How to Find a Marine Diesel Mechanic in the Bay Area"
  - "SF Bay Boat Maintenance Guide 2026"
- These pages attract organic traffic AND provide value to boat owners

---

## Phase 4: Monetize (Month 2+)

### Free Tier (All Providers)
- Basic listing: name, address, phone, categories, rating
- Pulled from Google Places data

### Featured Listing ($50-100/mo)
- Enhanced profile with photos, description, portfolio
- Priority placement in search results
- "Featured" badge
- Lead notifications (quote requests from boat owners)
- This IS the SailorSkills Pro funnel — featured listing → try Pro → subscribe

### Lead Gen (Future)
- Quote requests from boat owners → sent to relevant providers
- Pro subscribers get leads first, free listings get leftovers
- Transaction fee (5-10%) on bookings made through platform

---

## Technical Tasks (Jacques)

### Must-Do (This Weekend)
- [ ] Update service categories in `Services.tsx`
- [ ] Build bulk import script for `service_providers` table (CSV/JSON → Supabase)
- [ ] Add provider description field to listing cards
- [ ] Ensure `get_relevant_providers` RPC works with new categories
- [ ] Test geo-search with real Bay Area coordinates

### Should-Do (Week 1)
- [ ] Add SSR or static generation for SEO
- [ ] Add Schema.org structured data to provider pages
- [ ] Generate sitemap.xml from provider data
- [ ] Create location-based landing pages (`/hull-cleaning/berkeley`)
- [ ] Update hero section for directory-first messaging
- [ ] Add "Claim This Listing" flow for providers

### Nice-to-Have (Week 2+)
- [ ] Provider self-service dashboard (edit listing, add photos)
- [ ] "Request Quote" flow → email notification to provider
- [ ] Review/rating system (boat owners rate providers)
- [ ] Blog/content CMS for SEO articles
- [ ] Analytics dashboard (which providers get viewed most)

---

## Data Collection Plan

### Outscraper Queries (~$25)
```
"hull cleaning" near Berkeley, CA
"boat cleaning" near Alameda, CA
"marine mechanic" near Oakland, CA
"marine diesel" near San Francisco, CA
"boat electrician" near Sausalito, CA
"marine electronics" near Emeryville, CA
"sailmaker" near San Francisco, CA
"rigger" near Alameda, CA
"fiberglass repair" near Oakland, CA
"bottom painting" near Richmond, CA
"canvas boat" near Berkeley, CA
"marine surveyor" near San Francisco, CA
"yacht maintenance" near Sausalito, CA
"boat detailing" near Alameda, CA
```

### Brian's Personal List (Priority — Can't Be Scraped)
Brian to list every marine service provider he knows personally:
- Name, service type, location/marina, phone, any notes
- This is the moat. Google has the same scrape data everyone else has.
- Brian's personal knowledge of who's good, who's reliable, who to avoid — that's the value.

---

## Timeline

| When | What | Who |
|------|------|-----|
| **Fri-Sat** | Outscraper data pull + Claude enrichment | Howard/Jacques |
| **Sat** | Brian lists personal provider contacts | Brian |
| **Sat-Sun** | Bulk import to Supabase, verify geo-search works | Jacques |
| **Sun** | Update marketplace hero, categories, landing page | Jacques |
| **Mon** | DNS cutover: sailorskills.com → marketplace | Brian (DNS) |
| **Mon-Tue** | SEO: structured data, sitemap, meta tags | Jacques |
| **Wed** | Customer email blast + Facebook posts | Brian |
| **Mar 5** | Latitude 38 Crew Party — soft launch | Brian |

---

## Success Metrics (30 Days)

- [ ] 50+ providers listed
- [ ] sailorskills.com pointing to marketplace
- [ ] Brian's new brand as featured provider
- [ ] 500+ unique visitors in first month
- [ ] 10+ "Request Quote" submissions
- [ ] 3+ providers claim their listings
- [ ] First organic Google traffic for marine service searches

---

## Open Decisions for Brian

1. **New business name** — BC Marine? Brian's Beautiful Bottoms? Something else?
2. **Do we keep the Wix site at all?** Or nuke it entirely once DNS moves?
3. **Outscraper budget** — $25-30 OK for initial data pull?
4. **Featured listing pricing** — $50/mo? $100/mo? Free for first 3 months?
5. **Do existing /boatname redirects stay?** (Currently in vercel.json, pointing to Notion)
