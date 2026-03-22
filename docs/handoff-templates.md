# Handoff Templates

Standardized templates for agent-to-agent work transfer. Consistent handoffs prevent context loss — the #1 cause of multi-agent coordination failure.

---

## 1. Standard Task Handoff

Use for any agent-to-agent work transfer (PM → Engineer, Howard → subagent, etc.)

```markdown
# Task Handoff

| Field | Value |
|-------|-------|
| **From** | [Agent name] |
| **To** | [Agent name] |
| **Project** | [Project name] |
| **Priority** | Critical / High / Medium / Low |
| **Date** | [YYYY-MM-DD] |

## Context
**Current state:** [What's been done so far — be specific]
**Relevant files:**
- [file/path/1] — [what it contains]
- [file/path/2] — [what it contains]
**Dependencies:** [What this work depends on]
**Constraints:** [Technical, timeline, or resource constraints]

## Deliverable
**What's needed:** [Specific, measurable deliverable]
**Acceptance criteria:**
- [ ] [Criterion 1 — measurable]
- [ ] [Criterion 2 — measurable]
- [ ] [Criterion 3 — measurable]

## Quality Expectations
**Must pass:** [Specific quality criteria]
**Evidence required:** [What proof of completion looks like]
**Handoff to next:** [Who gets the output and what format they need]
```

---

## 2. QA Verdict — PASS ✅

```markdown
# QA Verdict: PASS ✅

| Field | Value |
|-------|-------|
| **Task** | [Description] |
| **Reviewed by** | [Blake / agent name] |
| **Attempt** | [N] of 3 |
| **Date** | [YYYY-MM-DD] |

## Verification
- [x] [Acceptance criterion 1] — verified
- [x] [Acceptance criterion 2] — verified
- [x] [Acceptance criterion 3] — verified

## Evidence
- [Screenshot/test output/URL checked]

## Notes
[Any observations or minor suggestions for next iteration]
```

---

## 3. QA Verdict — FAIL ❌

```markdown
# QA Verdict: FAIL ❌

| Field | Value |
|-------|-------|
| **Task** | [Description] |
| **Reviewed by** | [Blake / agent name] |
| **Attempt** | [N] of 3 |
| **Date** | [YYYY-MM-DD] |

## Issues Found

### Issue 1: [Severity: 🛑 Critical / ⚠️ High / 💡 Medium]
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Evidence:** [Screenshot/test output]
**Fix:** [Specific, actionable instruction]
**File(s):** [Exact paths to modify]

### Issue 2: ...

## Acceptance Criteria Status
- [x] [Criterion 1] — passed
- [ ] [Criterion 2] — FAILED (see Issue 1)

## Retry Instructions
1. Fix ONLY the issues listed above
2. Do NOT introduce new features or changes
3. Re-submit for QA when all issues are addressed
4. This is attempt [N] of 3 maximum

**If attempt 3 fails:** Escalate to PM or Howard.
```

---

## 4. Escalation Report

Use when a task exceeds 3 retry attempts or hits a blocker.

```markdown
# Escalation Report 🚨

| Field | Value |
|-------|-------|
| **Task** | [Description] |
| **Attempts exhausted** | 3/3 |
| **Escalate to** | [PM / Howard / Brian] |
| **Date** | [YYYY-MM-DD] |

## Failure History
### Attempt 1: [Issue → Fix applied → Why it still failed]
### Attempt 2: [Issue → Fix applied → Why it still failed]
### Attempt 3: [Issue → Fix applied → Why it still failed]

## Root Cause
**Why it keeps failing:** [Analysis]
**Systemic?** [One-off or pattern?]

## Recommended Resolution
- [ ] Reassign to different agent
- [ ] Decompose into smaller tasks
- [ ] Architecture/approach change needed
- [ ] Accept with documented limitations
- [ ] Defer

## Impact
**Blocking:** [What other tasks depend on this]
**Timeline impact:** [How this affects the schedule]
```

---

## 5. Security Review Handoff

```markdown
# Security Review

| Field | Value |
|-------|-------|
| **Component** | [What's being reviewed] |
| **Reviewed by** | [Cyrus / agent name] |
| **Risk level** | 🟢 Low / 🟡 Moderate / 🔴 High |
| **Date** | [YYYY-MM-DD] |

## Findings

### 🔴 Critical (blocks deployment)
- [Vulnerability]: [Impact] → [Remediation]

### 🟡 Medium (fix before next release)
- [Vulnerability]: [Impact] → [Remediation]

### 🟢 Low (track and address)
- [Vulnerability]: [Impact] → [Remediation]

## Testing Performed
- [ ] Secrets scan (git history + config)
- [ ] Dependency audit (npm audit / known CVEs)
- [ ] Input validation review
- [ ] Auth/authz check
- [ ] CORS / headers review
- [ ] Environment config review

## Verdict
🟢 Clear to deploy / 🟡 Deploy with tracked issues / 🔴 Do not deploy
```

---

## 6. Incident Handoff

```markdown
# Incident Report

| Field | Value |
|-------|-------|
| **Severity** | P0 / P1 / P2 / P3 |
| **Detected by** | [Agent or system] |
| **Detection time** | [Timestamp] |
| **Status** | Investigating / Mitigating / Resolved |

## What happened
[Clear description]

## Impact
[Who/what is affected]

## Timeline
- [HH:MM] — [Event]
- [HH:MM] — [Event]

## Actions taken
1. [Action and result]

## For next responder
- What's been tried: [...]
- What hasn't been tried: [...]
- Suspected root cause: [...]
- Relevant logs: [...]
```

---

## When to Use What

| Situation | Template |
|-----------|----------|
| Assigning work to another agent | Standard Task Handoff (#1) |
| QA approves | QA PASS (#2) |
| QA rejects | QA FAIL (#3) |
| Task exceeds 3 retries / blocker | Escalation Report (#4) |
| Security review complete | Security Review (#5) |
| System incident | Incident Handoff (#6) |
