---
name: legal
description: In-house legal toolkit — contract review with playbook-based analysis, NDA triage, legal risk assessment, compliance (GDPR/CCPA), canned response templates, and meeting briefing preparation. Use when reviewing contracts, triaging NDAs, assessing legal risk, handling data subject requests, preparing for legal meetings, or generating templated legal responses.
metadata:
  author: Anthropic (adapted)
  version: 1.0.0
  source: github.com/anthropics/cowork-plugins
---

# Legal

> Adapted from [Anthropic's open-source Cowork plugins](https://github.com/anthropics/cowork-plugins) — knowledge-work-plugins/legal.

**Important**: This skill assists with legal workflows but does not provide legal advice. All analysis should be reviewed by qualified legal professionals before being relied upon. Regulatory requirements change frequently — verify current requirements with authoritative sources.

Comprehensive legal skill covering contract review, NDA triage, risk assessment, privacy compliance, response templates, and meeting preparation.

**Tools that help:** File access for contract documents, web search for regulatory guidance and case context, knowledge bases for existing playbooks and precedent.

---

## Contract Review

**When to use:** Reviewing vendor contracts, customer agreements, or any commercial agreement where you need clause-by-clause analysis.

### Review Process

1. Identify contract type (SaaS, services, license, partnership, procurement)
2. Determine your side (vendor, customer, licensor, licensee, partner)
3. Read the entire contract before flagging — clauses interact
4. Analyze each material clause against standard positions
5. Consider the contract holistically

### Key Clauses to Analyze

**Limitation of Liability:**
- Cap amount (fixed, multiple of fees, uncapped)
- Mutual vs. unilateral
- Carveouts from cap and from consequential damages exclusion
- Per-claim, per-year, or aggregate

**Indemnification:**
- Mutual vs. unilateral, scope of triggers
- Capped or uncapped, procedure and control of defense
- Relationship to the liability cap

**IP Ownership:**
- Pre-existing IP retained by each party
- Developed IP ownership, work-for-hire scope
- License grants, sublicensing, feedback clauses

**Data Protection:**
- DPA requirement, controller vs. processor
- Sub-processor rights, breach notification timeline
- Cross-border transfers (SCCs), deletion on termination, audit rights

**Term & Termination:**
- Auto-renewal and notice periods
- Termination for convenience and cause (cure periods)
- Effects: data return, transition assistance, survival

**Governing Law & Disputes:**
- Jurisdiction, venue, arbitration vs. litigation
- Jury waiver, class action waiver, attorney fees

### Deviation Classification

**GREEN (Acceptable):** Aligns with or better than standard position. Minor commercially reasonable variations. No action needed.

**YELLOW (Negotiate):** Outside standard but within negotiable range. Common in market but not preferred. Generate specific redline language + fallback position.

**RED (Escalate):** Outside acceptable range. Material risk. Requires senior counsel or business decision-maker sign-off. Provide market-standard alternative + exposure estimate.

### Redline Format

For each deviation:
- **Clause:** Section reference
- **Current language:** Exact quote
- **Proposed redline:** Specific alternative language
- **Rationale:** 1-2 sentences (suitable for counterparty)
- **Priority:** Must-have / Should-have / Nice-to-have
- **Fallback:** Alternative if primary is rejected

### Negotiation Tiers

**Tier 1 (Deal Breakers):** Uncapped liability, missing data protection, IP provisions jeopardizing core assets, regulatory conflicts.

**Tier 2 (Strong Preferences):** Liability cap adjustments, indemnification scope/mutuality, termination flexibility, audit rights.

**Tier 3 (Concession Candidates):** Preferred governing law, notice periods, minor definitional improvements, insurance certificates.

Strategy: Lead with Tier 1. Trade Tier 3 concessions to secure Tier 2 wins. Never concede Tier 1 without escalation.

---

## NDA Triage

**When to use:** New NDA from sales or business development, assessing NDA risk level, deciding whether full counsel review is needed.

### Screening Checklist

1. **Structure:** Mutual/unilateral appropriate for context? Standalone (not embedded)?
2. **Definition scope:** Reasonable? Not overbroad? Marking requirements workable?
3. **Standard carveouts present:**
   - [ ] Public knowledge (not receiving party's fault)
   - [ ] Prior possession
   - [ ] Independent development
   - [ ] Third-party receipt without restriction
   - [ ] Legal compulsion (with notice)
4. **Permitted disclosures:** Employees, contractors, advisors, affiliates
5. **Term:** Agreement 1-3 years, survival 2-5 years, not perpetual
6. **Return/destruction:** On termination, with retention exception for legal/compliance
7. **Remedies:** Standard injunctive relief, no liquidated damages
8. **Problematic provisions:**
   - [ ] No non-solicitation
   - [ ] No non-compete
   - [ ] No exclusivity
   - [ ] No standstill (unless M&A)
   - [ ] No broad residuals clause
   - [ ] No IP assignment/license
   - [ ] No audit rights

### Classification

**GREEN (Standard Approval):** All criteria met, mutual, standard carveouts present, no problematic provisions. Approve same-day.

**YELLOW (Counsel Review):** Minor deviations — broader definition, longer term (up to 5yr), narrow residuals, non-preferred jurisdiction, missing one carveout. 1-2 business days.

**RED (Significant Issues):** Unilateral when mutual needed, missing critical carveouts, non-solicit/non-compete embedded, 10+ year term, IP grant hidden, broad residuals. Full legal review, 3-5 days.

### Common Issues & Positions

| Issue | Standard Position |
|-------|------------------|
| Overbroad definition | Limit to marked or reasonably understood confidential info |
| Missing independent dev carveout | Must include — prevents claims on internally-developed work |
| Employee non-solicitation | Delete. Limit to targeted solicitation + 12mo if counterparty insists |
| Broad residuals clause | Resist. If required: unaided memory only, exclude trade secrets, no IP license |
| Perpetual obligation | 2-5 years from disclosure/termination. Trade secret carveout for longer protection |

---

## Legal Risk Assessment

**When to use:** Evaluating contract risk, assessing deal exposure, classifying issues, determining need for senior/outside counsel.

### Severity × Likelihood Matrix

**Severity (1-5):**
1. Negligible — minor inconvenience, no material impact
2. Low — limited impact, <1% of contract/deal value
3. Moderate — meaningful, 1-5% of value, potential limited attention
4. High — significant, 5-25% of value, regulatory scrutiny likely
5. Critical — severe, >25% of value, fundamental disruption, personal liability possible

**Likelihood (1-5):**
1. Remote — highly unlikely, no precedent
2. Unlikely — could occur, limited precedent
3. Possible — may occur, precedent exists
4. Likely — probably will occur, triggering events common
5. Almost Certain — expected, triggering events present

**Risk Score = Severity × Likelihood:**
- 1-4: LOW (Green) — Accept, document, monitor
- 5-9: MEDIUM (Yellow) — Mitigate, monitor actively, assign owner
- 10-15: HIGH (Orange) — Escalate to senior counsel, develop mitigation plan
- 16-25: CRITICAL (Red) — Immediate escalation, engage outside counsel, response team

### When to Engage Outside Counsel

**Mandatory:** Active litigation, government investigation, criminal exposure, securities issues, board-level matters.

**Strongly recommended:** Novel legal issues, jurisdictional complexity, material financial exposure, specialized expertise needed, significant regulatory changes, M&A.

**Consider:** Complex contract disputes, employment matters, data incidents, IP disputes, insurance coverage disputes.

---

## Privacy Compliance

**When to use:** Reviewing DPAs, handling data subject requests, assessing cross-border transfers, evaluating privacy compliance.

### Key Regulations

| Regulation | Scope | DSR Timeline | Breach Notification |
|-----------|-------|-------------|---------------------|
| GDPR | EU/EEA data subjects | 30 days (+60 extension) | 72 hours to authority |
| CCPA/CPRA | California residents | 45 days (+45 extension) | Varies |
| UK GDPR | UK data subjects | 30 days (+60 extension) | 72 hours to ICO |

### DPA Review Checklist (GDPR Article 28)

Required elements:
- [ ] Subject matter, duration, nature, purpose defined
- [ ] Type of personal data and categories of data subjects specified
- [ ] Process only on documented instructions
- [ ] Confidentiality commitments
- [ ] Security measures (Article 32)
- [ ] Sub-processor requirements (notification + right to object)
- [ ] Data subject rights assistance
- [ ] Breach notification without undue delay (24-48 hours)
- [ ] Deletion/return on termination
- [ ] Audit rights

International transfers:
- [ ] Transfer mechanism (SCCs, adequacy decision, BCRs)
- [ ] Current EU SCCs (June 2021) if applicable
- [ ] Correct module (C2P, C2C, P2P, P2C)
- [ ] Transfer impact assessment completed
- [ ] UK addendum if UK data in scope

### Data Subject Request Handling

1. **Identify request type:** Access, rectification, erasure, restriction, portability, objection, opt-out
2. **Identify applicable regulation(s)**
3. **Verify identity** (reasonable, proportionate measures)
4. **Log:** Date, type, requester, regulation, deadline, handler
5. **Check exemptions:** Legal holds, regulatory retention, third-party rights, legal claims
6. **Fulfill or explain denial** with specific legal basis
7. **Inform of right to complain** to supervisory authority

---

## Response Templates

**When to use:** Responding to routine legal inquiries — data subject requests, vendor questions, NDA requests, discovery holds, subpoenas.

### Template Categories

**Data Subject Requests:** Acknowledgment, identity verification, fulfillment, partial/full denial, extension notification.

**Discovery Holds:** Initial notice, reminders, scope modifications, release.

**Vendor Questions:** Contract status, amendment requests, compliance certifications.

**NDA Requests:** Send standard form, accept with markup, decline.

**Subpoena/Legal Process:** Acknowledgment, objection, extension request. *Always requires counsel review — templates are starting frameworks only.*

### Escalation Triggers (Stop Before Using Template)

**Universal:** Involves litigation/regulatory investigation, from regulator/government, creates binding commitment, involves criminal liability, media attention, unprecedented situation.

**DSR-specific:** Minor's data, regulatory authority (not individual), litigation hold applies, active employee dispute, broad/fishing scope.

When trigger detected: Stop → Alert → Explain trigger → Recommend escalation path → Offer draft for counsel review.

---

## Meeting Briefing

**When to use:** Preparing for contract negotiations, board meetings, compliance reviews, or any meeting with legal relevance.

### Briefing Template

```
Meeting: [title]
Date/Time: [with timezone]
Your Role: [advisor / presenter / negotiator / observer]

Participants:
| Name | Org | Role | Key Interests | Notes |

Agenda / Expected Topics:
1. [Topic] — [context]

Background and Context:
[2-3 paragraphs: history, current state, why meeting is happening]

Key Documents: [with locations]
Open Issues: [issue, status, owner, priority]
Legal Considerations: [risks, issues relevant to topics]
Talking Points: [with supporting context]
Questions to Raise: [with why it matters]
Decisions Needed: [options + recommendation]
Red Lines / Non-Negotiables: [for negotiations]
```

### Meeting Type Specifics

**Deal Review:** Add deal summary, contract status, approval requirements, counterparty dynamics, comparable deals.

**Board/Committee:** Add legal department update, risk highlights, regulatory update, pending approvals, litigation summary.

**Regulatory:** Add regulatory body context, matter history, compliance posture, privilege considerations.

### Action Item Tracking

Every action item needs: specific description, single owner, specific deadline, type (legal team / business / external / follow-up meeting), dependencies noted.

---

## Practical Notes for Small Business

**For a service business with ~92 clients:**
- Keep a standard service agreement and NDA on hand — saves massive time vs. reviewing each customer's
- NDA triage checklist is useful even without a legal team — catches the dangerous provisions
- Contract review focus areas: liability cap, indemnification, termination flexibility, IP ownership
- Privacy compliance: if you collect customer info, a basic privacy policy is essential. If serving EU customers, GDPR applies.
- Risk assessment framework scales down well — even a simple severity × likelihood helps prioritize legal concerns
- Consider an annual outside counsel relationship for the big-ticket items (entity structure, IP protection, employment law)
