# Contract Clause Analysis Reference

Detailed reference for analyzing key contract clauses with standard positions and common issues.

## Limitation of Liability

**Key elements:**
- Cap amount (fixed dollar, multiple of fees, uncapped)
- Mutual vs. applies differently to each party
- Carveouts from cap (what liabilities are uncapped)
- Consequential/indirect/special/punitive damages exclusion
- Carveouts from consequential damages exclusion
- Per-claim, per-year, or aggregate

**Common issues:**
- Cap at fraction of fees (e.g., "fees paid in prior 3 months" on low-value contract)
- Asymmetric carveouts favoring drafter
- Broad carveouts that effectively eliminate cap
- No consequential damages exclusion for one party

## Indemnification

**Key elements:**
- Mutual vs. unilateral
- Scope/triggers (IP infringement, data breach, bodily injury, breach of reps)
- Capped or uncapped
- Procedure: notice, right to control defense, right to settle
- Indemnitee duty to mitigate
- Relationship to liability cap

**Common issues:**
- Unilateral IP indemnification when both contribute IP
- "Any breach" indemnification (too broad, effectively uncaps liability)
- No right to control defense
- Indefinite survival

## Intellectual Property

**Key elements:**
- Pre-existing IP ownership (each retains own)
- Developed IP ownership
- Work-for-hire provisions and scope
- License grants: scope, exclusivity, territory, sublicensing
- Open source considerations
- Feedback clauses

**Common issues:**
- Broad IP assignment capturing customer's pre-existing IP
- Work-for-hire beyond deliverables
- Unrestricted feedback clauses (perpetual, irrevocable licenses)
- License scope broader than business relationship requires

## Data Protection

**Key elements:**
- DPA required?
- Controller vs. processor classification
- Sub-processor rights and notification
- Breach notification timeline (72 hours for GDPR)
- Cross-border transfer mechanisms (SCCs, adequacy, BCRs)
- Deletion/return on termination
- Security requirements and audit rights
- Purpose limitation

**Common issues:**
- No DPA when personal data is processed
- Blanket sub-processor authorization without notification
- Breach notification > regulatory requirements
- No cross-border protections for international data movement
- Inadequate deletion provisions

## Term & Termination

**Key elements:**
- Initial term and renewal terms
- Auto-renewal provisions and notice periods
- Termination for convenience (availability, notice, fees)
- Termination for cause (cure period, definition)
- Effects (data return, transition assistance, survival)
- Wind-down period

**Common issues:**
- Long initial terms with no convenience termination
- Auto-renewal with short notice (30 days for annual)
- No cure period for cause termination
- Inadequate transition assistance
- Survival clauses extending agreement indefinitely

## Governing Law & Disputes

**Key elements:**
- Choice of law
- Dispute mechanism (litigation, arbitration, mediation first)
- Venue and jurisdiction
- Arbitration rules and seat
- Jury waiver, class action waiver
- Prevailing party attorney fees

**Common issues:**
- Unfavorable/remote jurisdiction
- Mandatory arbitration with rules favoring drafter
- Jury waiver without corresponding protections
- No escalation process before formal resolution

## Representations & Warranties

**Key elements:**
- Scope of representations
- Disclaimers (AS-IS, no implied warranties)
- Survival period post-termination
- Materiality qualifiers

**Standard positions:**
- Both parties: authority, no conflicts, compliance with laws
- Vendor: product conformance to specs, no infringement, security
- Customer: authorized use, compliance with acceptable use

## NDA-Specific Provisions

**Standard carveouts (all should be present):**
1. Public knowledge (not receiving party's fault)
2. Prior possession
3. Independent development
4. Third-party receipt without restriction
5. Legal compulsion (with notice where permitted)

**Problematic provisions to flag:**
- Non-solicitation of employees
- Non-compete provisions
- Exclusivity or standstill
- Broad residuals clause
- IP assignment or license
- Audit rights (unusual in NDAs)
- Liquidated damages

**Term guidance:**
- Agreement: 1-3 years standard
- Confidentiality survival: 2-5 years
- Trade secrets: as long as they remain trade secrets
- Perpetual: avoid unless justified
