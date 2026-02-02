---
name: context-monitor
description: "Resets context monitor state when session is reset via /new"
metadata: {"clawdbot":{"emoji":"📊","events":["command:new"]}}
---

# Context Monitor Reset Hook

Resets the context usage alert state when a session is cleared via `/new`.

This ensures:
- Fresh sessions start with no prior alert state
- Threshold alerts begin anew after each reset

Works in conjunction with the context-monitor cron job.
