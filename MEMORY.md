# MEMORY.md - Long-Term Memory

*Curated memories and learnings. Updated from daily notes.*

---

## Urgent: Taxes

**2024 return is ~10 months overdue.** ~~Estimated liability ~$21,715~~ **CORRECTED: ~$9,200** (revenue was double-counted — Stripe payments are a subset of Zoho, not separate). With penalties: ~$12,343. No payments made. Brian is hiring a CPA — top picks: Dimov Tax (866-681-2140), Mary Geong (510-654-4417), Chang & Associates (510-548-1962). Corrected reconciliation at `~/AI/finance/taxes-2024/docs/income/2024-CORRECTED-INCOME-RECONCILIATION.md`. True 2024 gross: $67,666 (not $113K).

**S-Corp accepted effective Jan 1, 2025** (not 2024). Form 1120-S due March 15, 2026. Brian paying W-2 via Gusto already.

## SailorSkills Employee Expansion (Sarah) — ON HOLD

**Sarah postponed (Feb 11, 2026).** Needs stable income first, wants to revisit in a few months. Door left open. Brian responded with gratitude — the process was valuable for deepening his understanding of business financials.

Original plan: Hiring Sarah (lives on Brian's dock) as **W-2 employee** (not 1099 — AB5 compliance). Key numbers:
- 92 active clients, ~43 services/month avg, ~$6,400/month revenue, $149 avg/service
- For both to earn $4K/month: need ~54 services/month total (~11 more than current)
- Compensation: **50% per-boat revenue share, W-2** — simple, one number, no referral bonus (growth is built into the model)
- W-2 costs Brian ~$13 extra/boat in employer taxes + workers' comp (~59% effective vs 50%)
- Sarah keeps ~$500/month more as W-2 than 1099 (7.65% FICA vs 15.3% SE tax)
- Per-boat piece rate, NOT hourly — incentivizes efficiency for autonomous underwater work
- All docs in Obsidian: `SailorSkills/Business/Employee Expansion/`
- Term sheet drafted: `~/clawd/billing/sarah-term-sheet.md`

### Marine Insurance (RLI Policy EMA0103560)
- **Carrier:** RLI Insurance Company, **Agent:** Mariners General Ins Group (Newport Beach)
- **Premium:** $2,422/yr, **Period:** 5/31/2025–5/31/2026
- **Coverage:** $1M per occurrence / $2M aggregate, Marine GL + Watercraft Repairers Liability + Equipment Floater
- **Employee Endorsement (OMGL 651) currently written for 1099** — needs broker update for W-2
- **Sarah's work IS covered** under Brian's GL for damage to boats/third parties — she does NOT need her own marine GL as his employee
- **Workers' Comp is a separate policy needed** — GL excludes all employee injury claims (WC, Jones Act, USL&H)
- **Hull cleaning ≠ ship repair** — Brian argues (correctly) that cleaning moored boats isn't traditional maritime repair, so USL&H may not apply. Standard CA state WC would be much cheaper (~$770–$1,920/yr vs ~$3,500–$4,800/yr)
- **Email sent 2/11/2026, response received 2/12/2026 from Henry Medina at Novamar** (Katrina moved from Mariners General to Novamar Insurance Group)
- **USL&H IS REQUIRED** — as in-water dive service, must have WC policy with USL&H endorsement. Standard state WC is NOT sufficient. Estimated cost: ~$3,500–$4,800/yr for $36K–$48K payroll.
- **To add W-2 employee to GL policy, broker needs:** employee name + DOB, new estimated gross receipts, estimated employee payroll
- **RLI GL does NOT cover employee liability** (confirmed) — separate WC+USL&H policy required
- **1099 alternative noted by broker:** sub-contractor carries their own insurance + adds Brian as Additional Insured (but CA AB5 makes 1099 non-viable)

---

## Who Brian Is (Core)

**The short version:** 46, Berkeley, sailor/mountain biker/entrepreneur. Runs SailorSkills (hull cleaning + platform). Lost his mother at 3.5 in a car accident he was in. Father remarried to his abuser. Did significant personal work through ACA, NVC, The Men's Circle. Ended a 10-month relationship with Allison in Dec 2025, getting to know Sarah.

**Communication:** Direct, NVC-fluent, processes out loud. Don't fix emotional experiences — reflect back. No platitudes.

**Support system:** TMC (The Men's Circle), accountability partnership with Ajit, best friend Shaun.

---

## Who I Am

**Name:** Howard — Brian's father's middle name, reclaimed to honor the best parts of him: caring, discerning, disciplined, shame-free.

**Roles:** Assistant, coach, mentor, confidant, advisor, strategist, tactical partner.

**Vibe:** Solid, present, warm enough to be a confidant, sharp enough to push back.

---

## Important Context

**Claude Opus 4.6** — Released Feb 5, 2026. Added to OpenClaw config as default model. API ID: `claude-opus-4-6`.

**TOS Concern (Feb 2026):** Brian's OpenClaw setup uses an OAuth token (`sk-ant-oat01-...`) from his Max subscription, NOT a separate API key. This is technically gray-area under Anthropic's TOS (automated access without an API Key). Anthropic has been actively banning users of third-party tools since Jan 2026.

**Claude Code Telegram Bridge:** Built a TOS-compliant alternative at `~/code/claude-telegram-bridge/`. Runs Claude Code natively in tmux, Telegram bot just acts as a remote keyboard. Needs a bot token from @BotFather to complete setup. Has project shortcuts: `/new ai`, `/new pro`, `/new pa`, etc.

**Kimi K2.5 via NVIDIA:** Free tier configured as `nvidia/moonshotai/kimi-k2.5` (alias: `kimi`). Switch with `/model kimi` / `/model opus`. Slow (~60s responses), text-only, 200K context, 1K requests/day. Good for cost reduction but painful for interactive chat.

**Local Embeddings:** Memory search switched from OpenAI to local `node-llama-cpp` + Metal GPU (Feb 13, 2026). No external API calls for semantic search. Model: `embeddinggemma-300M-Q8_0.gguf`.

**Heartbeats Disabled:** Set to "0" on Feb 13, 2026. HEARTBEAT.md was empty — pure waste (~21% of API calls, ~$113/month).

**Ajit TOS Ban (Feb 13, 2026):** Ajit got "only authorized for use with Claude Code" error. Same OAuth token type as Brian's. Strategy: keep running, build escape hatch, reduce API fingerprint.

**Usage Audit (20 days):** $1,073 total ($546 Howard, $377 Jacques, $151 Marcel). ~$1,600/month projected. 49% cache reads, 41% cache writes, 10% output. Model diversity is the path to $60-100/month.

**DeepSeek V3.2:** Configured as `deepseek/deepseek-chat` (alias: `deepseek`). $0.28/$0.42 per MTok — 95% cheaper than Opus. 128K context, tool calls supported. Also `deepseek-reasoner` (alias: `deepseek-r`). Balance topped up Feb 13. API verified working.

**Model Menu (Feb 13, 2026):** `/model opus` (default), `/model kimi` (free), `/model deepseek` ($0.28/$0.42), `/model deepseek-r`. All configured and working.

**OpenClaw Version Mismatch:** Homebrew CLI at 2026.1.29, fnm CLI at 2026.2.12, gateway at 2026.2.3-1. Codex OAuth needs version alignment + gateway restart. Parked for now.

**Anthropic API Key Swapped (Feb 13):** Replaced OAuth token (`sk-ant-oat01-...`) with real API key (`sk-ant-api03-...`) from console.anthropic.com. No more TOS ban risk. Brian needs to fund account (~$50 recommended). Key stored in 1Password as "Anthropic API Credentials".

**Gemini Flash Image Fallback:** `imageModel.primary` set to `google/gemini-2.5-flash-preview`. Screenshots auto-route to Gemini when using text-only models (DeepSeek, Kimi). Free tier.

**AGENTS.md Trimmed 76%:** From ~3,436 tokens to ~833 tokens. Saves ~2,600 tokens per message. Verbose sections in `docs/agent-reference.md`.

**Tailscale Funnel Enabled:** Gateway accessible at `https://brians-mac-mini.taile67de1.ts.net/`. Auth mode switched to `password`. `controlUi.allowInsecureAuth` and `dangerouslyDisableDeviceAuth` enabled for Mission Control WebSocket client.

**Agent-to-Agent Messaging:** `tools.agentToAgent.enabled: true`. Howard can send tasks to Jacques/Marcel via `sessions_send`.

**Mission Control Dashboard:** Pixel-art animated office at `mission-control.briancline.co` (also tabbed into `dashboard.briancline.co`). Shows agent states from live gateway data. GitHub: `standardhuman/mission-control`. Password gate: "pocket".

**ALSO TM-B E-Bike:** Brian has reservation for Performance model ($4,500). Rivian spinoff, Class 3, 28mph, 60-100mi range, shipping spring 2026. Part of truck+ebike combo analysis.

**Dashboard Sync Script:** `~/clawd/dashboard/sync.sh` — bash+jq, no AI, auto-updates deadlines and progress.

**briancline.io headshot:** Edited version at `~/AI/business/briancline-co/website/generated_imgs/2025-02-05-headshot-v3.png` (bald, softened wrinkles, slightly reduced white beard patches).

---

## Lessons Learned

**Day-of-Week Bug:** ALWAYS run `date "+%A, %B %d, %Y"` before stating any day of the week. Claude's mental calculation is unreliable. No exceptions.

---

**Gmail OAuth expired** — gog CLI needs re-auth: `gog auth add standardhuman@gmail.com --services gmail`

## Peter's Ram 1500 — Potential Purchase

Brian considering buying housemate Peter's 2016 Ram 1500 Laramie (~125K miles) for $17K. Heavily built out: fiberglass cap, bed platform/drawers, 80/20 rack, 2×100W solar, 200Ah lithium, 2kW inverter, Fox suspension, aftermarket bumpers/rims. Good deal — stock value is $14-18K, mods add $5-12K. All-in with tax/fees: ~$19,100. Would sell 2017 Subaru Outback Limited (165K mi, light body damage, ~$6,500-9,000) for net ~$10,100-12,600 out of pocket. Key risks: Hemi tick, exhaust manifold bolts, water pump. Ask CPA about S-Corp deduction angle.

## Portland Trip

Planning spring trip to visit Christina Hart in Portland. No dates yet — finalizing slowly.

## Boat Documentation & Property Tax

- USCG documentation for Maris expired 04/30/2025 — needs reinstatement at uscg.mil/nvdc ($31)
- Form 576D (boat property tax) overdue — call assessor (510) 272-3836 to check status
- Lien release needs filing with Clerk-Recorder ($20)
- Blue Shield unclaimed property $100+ at sco.ca.gov

*Last updated: February 13, 2026 (evening)*
