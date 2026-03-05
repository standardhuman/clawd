# GWS vs GOG Comparison

**Date:** 2026-03-05
**Researcher:** Noa
**Status:** Complete

---

## Executive Summary

`gws` (Google Workspace CLI) is a significantly broader tool than `gog`, covering the entire Google Workspace API surface through dynamic Discovery Service integration. However, `gog` is more ergonomic for the specific workflows we actually use. **Recommendation: watch and wait, with a pilot on Chat/Tasks/Forms.**

---

## 1. Tool Overview

| | **gog** (current) | **gws** (candidate) |
|---|---|---|
| **Version** | v0.9.0 (stable) | v0.4.4 (pre-v1.0, breaking changes expected) |
| **Install** | `brew install steipete/tap/gogcli` | `npm install -g @googleworkspace/cli` |
| **Language** | Go | Rust (binary via npm) |
| **API Coverage** | Gmail, Calendar, Drive, Contacts, Sheets, Docs | ALL Google Workspace APIs (30+ services) |
| **Command Style** | Ergonomic subcommands (`gog gmail search`) | Generic REST mapping (`gws gmail users messages list --params '{...}'`) |
| **Output** | Human-readable + `--json` flag | JSON by default, also table/yaml/csv |
| **Auth** | OAuth per-account, stored locally | OAuth per-account, encrypted at rest (AES-256-GCM, OS keyring) |
| **MCP Server** | No | Yes (built in) |
| **Agent Skills** | 1 (the OpenClaw gog skill) | 47 service skills + 10 personas + ~50 recipes |
| **Maturity** | Production-stable, actively maintained | Active development, expect breakage |
| **Source** | Third-party (steipete) | googleworkspace GitHub org ("not officially supported") |

---

## 2. Feature-by-Feature Comparison

### Services We Currently Use

| Service | gog | gws | Notes |
|---------|-----|-----|-------|
| **Gmail search** | `gog gmail search 'query'` | `gws gmail users messages list --params '{"userId":"me","q":"query"}'` | gog is far more concise |
| **Gmail send** | `gog gmail send --to X --subject Y --body Z` | `gws gmail users messages send --params '{"userId":"me"}' --json '{"raw":"...base64..."}'` | gog handles MIME encoding; gws requires raw RFC 2822 base64 |
| **Gmail reply** | `gog gmail send --reply-to-message-id X` | Manual: construct threadId + In-Reply-To headers in raw | gog wins decisively |
| **Calendar list** | `gog calendar events <calId> --from X --to Y` | `gws calendar events list --params '{"calendarId":"...","timeMin":"...","timeMax":"..."}'` | Comparable, gog slightly cleaner |
| **Calendar create** | `gog calendar create <calId> --summary X --from Y --to Z` | `gws calendar events insert --params '{"calendarId":"..."}' --json '{"summary":"...","start":{"dateTime":"..."},...}'` | gog far more concise |
| **Drive search** | `gog drive search "query"` | `gws drive files list --params '{"q":"query"}'` | Similar complexity |
| **Contacts** | `gog contacts list` | `gws people connections list --params '{"resourceName":"people/me","personFields":"names,emailAddresses"}'` | gog much simpler |
| **Sheets read** | `gog sheets get <id> "Tab!A1:D10"` | `gws sheets spreadsheets values get --params '{"spreadsheetId":"...","range":"Tab!A1:D10"}'` | gog more concise |
| **Sheets write** | `gog sheets update <id> "range" --values-json '[...]'` | `gws sheets spreadsheets values update --params '{"spreadsheetId":"...","range":"...","valueInputOption":"USER_ENTERED"}' --json '{"values":[...]}'` | gog simpler |
| **Docs export** | `gog docs export <id> --format txt` | `gws docs documents get --params '{"documentId":"..."}'` (returns JSON, not plain text) | gog has better export UX |

### Services gws Has That gog Doesn't

| Service | What It Does | Relevant to Us? |
|---------|-------------|-----------------|
| **Chat** | Google Chat spaces/messages | Maybe — if we used Google Chat |
| **Tasks** | Task lists and tasks | Yes — could replace Apple Reminders for Google-native tasks |
| **Meet** | Meeting spaces, participant tracking | Low priority |
| **Forms** | Create/read Google Forms | Moderate — customer feedback, surveys |
| **Slides** | Google Slides presentations | Low — we use other tools |
| **Keep** | Google Keep notes | Low — we use Obsidian |
| **Admin** | User/group management | Not relevant (no Workspace org) |
| **Vault** | eDiscovery | Not relevant |
| **Classroom** | Google Classroom | Not relevant |
| **Apps Script** | Push/manage scripts | Niche but interesting |
| **Alert Center** | Security alerts | Not relevant for personal account |
| **Cloud Identity** | Identity groups | Not relevant |
| **Groups Settings** | Google Groups | Not relevant |
| **Licensing/Reseller** | Workspace licensing | Not relevant |
| **Model Armor** | Response sanitization | Interesting for security, but overkill now |

---

## 3. Ergonomics Comparison

**gog wins on brevity.** For the same "list recent emails" operation:

```bash
# gog (27 chars)
gog gmail search 'newer_than:7d' --max 10

# gws (82 chars)
gws gmail users messages list --params '{"userId":"me","q":"newer_than:7d","maxResults":10}'
```

**gws wins on discoverability.** The `gws schema <method>` command gives you full parameter documentation for any API method without leaving the terminal. gog requires reading docs.

**gws wins on completeness.** It covers every method in every API. gog covers the common paths well but can't do things like create Gmail filters, manage labels programmatically, or work with Chat.

**gog wins on agent-friendliness for common tasks.** The gog skill is tight and well-tested. Agents don't have to construct JSON payloads or worry about base64-encoding email bodies. The gws approach requires the agent to know the raw Google API contract.

---

## 4. Agent Skills Assessment

The 100+ skills (47 service + 10 persona + ~50 recipes) break into three tiers:

### Actually Useful for Our Workflows
- `gws-gmail-triage` — email triage patterns (we already do this with gog)
- `gws-gmail-send` — sending helper
- `gws-calendar-agenda` — standup/agenda generation
- `gws-sheets-read` / `gws-sheets-append` — targeted sheet operations
- `gws-workflow-standup-report` — meetings + tasks summary
- `gws-workflow-meeting-prep` — pre-meeting context gathering
- `gws-tasks` — Google Tasks integration (new capability)
- `gws-forms` — form creation/reading (new capability)

### Nice but Not Critical
- `recipe-create-gmail-filter` — programmatic filter creation
- `recipe-save-email-attachments` — email → Drive pipeline
- `recipe-create-events-from-sheet` — bulk calendar creation
- `recipe-find-free-time` — free/busy queries
- Persona skills (exec-assistant, researcher, etc.) — interesting but we have our own agents

### Not Relevant to Us
- Admin, Vault, Classroom, Reseller, Licensing, Cloud Identity skills
- Model Armor skills (enterprise security)
- Most persona skills (HR coordinator, IT admin, sales ops)

**Verdict:** Maybe 8-10 skills are directly useful. The recipes are well-structured and could serve as templates, but most solve problems we don't have or already handle differently.

---

## 5. MCP Server Evaluation

gws ships a built-in MCP server (`gws mcp -s drive,gmail,calendar`). This is interesting but has limited relevance right now:

**Pros:**
- Exposes all Google Workspace APIs as MCP tools
- Any MCP-compatible client (Claude Desktop, VS Code, Gemini CLI) can use it
- Per-service scoping keeps tool count manageable

**Cons:**
- OpenClaw uses skills, not MCP — our agents call `gog` or `gws` via exec
- MCP adds a layer of indirection we don't need
- Each service adds 10-80 tools, which can hit client tool limits
- Auth still needs to be set up separately

**Verdict:** Not relevant unless we move to an MCP-based orchestration layer. Our skill-based approach works fine.

---

## 6. Migration Risk Assessment

### What Would Break

1. **Auth setup** — gws uses a completely separate credential store. Would need fresh OAuth setup for all accounts. The `gws auth setup` flow requires `gcloud` CLI, adding a dependency.

2. **All existing gog commands in agent workflows** — Every agent that uses gog (Howard for Dawn Patrol, email triage, calendar; other agents for Sheets, Docs, contacts) would need command rewrites. gws commands are structurally different (JSON params vs. flags).

3. **Email sending** — gws requires raw base64-encoded RFC 2822 messages for `gmail.users.messages.send`. gog handles MIME encoding transparently. This is a significant regression in agent ergonomics.

4. **The gog OpenClaw skill** — Would need a complete rewrite or replacement with gws skills.

5. **Stability** — gws is pre-v1.0 and explicitly warns about breaking changes. Our agents run in production (Dawn Patrol, email triage). Putting production workflows on a breaking-changes-expected tool is risky.

### What We'd Gain

- Access to Chat, Tasks, Forms, Slides, Meet, Keep, Apps Script
- Schema introspection (`gws schema`)
- Auto-pagination (`--page-all`)
- MCP server (if we ever need it)
- Encrypted credential storage
- Automatic API surface updates via Discovery Service

### Migration Effort Estimate

- Auth setup: 30 min (with gcloud) to 2 hours (manual)
- Command rewrites across agents: 4-8 hours
- Testing all workflows: 4-8 hours
- Skill file updates: 2-4 hours
- **Total: 1-2 days of work, plus ongoing risk from breaking changes**

---

## 7. Recommendation

### **Watch and wait. Don't migrate.**

**Why:**
1. gog works. It's stable, ergonomic, and covers our core 6 services well.
2. gws is pre-v1.0. Breaking changes will cost us time we don't need to spend.
3. The ergonomics gap is real. Agent-written gws commands are verbose and error-prone (especially for Gmail send). gog's flag-based interface is better for LLM agents.
4. The new services we'd gain (Chat, Tasks, Forms) are mostly nice-to-have, not blocking anything.

### If we want gws for specific things:

**Run alongside, not replace.** Install gws for the APIs gog doesn't cover:
- Google Tasks (could be useful for task management)
- Google Forms (customer surveys, feedback collection)
- Google Chat (if we ever use it)
- Schema introspection (reference tool for API discovery)

This gives us the expanded API surface without touching production workflows.

### Revisit When:
- gws hits v1.0 and stabilizes
- gws adds higher-level ergonomic commands (not just raw API mapping)
- We need a service gog doesn't cover badly enough to justify the migration
- The gog project shows signs of going unmaintained

---

## Appendix: Key Differences Table

| Dimension | gog | gws | Winner |
|-----------|-----|-----|--------|
| Brevity | ✅ Short, flag-based | ❌ Verbose JSON params | gog |
| API coverage | 6 services | 30+ services | gws |
| Stability | v0.9, production-stable | v0.4.4, breaking changes expected | gog |
| Agent ergonomics | ✅ MIME handling, simple flags | ❌ Raw API, base64 encoding | gog |
| Discoverability | ❌ Docs-dependent | ✅ `gws schema` | gws |
| Auth security | ✅ OK | ✅ AES-256-GCM + keyring | gws |
| MCP support | ❌ No | ✅ Built in | gws |
| OpenClaw skill | ✅ Well-tested | ✅ 100+ skills (variable quality) | Tie |
| Pagination | ❌ Manual | ✅ `--page-all` | gws |
| Install simplicity | ✅ brew | ✅ npm (or binary) | Tie |
