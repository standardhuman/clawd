---
name: finance
description: Finance and accounting toolkit — month-end close management, journal entry preparation, account reconciliation, financial statement generation (GAAP), variance analysis, and SOX audit support. Use when closing the books, preparing journal entries, reconciling accounts, generating P&L or balance sheet, analyzing variances, or preparing for audits.
metadata:
  author: Anthropic (adapted)
  version: 1.0.0
  source: github.com/anthropics/cowork-plugins
---

# Finance & Accounting

> Adapted from [Anthropic's open-source Cowork plugins](https://github.com/anthropics/cowork-plugins) — knowledge-work-plugins/finance.

**Important**: This skill assists with finance and accounting workflows but does not provide financial, tax, or audit advice. All outputs should be reviewed by qualified financial professionals before use in financial reporting, regulatory filings, or audit documentation.

Comprehensive finance skill covering month-end close, journal entries, reconciliation, financial statements, variance analysis, and SOX compliance support.

**Data sources:** For best results, provide trial balance data, GL exports, bank statements, or subledger reports. You can paste data directly, upload spreadsheets, or describe your financial situation. Web search can supplement with GAAP guidance and industry benchmarks.

---

## Month-End Close Management

**When to use:** Planning the close calendar, tracking close progress, identifying blockers, or sequencing close activities.

### 5-Day Close Checklist

**Pre-Close (Last 2-3 business days):**
- Send close calendar and deadline reminders
- Confirm cut-off procedures with AP, AR, payroll, treasury
- Verify sub-systems processing normally
- Review open POs for potential accruals
- Collect info for known unusual transactions

**Day 1 (T+1):** Cash entries, payroll, AP accruals, depreciation, prepaid amortization, intercompany posting

**Day 2 (T+2):** Revenue recognition, remaining accruals, subledger reconciliations (AR, AP, FA), FX revaluation

**Day 3 (T+3):** Balance sheet reconciliations, intercompany reconciliation, eliminations, preliminary trial balance, preliminary flux analysis

**Day 4 (T+4):** Tax provision, equity roll-forward, draft financial statements, detailed flux analysis, management review

**Day 5 (T+5):** Final adjustments, hard close, period lock, reporting package, forecast update, retrospective

### Task Dependency Map

```
LEVEL 1 (No dependencies):
├── Cash receipts/disbursements
├── Bank statement retrieval
├── Payroll processing/accrual
├── Fixed asset depreciation
├── Prepaid amortization
├── AP accrual preparation
└── Intercompany posting

LEVEL 2 (Depends on Level 1):
├── Bank reconciliation
├── Revenue recognition
├── AR/AP subledger reconciliation
├── FX revaluation
└── Remaining accrual JEs

LEVEL 3 (Depends on Level 2):
├── All balance sheet reconciliations
├── Intercompany reconciliation
├── Adjusting entries
└── Preliminary trial balance

LEVEL 4 (Depends on Level 3):
├── Tax provision
├── Equity roll-forward
├── Draft financial statements
└── Preliminary flux analysis

LEVEL 5 (Depends on Level 4):
├── Management review
├── Final adjustments
├── Hard close / period lock
└── Financial reporting package
```

### Critical Path

Cash/AP/AR entries → Subledger recs → Balance sheet recs → Tax provision → Draft financials → Management review → Hard close

To shorten: automate Level 1 entries, pre-reconcile during the month, parallel-process independent recs, set clear deadlines.

### Close Metrics

| Metric | Target |
|--------|--------|
| Close duration (business days) | Reduce over time |
| Adjusting entries after soft close | Minimize |
| Late tasks | Zero |
| Reconciliation exceptions | Reduce over time |
| Restatements/corrections | Zero |

---

## Journal Entry Preparation

**When to use:** Booking accruals, prepaid amortization, depreciation, payroll entries, revenue recognition, or any manual journal entry.

### Standard Accrual Types

**AP Accruals** (goods/services received, not invoiced):
- Debit: Expense account → Credit: Accrued liabilities
- Sources: Open POs with confirmed receipts, contracts, recurring vendors
- Auto-reverse in following period. Document basis for estimates.

**Fixed Asset Depreciation:**
- Debit: Depreciation expense → Credit: Accumulated depreciation
- Methods: Straight-line (most common), Declining balance, Units of production
- Verify new additions, check for disposals/impairments

**Prepaid Expense Amortization:**
- Debit: Expense account → Credit: Prepaid expense
- Common: Insurance, software licenses, subscriptions, prepaid rent
- Maintain schedule with start/end dates and monthly amounts

**Payroll Accruals:**
- Salary accrual (pay periods not aligned with month-end)
- Bonus accrual (plan terms, performance metrics)
- Benefits and payroll tax accruals (FICA, FUTA, health, 401k match)
- PTO/vacation liability if required

**Revenue Recognition (ASC 606):**
- Debit: Deferred revenue → Credit: Revenue (recognizing)
- Debit: AR → Credit: Revenue (new receivable)
- Follow 5-step framework: identify contract, identify performance obligations, determine transaction price, allocate price, recognize as/when satisfied

### Supporting Documentation Requirements

Every journal entry needs:
1. Clear description/memo
2. Calculation support (formula, schedule, source data)
3. Source documents (PO numbers, invoices, contracts)
4. Period identification
5. Preparer identification and date
6. Approval per authorization matrix
7. Reversal indicator

### Review Checklist

- [ ] Debits equal credits
- [ ] Correct period
- [ ] Account codes valid and appropriate
- [ ] Amounts supported by calculations
- [ ] Description sufficient for audit
- [ ] Department/cost center correct
- [ ] Consistent with prior periods
- [ ] Auto-reversal set appropriately
- [ ] No duplicates

### Common Errors

Unbalanced entries, wrong period, wrong sign, duplicates, wrong account, missing reversal, stale accruals, round-number estimates, incorrect FX rates, missing intercompany elimination, capitalization errors, cut-off errors.

---

## Account Reconciliation

**When to use:** Bank reconciliations, GL-to-subledger recs, intercompany reconciliations, or identifying reconciling items.

### Reconciliation Types

**GL to Subledger:** Compare GL control account to subledger detail (AR, AP, FA, inventory, prepaids, accrued liabilities).

**Bank Reconciliation:**
```
Balance per bank statement:          $XX,XXX
+ Deposits in transit                 $X,XXX
- Outstanding checks                ($X,XXX)
± Bank errors                        $X,XXX
= Adjusted bank balance:            $XX,XXX

Balance per general ledger:          $XX,XXX
+ Interest/credits not recorded      $X,XXX
- Bank fees not recorded            ($X,XXX)
± GL errors                          $X,XXX
= Adjusted GL balance:              $XX,XXX

Difference:                          $0.00
```

**Intercompany:** Reconcile receivable/payable between entities. Both sides must match for consolidation.

### Reconciling Item Categories

1. **Timing Differences** (clear without action): Outstanding checks, deposits in transit, pending approvals
2. **Adjustments Required** (need journal entry): Unrecorded charges, errors, missing entries
3. **Requires Investigation:** Unidentified differences, disputed items, aged items

### Aging Analysis

| Age | Status | Action |
|-----|--------|--------|
| 0-30 days | Current | Monitor |
| 31-60 days | Aging | Investigate |
| 61-90 days | Overdue | Escalate to supervisor |
| 90+ days | Stale | Escalate to management — potential write-off |

### Best Practices

1. Complete within close calendar deadline
2. Reconcile all balance sheet accounts on defined frequency
3. Document preparer, reviewer, date, all reconciling items
4. Segregation: reconciler ≠ transaction processor
5. Follow through — don't carry items forward indefinitely
6. Root cause analysis for recurring items
7. Standardized templates

---

## Financial Statements

**When to use:** Preparing income statements, balance sheets, cash flow statements, or running flux analysis.

### Income Statement (Standard Format)

```
Revenue (Product, Service, Other)
- Cost of Revenue
= Gross Profit

- Operating Expenses (R&D, S&M, G&A)
= Operating Income

± Other Income (Expense)
= Income Before Taxes
- Income Tax Expense
= Net Income
```

Key GAAP requirements (ASC 220): Classify expenses by function (most common US) or nature. Present operating and non-operating separately. Show income tax as separate line. No extraordinary items.

### Balance Sheet (Classified)

```
ASSETS: Current (cash, AR, inventory, prepaids) + Non-Current (PP&E, ROU assets, goodwill, intangibles)
LIABILITIES: Current (AP, accrued, deferred revenue, current debt) + Non-Current (LT debt, lease liabilities)
STOCKHOLDERS' EQUITY: Common stock, APIC, retained earnings, AOCI, treasury stock
```

### Cash Flow Statement (Indirect Method)

```
Operating: Net income + non-cash adjustments + working capital changes
Investing: CapEx, investments, acquisitions
Financing: Debt, equity, dividends
= Net Change in Cash
```

### Flux Analysis Methodology

For each line item, calculate: Dollar variance, Percentage variance, Basis point change (for margins).

**Materiality thresholds** (example):

| Line Item Size | Dollar Threshold | % Threshold |
|---------------|-----------------|-------------|
| > $10M | $500K | 5% |
| $1M - $10M | $100K | 10% |
| < $1M | $50K | 15% |

Adjust thresholds for your organization's size.

---

## Variance Analysis

**When to use:** Analyzing budget vs. actual, period-over-period changes, or preparing variance commentary.

### Decomposition Techniques

**Price/Volume:**
- Volume Effect = (Actual Volume - Budget Volume) × Budget Price
- Price Effect = (Actual Price - Budget Price) × Actual Volume
- Verification: Volume + Price = Total Variance

**Headcount/Compensation:**
- Headcount variance, Rate variance, Mix variance, Timing variance, Attrition impact

**Spend Category:**
- Headcount-driven, Volume-driven, Discretionary, Contractual/fixed, One-time, Timing/phasing

### Variance Narrative Structure

```
[Line Item]: [Favorable/Unfavorable] $[amount] ([%])
vs [comparison] for [period]

Driver: [Primary driver description with specific quantification]
Outlook: [One-time / Expected to continue / Improving]
Action: [None / Monitor / Investigate / Update forecast]
```

Quality checklist: Specific, Quantified, Causal (WHY not just WHAT), Forward-looking, Actionable, Concise.

### Waterfall (Bridge) Chart

```
WATERFALL: Revenue — Q4 Actual vs Q4 Budget

Q4 Budget Revenue                    $10,000K
  |--[+] Volume growth               +$800K
  |--[+] Expansion revenue           +$400K
  |--[-] Price reductions             -$200K
  |--[-] Churn/contraction            -$350K
  |--[+] FX tailwind                  +$50K
  |--[-] Timing (deal slippage)       -$150K
Q4 Actual Revenue                    $10,550K

Net Variance: +$550K (+5.5% favorable)
```

Keep to 5-8 drivers. Verify start + drivers = end.

### Budget vs Actual vs Forecast

- **Actual vs Budget:** Annual performance measurement
- **Actual vs Forecast:** Operational management (forecast updated periodically)
- **Forecast vs Budget:** Understanding how expectations changed since planning
- **Actual vs Prior Period:** Trend analysis

---

## SOX Audit Support

**When to use:** Generating testing workpapers, selecting audit samples, classifying control deficiencies, or preparing for audits.

### SOX 404 Overview

1. Scoping → 2. Risk Assessment → 3. Control Identification → 4. Testing → 5. Evaluation → 6. Reporting

### Sample Size Guidance

| Control Frequency | Low Risk | Moderate Risk | High Risk |
|------------------|----------|---------------|-----------|
| Annual (1) | 1 | 1 | 1 |
| Quarterly (4) | 2 | 2 | 3 |
| Monthly (12) | 2 | 3 | 4 |
| Weekly (52) | 5 | 8 | 15 |
| Daily (~250) | 20 | 30 | 40 |
| Per-transaction (large) | 25 | 40 | 60 |

### Control Deficiency Classification

- **Deficiency:** Control doesn't allow timely prevention/detection of misstatements
- **Significant Deficiency:** Less severe than material weakness but merits governance attention
- **Material Weakness:** Reasonable possibility material misstatement won't be prevented/detected timely

Indicators of material weakness: fraud by senior management, restatement, auditor finds material misstatement company missed, ineffective audit committee oversight.

### Control Types

**IT General Controls (ITGCs):** Access provisioning/de-provisioning, privileged access, periodic reviews, change management, IT operations, backup/recovery.

**Manual Controls:** Management review, supervisory approval, three-way match, reconciliation prep/review, physical inventory.

**Automated Controls:** System-enforced workflows, three-way match automation, duplicate detection, credit limits, automated calculations.

**Entity-Level Controls:** Tone at the top, risk assessment, audit committee, internal audit, fraud programs, financial reporting competence.

### Testing Documentation

Every test needs: Control ID and description, test objective and procedures, expected evidence, population and sample details, results per item, exceptions with description, conclusion and sign-off.

---

## Practical Notes for Small Business (S-Corp)

**For a service business with ~92 clients:**
- Monthly close can be simplified — focus on bank reconciliation, AR/AP reconciliation, and revenue recognition
- Standard journal entries: depreciation (if you have equipment), prepaid amortization (insurance), payroll accruals
- Variance analysis: compare actual vs. budget monthly, investigate anything over 15%
- SOX compliance is for public companies — but the control frameworks are excellent internal discipline
- Track key metrics: revenue per client, gross margin, cash conversion cycle, AR aging
- GAAP financial statements help if seeking loans, selling the business, or attracting investors
