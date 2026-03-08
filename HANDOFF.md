# Handoff

*Last updated: 2026-03-07 16:00 PST*
*Workspace: ~/clawd*

## Session Summary

Full day of OpenClaw gateway debugging and repair. Gateway was crash-looping on boot; fixed it, resolved dashboard auth, fixed Matrix plugin, rotated CLI device token. Session ended investigating why Matrix agents aren't responding in Element despite the gateway being healthy.

---

## Completed This Session

### OpenClaw Gateway Fixes
- ✅ **Fixed crash-loop** — v2026.3.2 (Homebrew) expected `gateway.auth.password` but config had `gateway.auth.token`. Renamed + added both fields.
- ✅ **Identified real password** — `env.OPENCLAW_GATEWAY_PASSWORD = "KLRopenclaw!650"` overrides `gateway.auth.password`. Confirmed via direct WebSocket test. All three fields now synced.
- ✅ **Dashboard connected** — Control UI at `http://127.0.0.1:18789` connecting successfully. Password: `KLRopenclaw!650`.
- ✅ **Stopped agents** — Killed gateway to stop 52 active sessions burning through maxed API usage.
- ✅ **Matrix plugin fixed** — `@vector-im/matrix-bot-sdk@0.8.0-element.3` was missing. Installed full dep tree (~167 packages) into the fnm openclaw extensions matrix node_modules.
- ✅ **CLI device token rotated** — Was getting device_token_mismatch. Rotated successfully.

### Gateway Config State
- **Running version:** OpenClaw v2026.2.15 (fnm, NOT Homebrew)
- **Plist:** `/Users/brian/Library/LaunchAgents/ai.openclaw.gateway.plist`
- **Config:** `~/.openclaw/openclaw.json`
- **Password:** `KLRopenclaw!650` (in env.OPENCLAW_GATEWAY_PASSWORD, gateway.auth.password, and gateway.auth.token)
- **Port:** 18789 (loopback + Tailscale serve)

---

## Open Issue: Matrix Agents Not Responding in Element

### What we know
- Gateway healthy, all 15 Matrix accounts log in on startup
- Messages ARE received — runs start/complete (isError=false) in ~1-2 seconds
- **No Matrix send events in logs** — runs complete but nothing delivered back to room
- Last active room: !gEmPKZdOKsVhJQWLoV:briancline.co (#marine)

### Most likely cause
**MEMORY.md is 20,095 chars but gateway injection limit is 6,307 chars** — Howard's context truncated to ~31% on every run. Likely causes silent/empty responses.

### Immediate next step: Trim MEMORY.md
- Current: 20,095 chars / 249 lines — needs to be under ~5,500 chars
- Brian's instruction: save trimmed content to multiple files first, don't delete
- Plan:
  1. Archive full MEMORY.md to `~/clawd/memory/MEMORY-archive-2026-03-07.md`
  2. Split into topic files in `~/clawd/memory/` (financial.md, personal.md, technical.md, projects.md)
  3. Rewrite MEMORY.md as concise index ~100-150 lines with pointers to topic files
  4. Restart gateway after

---

## Key Config Facts to Know

- `env` section of openclaw.json contains OPENCLAW_GATEWAY_PASSWORD — this OVERRIDES gateway.auth.password. Always check env section first when debugging auth.
- Matrix plugin deps are manually installed at: `/Users/brian/.local/share/fnm/node-versions/v22.22.0/installation/lib/node_modules/openclaw/extensions/matrix/node_modules/`
- `running=false` in channel health API is a v2026.2.15 reporting quirk — channels ARE running if logged-in messages appear in logs

---

## Next Steps

1. **Trim MEMORY.md** — most urgent, likely root cause of silent Matrix responses
2. **Test Matrix response** after trimming — send message in #marine, watch for send events in logs
3. Fix imageModel.primary — `google/gemini-2.5-flash-preview` returns "Unknown model"
4. Cron re-enabled — watch for usage spike if Anthropic quota resets
