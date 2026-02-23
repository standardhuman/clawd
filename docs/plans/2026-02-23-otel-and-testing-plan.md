# OpenTelemetry + Automated Testing Plan
## SailorSkills Marketplace & SailorSkills Pro

*Prepared: February 23, 2026*

---

## Executive Summary

Both apps currently have minimal test coverage and zero observability. The marketplace has 7 test files (~1,093 lines) covering auth and portal components. Pro has 8 test files covering unit logic and one voice-processing integration test. Neither app has OpenTelemetry, error tracking, or performance monitoring.

**The goal:** Ship both apps with confidence. Know when things break before users tell you. Understand performance bottlenecks. Build a safety net that lets you move fast.

---

## Part 1: OpenTelemetry

### Why OTel (not Sentry, not Datadog)

- **Vendor-neutral:** Data goes wherever you want — Grafana Cloud free tier, self-hosted Jaeger, or upgrade later
- **Single standard:** Same SDK for both web (marketplace) and React Native (Pro)
- **Cost:** $0 with Grafana Cloud free tier (50GB traces, 50GB logs, 50GB metrics/month) or self-hosted on the Mac mini
- **Future-proof:** If you ever add a backend service, it's the same telemetry pipeline

### Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│  Marketplace (Web)  │     │  SailorSkills Pro     │
│  @opentelemetry/    │     │  (React Native)       │
│  sdk-trace-web      │     │  @opentelemetry/      │
│  + auto-instrument  │     │  sdk-trace-base       │
└─────────┬───────────┘     └──────────┬────────────┘
          │                            │
          │  OTLP/HTTP (JSON)          │  OTLP/HTTP (JSON)
          ▼                            ▼
┌─────────────────────────────────────────────────────┐
│  OTel Collector (Mac mini or Grafana Cloud)         │
│  - Receives traces, metrics, logs                   │
│  - Exports to Grafana Cloud / local Jaeger          │
└─────────────────────────────────────────────────────┘
```

### Marketplace OTel Implementation

**Stack:** `@opentelemetry/sdk-trace-web` + `@opentelemetry/auto-instrumentations-web`

**What we instrument:**
1. **Page loads** — Web Vitals (LCP, FID, CLS) via `@opentelemetry/instrumentation-document-load`
2. **Supabase queries** — Custom spans wrapping every `supabase.from()` call (query name, table, duration, error)
3. **User interactions** — `@opentelemetry/instrumentation-user-interaction` (click, form submit)
4. **Fetch/XHR** — `@opentelemetry/instrumentation-fetch` (all API calls, including Supabase REST)
5. **Route changes** — Custom spans on React Router navigation
6. **Errors** — Unhandled exceptions + promise rejections → error spans

**Key traces to capture:**
- `review.submit` — full flow from form open → validation → Supabase insert → trigger fires → stats update
- `recommendation_request.create` — request → fan-out trigger → recipient count
- `provider.search` — search query → Supabase filter → social proof batch → render
- `auth.flow` — sign in/up → session restore → role check → redirect
- `claim_listing.submit` — form → insert → admin notification

**Implementation:**

```typescript
// src/lib/telemetry.ts
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const resource = new Resource({
  'service.name': 'sailorskills-marketplace',
  'service.version': process.env.VITE_APP_VERSION || 'dev',
  'deployment.environment': import.meta.env.MODE,
});

const provider = new WebTracerProvider({ resource });

provider.addSpanProcessor(new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: import.meta.env.VITE_OTEL_ENDPOINT || 'https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/traces',
    headers: {
      'Authorization': `Basic ${import.meta.env.VITE_GRAFANA_TOKEN}`,
    },
  })
));

provider.register({ contextManager: new ZoneContextManager() });

registerInstrumentations({
  instrumentations: [getWebAutoInstrumentations({
    '@opentelemetry/instrumentation-fetch': { 
      propagateTraceHeaderCorsUrls: [/supabase\.co/],
    },
    '@opentelemetry/instrumentation-document-load': {},
    '@opentelemetry/instrumentation-user-interaction': {},
  })],
});

export const tracer = provider.getTracer('marketplace');
```

**Custom Supabase wrapper:**

```typescript
// src/lib/instrumented-supabase.ts
import { tracer } from './telemetry';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';

export function tracedQuery<T>(
  name: string, 
  table: string, 
  queryFn: () => Promise<{ data: T; error: any }>
) {
  return tracer.startActiveSpan(`supabase.${name}`, { 
    kind: SpanKind.CLIENT,
    attributes: { 'db.system': 'postgresql', 'db.operation': name, 'db.table': table }
  }, async (span) => {
    try {
      const result = await queryFn();
      if (result.error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: result.error.message });
        span.setAttribute('error.code', result.error.code);
      }
      span.setAttribute('db.row_count', Array.isArray(result.data) ? result.data.length : 1);
      return result;
    } catch (e: any) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      throw e;
    } finally {
      span.end();
    }
  });
}
```

### SailorSkills Pro OTel Implementation

**Stack:** `@opentelemetry/sdk-trace-base` + custom React Native instrumentations

React Native doesn't have the web auto-instrumentations, so we instrument manually — but it's actually simpler because the app has fewer interaction patterns.

**What we instrument:**
1. **Screen navigation** — Custom spans on screen focus/blur (React Navigation)
2. **Supabase queries** — Same wrapper as marketplace
3. **Voice recording flow** — `record.start` → `record.stop` → `upload` → `transcription` → `extraction`
4. **BLE/GoPro** — `ble.scan` → `ble.connect` → `gopro.wifi_enable` → `gopro.control`
5. **Offline queue** — `queue.add` → `queue.sync` (with offline duration metric)
6. **Photo capture** — `photo.capture` → `photo.compress` → `photo.upload`
7. **Service log creation** — Full flow span with child spans for each step
8. **App startup** — Cold start time, auth check, initial data load

**Key traces:**
- `service_log.create` — The critical path: navigate → record → AI extract → review → approve → save → schedule update
- `voice.process` — Recording → upload → Whisper transcription → Gemini extraction → structured data
- `gopro.session` — BLE scan → connect → WiFi AP → media transfer
- `offline.sync` — Queue drain with retry tracking
- `follow_up.lifecycle` — Creation → pre-service briefing → completion

**Implementation:**

```typescript
// src/lib/telemetry.ts (React Native)
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';

const resource = new Resource({
  'service.name': 'sailorskills-pro',
  'service.version': '1.0.0',
  'device.type': Platform.OS,
});

const provider = new BasicTracerProvider({ resource });

provider.addSpanProcessor(new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: 'https://otlp-gateway-prod-us-central-0.grafana.net/otlp/v1/traces',
    headers: { 'Authorization': `Basic ${GRAFANA_TOKEN}` },
  }),
  { maxExportBatchSize: 20, scheduledDelayMillis: 5000 }
));

provider.register();
export const tracer = provider.getTracer('pro');
```

### OTel Collector Options

**Option A: Grafana Cloud (recommended to start)**
- Free tier: 50GB traces, 50GB logs, 50GB metrics/month
- Zero infrastructure to manage
- Pre-built dashboards
- Sign up → get OTLP endpoint + API key → done

**Option B: Self-hosted on Mac mini**
- Run OTel Collector + Jaeger + Prometheus via Docker Compose
- Full control, zero cost, but another thing to maintain
- Good for later when you want custom dashboards

**Recommendation:** Start with Grafana Cloud free tier. It's 10 minutes to set up and zero maintenance. Move self-hosted later if costs grow.

### Metrics to Track (Custom)

**Marketplace:**
- `marketplace.search.duration` — How long provider searches take
- `marketplace.review.submitted` — Counter with service_type, recommendation attributes
- `marketplace.recommendation_request.created` — Counter with visibility scope
- `marketplace.recommendation_request.response_time` — How fast neighbors respond
- `marketplace.social_proof.hit_rate` — % of provider views where user sees known recommenders
- `marketplace.claim_listing.conversion` — View → claim → approved funnel

**Pro:**
- `pro.service_log.duration` — Full create flow time
- `pro.voice.transcription_time` — Whisper processing time
- `pro.voice.extraction_accuracy` — Manual edits after AI extraction
- `pro.offline.queue_depth` — Current offline queue size
- `pro.offline.sync_failures` — Failed sync attempts
- `pro.ble.scan_duration` — Time to find GoPro
- `pro.photo.upload_size` — Bytes uploaded per photo
- `pro.follow_up.completion_rate` — Follow-ups completed vs created

---

## Part 2: Automated Testing

### Current State

| | Marketplace | Pro |
|---|---|---|
| **Test files** | 7 | 8 |
| **Test lines** | ~1,093 | ~800 |
| **Coverage** | Auth + Portal only | Unit logic + voice integration |
| **E2E** | None | Maestro (configured, no tests) |
| **CI** | None | None |

### Testing Strategy

Three layers, prioritized by ROI:

#### Layer 1: Unit Tests (highest ROI, run in <10s)

**Marketplace — 14 new test files:**

| File | What it tests | Priority |
|---|---|---|
| `useProviderReviews.test.ts` | Review CRUD, stats calculation, duplicate detection | P0 |
| `useRecommendationRequests.test.ts` | Request creation, response submission, fan-out logic | P0 |
| `useSocialProof.test.ts` | Trust network traversal, batch counts, edge cases (no auth, no vouches) | P0 |
| `useOwnerVerification.test.ts` | Tier calculation, vouch counting, request flow | P0 |
| `useServiceProviders.test.ts` | Search, filter, sort, geo-distance | P1 |
| `useAssistant.test.ts` | Chat message handling, streaming | P1 |
| `useBoat.test.ts` | Boat CRUD, owner linking | P1 |
| `useServiceLogs.test.ts` | Service log queries, pagination | P1 |
| `useInvoices.test.ts` | Invoice generation, payment tracking | P2 |
| `useSignUp.test.ts` | Validation, role assignment, profile creation | P2 |
| `auth-config.test.ts` | SIGNED_IN redirect fix (regression), session restore | P0 |
| `ReviewForm.test.tsx` | Form validation, 50-char minimum, recommendation buttons | P1 |
| `ClaimListingDialog.test.tsx` | Form submission, duplicate claim prevention | P2 |
| `ProviderDetail.test.tsx` | Data loading, social proof display, review section rendering | P1 |

**Pro — 8 new test files:**

| File | What it tests | Priority |
|---|---|---|
| `useFollowUpTasks.test.ts` | Task CRUD, urgency windows, stale closure fix | P0 |
| `useSchedule.test.ts` | Categorization, overdue detection, date math | P0 (partially exists) |
| `useAudioRecording.test.ts` | Recording state machine, file management | P1 |
| `useMediaCapture.test.ts` | Photo/video capture, compression, upload | P1 |
| `useOfflineQueue.test.ts` | Queue add/drain, retry logic, conflict resolution | P0 |
| `GoProBLEService.test.ts` | Scan filtering, connect flow, WiFi AP enable | P1 |
| `VideoUploadManager.test.ts` | Upload chunking, retry, progress tracking | P2 |
| `extractionPrompt.test.ts` | AI extraction prompt produces valid structured data | P1 |

**Shared test infrastructure:**

```typescript
// tests/__mocks__/supabase.ts (both apps)
// Mock that intercepts all supabase.from() calls and returns
// predictable data based on table name + query params.
// Tracks all calls for assertion.

export const createMockSupabase = () => {
  const calls: Array<{ table: string; method: string; args: any[] }> = [];
  
  const mockFrom = (table: string) => {
    const chain = {
      select: (...args: any[]) => { calls.push({ table, method: 'select', args }); return chain; },
      insert: (...args: any[]) => { calls.push({ table, method: 'insert', args }); return chain; },
      update: (...args: any[]) => { calls.push({ table, method: 'update', args }); return chain; },
      delete: () => { calls.push({ table, method: 'delete', args: [] }); return chain; },
      eq: (...args: any[]) => { calls.push({ table, method: 'eq', args }); return chain; },
      in: (...args: any[]) => { calls.push({ table, method: 'in', args }); return chain; },
      neq: (...args: any[]) => { calls.push({ table, method: 'neq', args }); return chain; },
      single: () => { calls.push({ table, method: 'single', args: [] }); return Promise.resolve({ data: null, error: null }); },
      order: (...args: any[]) => { calls.push({ table, method: 'order', args }); return chain; },
      // Terminal methods return promises
      then: (resolve: any) => resolve({ data: [], error: null }),
    };
    return chain;
  };

  return {
    from: mockFrom,
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'test-user-id' } } }),
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    calls, // Expose for assertions
  };
};
```

#### Layer 2: Integration Tests (medium ROI, run in <60s)

These test real Supabase interactions against a local or staging instance.

**Marketplace:**

| Test | What it validates |
|---|---|
| `trust-network.integration.test.ts` | Create review → trigger fires → stats update on provider. Create vouch → verification tier auto-upgrades. |
| `recommendation-flow.integration.test.ts` | Create request → fan-out trigger populates recipients → submit response → mark responded. |
| `social-proof.integration.test.ts` | Create vouches → create reviews → social proof query returns correct people. |
| `auth-roles.integration.test.ts` | Sign up → role assignment → RLS enforcement (boat_owner can't access admin routes). |
| `provider-lifecycle.integration.test.ts` | Create provider → claim → verify → review → featured. |
| `quote-request.integration.test.ts` | Submit quote → admin sees it → progress through pipeline. |

**Pro:**

| Test | What it validates |
|---|---|
| `service-log-flow.integration.test.ts` | Create log → auto-schedule next → follow-up tasks created → approval flow. |
| `voice-processing.integration.test.ts` | Already exists — enhance with follow-up task extraction. |
| `offline-sync.integration.test.ts` | Create logs offline → come online → sync → verify server state. |
| `photo-upload.integration.test.ts` | Capture → compress → upload → URL accessible. |

**Infrastructure:** Use `supabase start` for local Supabase instance. Seed with test data via migration.

```bash
# Test seed migration: supabase/seed.sql
-- Test users
INSERT INTO auth.users (id, email) VALUES 
  ('user-1', 'boatowner1@test.com'),
  ('user-2', 'boatowner2@test.com'),
  ('user-3', 'provider1@test.com');

-- Test verifications
INSERT INTO boat_owner_verifications (user_id, verification_tier, marina_primary) VALUES
  ('user-1', 'gold', 'Berkeley Marina'),
  ('user-2', 'verified', 'Berkeley Marina');

-- Test vouches
INSERT INTO owner_vouches (voucher_id, vouched_for_id, marina) VALUES
  ('user-1', 'user-2', 'Berkeley Marina');

-- Test providers
INSERT INTO service_providers (id, name, verified) VALUES
  ('provider-1', 'Test Hull Cleaning', true);
```

#### Layer 3: E2E Tests (lower frequency, highest confidence)

**Marketplace — Playwright:**

```bash
npm install -D @playwright/test
npx playwright install
```

| Test | Critical path |
|---|---|
| `auth.e2e.ts` | Sign up → verify email → sign in → see profile |
| `browse-providers.e2e.ts` | Homepage → search → filter → click provider → see detail |
| `write-review.e2e.ts` | Sign in → provider detail → write review → see it appear |
| `ask-neighbors.e2e.ts` | Sign in → /ask → create request → (as different user) see incoming → respond |
| `claim-listing.e2e.ts` | Find unclaimed provider → submit claim → admin approves |
| `admin-moderation.e2e.ts` | Admin signs in → reviews page → hide/pin → verifications → gold verify |

**Playwright config:**

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
});
```

**Pro — Maestro (already configured):**

| Test | Critical path |
|---|---|
| `login.yaml` | Launch → enter credentials → see home screen |
| `create-service-log.yaml` | Home → select boat → record → approve → save |
| `schedule-view.yaml` | Home → schedule tab → verify categorization |
| `follow-up-tasks.yaml` | Home → badge count → view tasks → complete one |
| `offline-mode.yaml` | Airplane mode → create log → re-enable → verify sync |

---

## Part 3: Implementation Plan

### Phase 1: Test Infrastructure (Day 1)

**Marketplace:**
- [ ] Install Playwright: `npm i -D @playwright/test`
- [ ] Create `playwright.config.ts`
- [ ] Create shared Supabase mock: `src/test/mocks/supabase.ts`
- [ ] Create test factories: `src/test/factories/` (users, providers, reviews, vouches)
- [ ] Verify existing vitest works: `npm test`

**Pro:**
- [ ] Create shared Supabase mock: `tests/__mocks__/supabase.ts` (enhance existing)
- [ ] Create test factories: `tests/factories/` (boats, service logs, follow-ups)
- [ ] Verify existing jest works: `npm test`
- [ ] Create first Maestro flow: `tests/e2e/login.yaml`

### Phase 2: Unit Tests — Trust Network (Day 1-2)

Write the P0 tests for the trust network features we just shipped:
- `useProviderReviews.test.ts` — recommendation submission, stats, duplicate handling
- `useRecommendationRequests.test.ts` — create, respond, fan-out verification
- `useSocialProof.test.ts` — trust network traversal correctness
- `useOwnerVerification.test.ts` — tier logic, vouch counting
- `auth-config.test.ts` — SIGNED_IN redirect regression test

### Phase 3: OTel Setup (Day 2)

**Marketplace:**
- [ ] `npm i @opentelemetry/sdk-trace-web @opentelemetry/auto-instrumentations-web @opentelemetry/exporter-trace-otlp-http @opentelemetry/context-zone`
- [ ] Create `src/lib/telemetry.ts`
- [ ] Initialize in `main.tsx` (before React render)
- [ ] Create Supabase query wrapper `src/lib/instrumented-supabase.ts`
- [ ] Instrument critical paths: review submit, recommendation request, search
- [ ] Sign up for Grafana Cloud free tier, configure OTLP endpoint

**Pro:**
- [ ] `npm i @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http @opentelemetry/resources`
- [ ] Create `src/lib/telemetry.ts`
- [ ] Initialize in `App.tsx`
- [ ] Instrument: service log creation, voice processing, offline sync, BLE
- [ ] Same Grafana Cloud endpoint

### Phase 4: Integration Tests (Day 3)

- [ ] Set up local Supabase: `supabase start`
- [ ] Create seed data migration
- [ ] Write trust-network integration test
- [ ] Write recommendation-flow integration test
- [ ] Write service-log-flow integration test (Pro)

### Phase 5: E2E Tests (Day 3-4)

- [ ] Marketplace: auth + browse-providers + write-review Playwright tests
- [ ] Pro: login + create-service-log Maestro flows
- [ ] Screenshot comparison baseline

### Phase 6: CI Pipeline (Day 4)

GitHub Actions workflow for both repos:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run type-check
      - run: npm run test:run
      - run: npm run test:coverage
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Cost Analysis

| Item | Cost |
|---|---|
| Grafana Cloud (free tier) | $0/month |
| GitHub Actions (free tier) | $0/month (2,000 min/month) |
| Playwright | Free (OSS) |
| Vitest/Jest | Free (OSS) |
| Maestro | Free (OSS) |
| OTel SDK packages | Free (OSS) |
| **Total** | **$0/month** |

If traffic grows past Grafana free tier: self-host OTel Collector + Jaeger on Mac mini (still $0).

---

## Priority Order (if time is limited)

1. **Unit tests for trust network** — You just shipped a lot of new code. Test it.
2. **OTel on marketplace** — Know what's happening in production.
3. **E2E for critical paths** — Sign in, browse, write review.
4. **OTel on Pro** — Especially voice processing and offline sync.
5. **CI pipeline** — Catch regressions before deploy.
6. **Integration tests** — Hardest to set up, most maintenance.

---

## What This Enables

- **Ship with confidence:** Every PR runs unit + E2E tests automatically
- **Know before users complain:** OTel alerts on error rate spikes, slow queries, failed syncs
- **Performance baseline:** Track Web Vitals, Supabase query times, voice processing latency
- **Trust network health:** Monitor recommendation request response rates, vouch graph growth, social proof hit rates
- **Offline resilience (Pro):** Track queue depth, sync success rates, data loss events
- **Crew Party readiness:** Go to March 5 knowing the platform is instrumented and tested
