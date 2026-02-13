---
name: customer-support
description: Customer support toolkit — ticket triage and prioritization, professional response drafting, escalation packaging, multi-source customer research, and knowledge base article creation. Use when triaging tickets, drafting customer responses, escalating to engineering/product/leadership, researching customer questions, or writing KB articles.
metadata:
  author: Anthropic (adapted)
  version: 1.0.0
  source: github.com/anthropics/cowork-plugins
---

# Customer Support

> Adapted from [Anthropic's open-source Cowork plugins](https://github.com/anthropics/cowork-plugins) — knowledge-work-plugins/customer-support.

Comprehensive customer support skill covering ticket triage, response drafting, escalation management, customer research, and knowledge base content.

**Tools that help:** Web search for product/technical research, file access for documentation and knowledge bases, CRM/Notion for customer account context.

---

## Ticket Triage

**When to use:** New ticket or customer issue comes in, assessing severity, deciding routing.

### Category Taxonomy

| Category | Signal Words |
|----------|-------------|
| **Bug** | Error, broken, crash, not working, unexpected, wrong, failing |
| **How-to** | How do I, can I, where is, setting up, configure, help with |
| **Feature request** | Would be great if, wish I could, any plans to, requesting |
| **Billing** | Charge, invoice, payment, subscription, refund, upgrade |
| **Account** | Login, password, access, permission, SSO, locked out |
| **Integration** | API, webhook, integration, connect, OAuth, sync |
| **Security** | Data breach, unauthorized, compliance, GDPR, vulnerability |
| **Data** | Missing data, export, import, migration, duplicates |
| **Performance** | Slow, timeout, latency, down, unavailable, degraded |

**Tips:** If both bug + feature request, bug is primary. "Used to work, now doesn't" = Bug. "Want it different" = Feature request. When in doubt, lean toward Bug.

### Priority Framework

**P1 — Critical:** Production down, data loss/corruption, security breach, all/most users affected.
- SLA: Respond 1 hour. Continuous work. Updates every 1-2 hours.

**P2 — High:** Major feature broken, workflow blocked, many users affected, no workaround.
- SLA: Respond 4 hours. Same-day investigation. Updates every 4 hours.

**P3 — Medium:** Feature partially broken, workaround exists, single user/small team affected.
- SLA: Respond 1 business day. Resolution within 3 business days.

**P4 — Low:** Cosmetic, general question, feature request, documented solution exists.
- SLA: Respond 2 business days.

**Auto-bump triggers:** Customer waiting beyond SLA, multiple reports of same issue, customer escalates explicitly, workaround stops working, scope expands.

### Routing Rules

| Route to | When |
|----------|------|
| Tier 1 (frontline) | How-to, known issues with docs, billing inquiries, password resets |
| Tier 2 (senior) | Bugs needing investigation, complex config, integration troubleshooting |
| Engineering | Confirmed bugs needing code fix, infrastructure, performance |
| Product | Feature requests with demand, design decisions, workflow gaps |
| Security | Data access concerns, vulnerability reports, compliance questions |
| Billing/Finance | Refund requests, contract disputes, complex billing |

### Duplicate Detection

Before routing: search by symptom, search by customer, search by product area, check known issues. If duplicate found: link tickets, notify customer, add new info to existing ticket, bump priority if warranted.

---

## Response Drafting

**When to use:** Responding to customer tickets, escalations, outage notifications, bug reports, feature requests.

### Core Principles

1. **Lead with empathy** — acknowledge before solving
2. **Be direct** — bottom-line-up-front
3. **Be honest** — never overpromise
4. **Be specific** — concrete details, dates, names
5. **Own it** — "we" not "the system"
6. **Close the loop** — clear next step in every response
7. **Match their energy** — frustrated → empathetic first, excited → enthusiastic

### Response Structure

```
1. Acknowledgment (1-2 sentences) — what they said/are experiencing
2. Core Message (1-3 paragraphs) — answer, update, information
3. Next Steps (1-3 bullets) — what YOU'll do, what THEY need to do, when they'll hear back
4. Closing (1 sentence) — warm, available
```

### Length by Channel

- Chat/IM: 1-4 sentences
- Support ticket: 1-3 short paragraphs
- Email: 3-5 paragraphs max
- Executive communication: 2-3 paragraphs, data-driven

### Tone by Situation

| Situation | Tone |
|-----------|------|
| Good news | Celebratory, warm, forward-looking |
| Routine update | Professional, clear, friendly |
| Technical response | Precise, structured, patient |
| Delayed delivery | Accountable, honest, action-oriented |
| Bad news | Direct, empathetic, solution-oriented |
| Issue/outage | Immediate, transparent, reassuring |
| Escalation | Composed, ownership-taking, confident |

### Common Response Templates

**Bug Report Acknowledgment:**
```
Hi [Name],

Thank you for reporting this — I can see how [specific impact]
would be frustrating for your team.

I've confirmed the issue and escalated it to our engineering
team as a [priority]. Here's what we know:
- [What's happening]
- [Cause if known]
- [Workaround if available]

I'll update you by [specific date] with a resolution timeline.

Best, [Name]
```

**Feature Request Decline:**
```
Hi [Name],

Thank you for sharing this — I can see why [capability] would
be valuable for [their use case].

I discussed this with our product team, and this isn't something
we're planning to build in the near term. [Honest explanation.]

Here are some alternatives:
- [Alternative 1]
- [Alternative 2]

I've documented your request in our feedback system. Would any
of these alternatives work for your team?

Best, [Name]
```

**Outage Communication:**
```
Hi [Name],

I wanted to let you know about an issue affecting [service/feature].

What happened: [Clear, non-technical explanation]
Impact: [How it affects them]
Status: [Investigating / Identified / Fixing / Resolved]
ETA: [Specific time or update cadence]

[Workaround if applicable.]

I'm personally tracking this and will update you as soon as
we have a resolution. [Status page URL if applicable.]

[Name]
```

### Personalization by Relationship Stage

**New (0-3 months):** More formal, extra context, proactively offer help/resources.
**Established (3+ months):** Warm, direct, reference shared history, skip intro explanations.
**Frustrated/Escalated:** Extra empathy, urgency, concrete action plans, shorter feedback loops.

---

## Escalation Management

**When to use:** Issue needs to go beyond support, writing an escalation brief, assessing whether escalation is warranted.

### When to Escalate

**Technical:** Confirmed bug needing code fix, infrastructure investigation, data corruption.
**Complexity:** Beyond support's diagnostic ability, requires special access.
**Impact:** Multiple customers affected, production down, security concern.
**Business:** High-value customer at risk, SLA breach, executive involvement requested.
**Pattern:** Same issue 3+ customers, recurring "fixed" issue, increasing severity.

### Escalation Tiers

- **L1 → L2:** Deeper investigation, specialized knowledge
- **L2 → Engineering:** Confirmed bug, infrastructure, code change needed
- **L2 → Product:** Feature gap, design decision, competing needs
- **Any → Security:** Data exposure, unauthorized access, vulnerability (bypass tiers)
- **Any → Leadership:** Revenue at risk, SLA breach, cross-functional decision needed

### Escalation Brief Format

```
ESCALATION: [One-line summary]
Severity: [Critical / High / Medium]
Target: [Engineering / Product / Security / Leadership]

IMPACT
- Customers affected: [Number and names]
- Workflow impact: [What's broken]
- Revenue at risk: [If applicable]
- SLA status: [Within / At risk / Breached]

ISSUE DESCRIPTION
[3-5 sentences: what, when, how, scope]

REPRODUCTION STEPS (for bugs)
1. [Step]
2. [Step]
Expected: [X] / Actual: [Y]
Environment: [Details]

WHAT'S BEEN TRIED
1. [Action] → [Result]

CUSTOMER COMMUNICATION
- Last update: [Date — what was said]
- Customer expectation: [What and when]

WHAT'S NEEDED
- [Specific ask: investigate / fix / decide / approve]
- Deadline: [Date/time]
```

### Follow-up Cadence

| Severity | Internal Follow-up | Customer Update |
|----------|-------------------|-----------------|
| Critical | Every 2 hours | Every 2-4 hours |
| High | Every 4 hours | Every 4-8 hours |
| Medium | Daily | Every 1-2 business days |

Don't escalate and forget. Maintain ownership of customer relationship.

### Writing Good Reproduction Steps

1. Start from clean state (account type, config, permissions)
2. Be specific: "Click Export in top-right of Dashboard page"
3. Include exact values, not "enter some data"
4. Note environment: browser, OS, account type, plan
5. Capture frequency: always / intermittent / conditional
6. Include evidence: screenshots, error text, logs
7. Note what you've ruled out

---

## Customer Research

**When to use:** Customer asks a question needing investigation, building context on a customer situation, or finding account context.

### Source Priority

**Tier 1 (Highest confidence):** Product documentation, knowledge base, policy documents, product roadmap.

**Tier 2 (Organizational context):** CRM records, support tickets, internal documents, meeting notes.

**Tier 3 (Team communications):** Chat history, email threads, calendar notes.

**Tier 4 (External):** Web search, community forums, third-party docs.

**Tier 5 (Inferred):** Similar situations, analogous customers, best practices.

### Confidence Levels

**High:** Official docs, multiple sources corroborate, current info. "I'm confident based on [source]."

**Medium:** Informal source, single uncorroborated source, may be slightly outdated. "This appears correct, recommend confirming with [team]."

**Low:** Inferred, outdated, contradictory sources. "My best assessment is [X], but this should be verified."

**Unable to determine:** No relevant info found. "I recommend reaching out to [expert/team]."

### When to Escalate vs. Answer

**Answer directly:** Official docs address it, multiple sources corroborate, factual and non-sensitive, no commitments involved.

**Escalate/verify:** Roadmap commitments, pricing/legal/contract questions, security/compliance, contradictory info, custom config, could set precedent, customer at risk.

---

## Knowledge Base Articles

**When to use:** Resolved ticket with solution worth documenting, updating existing KB, creating how-to guides or troubleshooting docs.

### Article Types

**How-to:** Prerequisites → Numbered steps → Verify it worked → Common issues. Start each step with a verb.

**Troubleshooting:** Symptoms → Cause (brief) → Solutions (most likely first) → Prevention → Still having issues?

**FAQ:** Direct answer first (1-3 sentences) → Details → Related questions.

**Known Issue:** Status (investigating/workaround/fix in progress/resolved) → Symptoms → Workaround → Fix timeline → Updates log.

### Writing for Searchability

- Include exact error messages (customers copy-paste)
- Use customer language, not internal jargon
- Include synonyms: "delete/remove", "dashboard/home page"
- Open every article with plain-language restatement: "If you're seeing [symptom], this article explains how to fix it."

### Title Best Practices

| Good | Bad |
|------|-----|
| "How to configure SSO with Okta" | "SSO Setup" |
| "Fix: Dashboard shows blank page" | "Dashboard Issue" |
| "Error: 'Connection refused' when importing" | "Import Problems" |

### Maintenance Cadence

- New articles: peer review + SME before publishing
- Accuracy audit: quarterly for top-traffic articles
- Stale check: monthly (flag articles not updated in 6+ months)
- Known issue updates: weekly
- Gap analysis: quarterly (top ticket topics without KB articles)

---

## Practical Notes for Small Business

**For a service business with ~92 clients:**
- Even a simple triage system (P1-P4) dramatically improves response consistency
- Template responses save hours — customize the empathetic opening and specific details for each client
- Document every resolution — your future self (or employee) will thank you
- KB articles can be as simple as a shared doc with common questions and answers
- Escalation framework applies even if "escalating" means flagging for yourself to handle during a dedicated block
- Track patterns: if 5+ clients ask the same question, that's a KB article or a product improvement
