# Noa's Source List

Last updated: 2026-02-23 (v5)

## 🎯 Primary Sources (check every night)

### Greg Isenberg — The Startup Ideas Podcast
- **RSS Feed:** https://www.youtube.com/feeds/videos.xml?channel_id=UCPjNBjflYl0-HQtUvOx0Ibw
- **Method:** `web_fetch` the RSS feed to find new episodes (published dates are in the XML). For any episode from the last 48 hours, run `summarize https://www.youtube.com/watch?v=<VIDEO_ID> --youtube auto` to get the full transcript.
- **What to extract:** Business ideas, methods, tools, guest names, referenced creators/builders
- **Frequency:** New episodes ~2-3x/week

### Peter Yang — Creator Economy & Product
- **RSS Feed:** https://www.youtube.com/feeds/videos.xml?channel_id=UCkipSmIsFMgLOb-arzjQJOw
- **Method:** Same as Greg Isenberg — `web_fetch` RSS, `summarize` new episodes from last 48h
- **What to extract:** Product strategy, creator economy insights, growth tactics, AI applications
- **Frequency:** Check nightly

### Hacker News
- **URL:** https://news.ycombinator.com/
- **Focus:** "Show HN" launches, AI business discussions, solo founder stories, SaaS/micro-SaaS ideas
- **Method:** `web_fetch` the front page, dig into promising threads
- **Skip:** Pure tech debates, language wars, politics, drama

## 📡 Secondary Sources

### AI Business & Builders
- https://www.indiehackers.com/ — Solo founder stories and revenue numbers
- https://microconf.com/resources — SaaS growth tactics (note: /blog returns 404 as of 2026-02-18, try /resources)
- https://www.saastr.com/blog/ — SaaS business insights

### AI & Technology
- https://simonwillison.net/ — Simon Willison's blog (practical AI tools)
- https://www.latent.space/ — Latent Space podcast/blog
- https://www.anthropic.com/news — Anthropic announcements
- https://openai.com/blog — OpenAI blog

### Marine Services & SailorSkills
- https://www.latitude38.com/ — Bay Area sailing publication
- https://www.boatingindustry.com/ — Boating industry trends
- https://www.dockwa.com/blog — Marina management software

## 🌱 Sources to Evaluate
*Discovered through primary source research — need to check if they're worth adding as regular sources.*

- **cpojer.net** (Christoph Nakazawa) — Frontend tooling + AI agent development patterns. Discovered 2026-02-18.
- **@louispereira / AudioPen** — Solo founder voice-to-text SaaS. Discovered 2026-02-18.
- **Fawaz Ishola (Axiom OS)** — 19-year-old systems programmer building math-native OS. Extreme talent worth tracking. Discovered 2026-02-18.
- **Anna's Archive** — Non-profit knowledge preservation with thoughtful AI/LLM engagement policies. Model for ethical data access. Discovered 2026-02-18.
- **CEL (Common Expression Language)** — Lightweight business logic language used by Kubernetes, Google Cloud, Firebase. Could be useful for SailorSkills validation logic. Discovered 2026-02-18.
- **Nick Vasilescu / Orgo** — OpenClaw deployment specialist, builds automation-as-a-service. Featured on Greg Isenberg. Discovered 2026-02-19.
- **Alexander Van Le** (@qwertyu_alex) — AI portfolio bootstrapper, $20k/mo across Starpop + AI Flow Chat. Marketing-first approach. Discovered 2026-02-19.
- **Juno Labs** (juno-labs.com) — Ambient AI hardware startup. Always-on, local-only home AI assistant. Pioneer Edition $1,299. Interesting engineering blog on memory/privacy. Discovered 2026-02-21.
- **Taalas** (taalas.com) — Custom silicon for AI inference. Hardwires models into chips. 17K tok/sec on Llama 3.1 8B. $200M VC, ex-AMD/Nvidia founders. Discovered 2026-02-21.
- **Boris Tane** (boristane.com) — Claude Code workflow specialist. Plan-first methodology hit #1 on HN (414 pts). Discovered 2026-02-22.
- **zclaw** (github.com/tnm/zclaw) — Embedded Claw for ESP32 in 888KB. Reference implementation for IoT/embedded AI assistants. Discovered 2026-02-22.
- **Human Root of Trust** (humanrootoftrust.org) — Public domain framework for cryptographic agent accountability. Relevant for Claw deployment. Discovered 2026-02-22.
- **Shuru** (shuru.run) — Local-first microVM sandbox for AI agents on macOS. Checkpoint/restore, network isolation. Solves agent sandboxing. Discovered 2026-02-23.
- **Aqua / Mistermorph** (github.com/quailyquaily/aqua) — P2P encrypted messaging CLI for AI agents. Identity verification + E2EE. Early but interesting inter-Claw communication primitive. Discovered 2026-02-23.
- **Gabriel Chua** (OpenAI DevEx APAC) — Published clear Codex architecture breakdown (model + harness + surfaces). Useful competitive intelligence source. Discovered 2026-02-23.

---

## Notes
- This list should grow organically as Noa discovers new voices through Greg Isenberg's guests and HN threads
- Prioritize sources with frequent updates and actionable content
- Remove sources that consistently have nothing useful
- Greg Isenberg's guests are a goldmine — each guest is a potential new source
