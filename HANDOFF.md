# Handoff

*Last updated: Saturday, January 31, 2026 18:18 PST*
*Branch: main*
*Agent: Howard*

## Current Task
Added new customer Greg Barnes (boat: The Circus Police) to Notion client database, and set up 1Password shell plugins for better credential management.

## State
**Completed this session:**
- Found Greg Barnes order in Supabase (sailorskills-platform database at `fzygakldvvzxmahkdylq.supabase.co`)
  - Order: ORD-1769637620915-V29ME (Jan 28, 2026)
  - One-time Cleaning & Anodes, $273
  - Note: "There is a big anode between motors that i am sure need to be replaced"
- Created Notion entry for "The Circus Police" in Diving Client List
  - Greg Barnes, 1sweetleni@gmail.com, 415-261-4401
  - Regal 292 Commodore, 30 ft powerboat
  - Berkeley Marina (BRK), Dock B, Slip 6
  - Plan: One time, Start: 1, Interval: 0
  - Notion page ID: 2fab82b7-eacc-8122-aa89-e3e238ba8afa
- Saved "Notion - Howard Integration" token to 1Password (SailorSkills vault)
- Installed Stripe CLI and configured 1Password shell plugin
- Added shell plugin source to ~/.zshrc

**Not completed:**
- GitHub CLI shell plugin (needs Personal Access Token created on GitHub first)

## Key Context

### Supabase Databases
There are TWO Supabase instances:
1. **Production/Platform** (`fzygakldvvzxmahkdylq.supabase.co`) — has real customer orders, boats, service_orders table
   - Creds in: `~/AI/business/sailorskills-platform/.env.local`
2. **Staging/Pro** (`aaxnoeirtjlizdhnbqbr.supabase.co`) — newer schema for Pro app
   - Creds in: `~/AI/business/sailorskills/environments/.env.staging`

### 1Password Setup
- SailorSkills vault contains: Stripe, Supabase Production, OpenAI (Whisper), Resend, Notion - Howard Integration
- Stripe shell plugin configured — `stripe` CLI will prompt for Touch ID
- Shell plugins sourced from: `/Users/brian/.config/op/plugins.sh`

### Notion Access
- Howard integration token: stored in 1Password (SailorSkills vault)
- Diving Client List database ID: `0ae0e330-780b-4764-956e-12e8ee344ea2`
- API version: 2022-06-28 (NOT 2025-09-03)

## Next Steps
1. **GitHub PAT** — If Brian wants GitHub shell plugin, he needs to:
   - Go to github.com → Settings → Developer settings → Personal access tokens
   - Create token with scopes: `repo`, `read:org`, `gist`
   - Run `op plugin init gh` and import to 1Password
2. Consider adding more API keys to 1Password for centralized management:
   - Anthropic API key (currently in .env.staging)
   - Gemini API key (currently in .env.staging)

## Open Questions
None — all tasks completed.

## Files Changed
- HANDOFF.md (this file)
- ~/.zshrc (added 1Password shell plugins source)
- 1Password: Added "Notion - Howard Integration" item
- 1Password: Updated "Stripe" item field name to "key" for plugin compatibility
- Notion: Created new page for The Circus Police
