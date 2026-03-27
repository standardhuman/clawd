# TMC Website Proposal
## For Vision Body Review

**Prepared by:** Brian Cline
**Date:** March 27, 2026
**Status:** Draft for VB consideration

---

## What This Is

A new website for The Men's Circle — already built, already running, ready for feedback and launch.

**Live preview:** tmc.briancline.co
**Feedback form:** tmc.briancline.co/feedback

---

## The Problem

The current themenscircle.com doesn't reflect who we are or what we offer. Men visiting the site for the first time don't get a clear picture of what TMC is, how to connect, or why they'd want to show up.

Members don't have a central place to find contact info, resources, or announcements without asking around.

---

## What's Already Built

The site is functional today. Here's what exists:

**Public-facing (anyone can visit):**
- Landing page — clear headline, what we do, how we meet
- Contact form — curious men can reach out; submissions go to a Google Sheet + notification
- Design that reflects TMC's character: grounded, warm, earthy, not corporate

**Members-only (behind login):**
- Member directory — searchable, pulls live from the existing roster
- Resources library — meeting agendas, facilitation guidelines, community docs
- Announcements — updates posted in reverse chronological order
- Secure login — email/password authentication through Supabase, access granted based on roster email

**Coming soon to the members area:**
- House cleaning tools
- Events calendar
- Member map
- And more as needs emerge

---

## How It Works (No New Systems)

The site reads directly from Google Sheets. The same sheets TMC already uses.

- Add someone to the roster sheet → they can log in and appear in the directory
- Remove them → access revoked immediately
- Update contact info → directory reflects it automatically
- Post an announcement → it shows up on the site

No admin panel to learn. No WordPress plugins to update. No manual syncing.

---

## Design Direction

- **Palette:** Deep charcoal, warm earth tones, ember orange accents, soft cream backgrounds
- **Typography:** Strong serif headlines (grounded, readable), clean sans-serif body text
- **Imagery:** Fire, nature, texture — nothing corporate or stock-photo
- **Feel:** Like the circle itself — substantial, warm, purposeful

---

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | Vite + vanilla JS | Fast, lightweight, no framework bloat |
| Hosting | Vercel (free tier) | Automatic SSL, global CDN, zero maintenance |
| Backend | Vercel serverless functions | Scales automatically, no server to manage |
| Data | Google Sheets API | Admins keep their existing workflow |
| Auth | Supabase | Email/password login, roster-based access control |
| Email | Resend | Contact form notifications |

**Hosting cost:** $0/month
**Ongoing maintenance:** ~1-2 hours/month (verification, occasional tweaks)

---

## Timeline

| Milestone | Target |
|-----------|--------|
| Feedback collection open | Now through April 9 |
| Committee review + revisions | April 9–23 |
| Final review with VB | Last week of April |
| Public launch | First Wednesday in May |
| Feedback season | May through end of summer |

---

## Advisory Committee (Proposed)

To make sure this isn't just one person's vision:

- **Jonathan Mandel** — new man onboarding perspective
- **Chris Breen** — copy and messaging
- **David Shakiban** — creative direction

These men would provide sustained input through launch, not just a one-time review.

---

## What I Need From the Vision Body

1. **Approval** to proceed with this timeline and approach
2. **DNS access** — who manages themenscircle.com? I'll need to point it to the new site at launch
3. **Review the preview** at tmc.briancline.co and submit feedback through the form by April 9
4. **Blessing on the committee** — any concerns about the proposed members?

---

## What This Costs TMC

Nothing. I'm building and maintaining this as my contribution to the circle.

That includes design, development, deployment, training for whoever manages the sheets, and documentation so someone else can maintain it if needed.

---

## Comparison: Current vs. Proposed

| | Current Site | New Site |
|---|---|---|
| First impression | Unclear, dated | Clear purpose, inviting |
| Member directory | None | Searchable, live from sheet |
| Content updates | Manual (someone edits HTML?) | Edit a Google Sheet |
| Security | Unknown | Automatic (Vercel + Supabase auth) |
| Mobile experience | Unknown | Responsive, tested |
| Cost | Unknown | $0/month |
| Maintenance burden | Unknown | Near-zero |

---

## Risks & Mitigations

**"What if Brian disappears?"**
The site is documented, the code is on GitHub, and it runs on free infrastructure. Any developer could pick it up. I'll also create a maintenance guide.

**"What about the Google Sheets dependency?"**
Sheets is the strength here — it's what TMC already uses. If Google Sheets ever goes away (unlikely), migrating to another data source is straightforward.

**"What if members have trouble logging in?"**
Standard email/password login — familiar to everyone. Access is tied to the roster, so onboarding and offboarding happen in one place.

---

## Next Steps (Upon Approval)

1. Committee kicks off — first review session within the week
2. Collect and incorporate VB + committee feedback
3. Final copy review with Chris Breen
4. DNS coordination for themenscircle.com
5. Launch first Wednesday in May
6. Summer feedback season with the wider circle

---

*Submitted with respect for the VB's time and the circle's trust.*
