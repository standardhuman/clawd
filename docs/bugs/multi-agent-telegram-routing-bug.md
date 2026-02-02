# Bug Report: Multi-Agent Telegram Message Routing

## Summary

In a multi-agent Clawdbot setup with multiple Telegram bots, command confirmations (like `/new` responses) and cron job outputs are being delivered to the wrong Telegram chat.

## Environment

- Clawdbot version: 2026.1.24-3
- Configuration: 3 agents (main, jacques, marcel) bound to 3 separate Telegram bots
- Each agent has its own workspace and Telegram account binding

## Configuration

```json
{
  "agents": {
    "list": [
      { "id": "main", "name": "Howard", "workspace": "~/clawd" },
      { "id": "jacques", "name": "Jacques", "workspace": "~/clawd-jacques" },
      { "id": "marcel", "name": "Marcel", "workspace": "~/clawd-marcel" }
    ]
  },
  "bindings": [
    { "agentId": "main", "match": { "channel": "telegram", "accountId": "main" } },
    { "agentId": "jacques", "match": { "channel": "telegram", "accountId": "jacques" } },
    { "agentId": "marcel", "match": { "channel": "telegram", "accountId": "marcel" } }
  ],
  "channels": {
    "telegram": {
      "accounts": {
        "main": { "botToken": "..." },
        "jacques": { "botToken": "..." },
        "marcel": { "botToken": "..." }
      }
    }
  }
}
```

## Steps to Reproduce

1. Set up multi-agent configuration with 3 Telegram bots as above
2. Message the "jacques" bot and run `/new`
3. Observe that the "✅ New session started" confirmation appears in the "main" (Howard) bot chat instead of the "jacques" chat

## Expected Behavior

- `/new` confirmation should appear in the same Telegram chat where the command was sent
- Each agent's messages should route to their respective Telegram bot

## Actual Behavior

- `/new` confirmation for "jacques" appears in "main" (Howard) chat
- Cron job outputs may also route to the wrong chat (when using cron's built-in `deliver` without explicit `accountId`)

## Investigation Notes

### Code Trace

The routing flow appears correct in the source:

1. **Inbound context** (`telegram/bot-message-context.js`):
   - `AccountId: route.accountId` is set from `resolveAgentRoute()`
   - `route.accountId` comes from `account.accountId` passed to the bot

2. **Command processing** (`auto-reply/reply/get-reply-run.js`):
   ```javascript
   await routeReply({
       payload: { text },
       channel,
       to,
       sessionKey,
       accountId: ctx.AccountId,  // Should be correct
       threadId: ctx.MessageThreadId,
       cfg,
   });
   ```

3. **Delivery** (`infra/outbound/deliver.js` → `channels/plugins/telegram.js` → `telegram/send.js`):
   - `accountId` is passed through the chain
   - `sendMessageTelegram()` calls `resolveTelegramAccount({ cfg, accountId: opts.accountId })`
   - Token is resolved from the correct account

### Possible Root Causes

1. **Session key collision**: All DMs collapse to `agent:<agentId>:main`. If there's any cross-contamination in session lookup, the wrong accountId could be used.

2. **Context not preserved**: The `ctx.AccountId` might be getting lost or defaulted during command processing.

3. **grammY bot instance sharing**: If bot instances share state inappropriately, accountId could bleed across.

4. **Default account fallback**: If `accountId` is undefined/null at any point, `resolveTelegramAccount` falls back to the default account.

### Workaround

For cron jobs, we worked around this by:
1. Setting `deliver: false` on the cron job
2. Having the agent explicitly use the `message` tool with the correct `accountId` parameter

This workaround doesn't apply to command confirmations like `/new`.

## Impact

- Confusing UX when messages appear in unexpected chats
- Users may think session resets are affecting multiple agents when they're not
- Context monitoring alerts route to wrong chats (without the workaround)

## Suggested Fix

Need to add debug logging to trace where `accountId` is being lost or defaulted:

```javascript
// In routeReply or deliverOutboundPayloads
console.log(`[routing] channel=${channel} to=${to} accountId=${accountId}`);
```

Then reproduce and check if:
1. `accountId` is correct when `routeReply` is called
2. `accountId` is correct when `sendMessageTelegram` is called
3. `resolveTelegramAccount` returns the correct account

## Related

- Multi-agent documentation: `/docs/concepts/multi-agent.md`
- Telegram channel docs: `/docs/channels/telegram.md`
