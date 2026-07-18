# GitHub Activity Radar

> It's like GitHub's activity notifications — the stars, issues, and PRs you normally get emailed — but pushed to your phone in real time via WebSocket, running entirely on your machine, built by you from scratch.

A weekend project that teaches **n8n**, **webhooks**, **WebSockets**, and **React Native (Expo)** by building one cohesive, demoable app.

## How it works

```
GitHub ──webhook──► n8n ──HTTP──► Relay ──WebSocket──► Your Phone
```

1. Someone stars your repo → GitHub fires a webhook
2. n8n catches it, transforms the payload, forwards it
3. A tiny relay server broadcasts the event
4. Your phone shows it instantly — a live feed of your repo's activity

## What you'll learn

| Piece | Tech | ~Lines of code you write |
|-------|------|--------------------------|
| Mobile app | React Native (Expo) | ~80 |
| WebSocket broadcast | Node.js + `ws` | ~40 |
| Webhook processing | n8n (visual) | 0 (config in UI) |
| Real-time pipeline | Webhooks + WebSockets | ~10 config |
| Local tunnel | ngrok | 1 command |

## Stack

- **Mobile:** React Native via Expo
- **Backend:** Node.js with `ws`
- **Automation:** n8n (Docker)
- **Tunnel:** ngrok

## Quick start (tomorrow)

Open this project in your terminal and load the teacher skill to begin.

```
opencode
```

Then run the `skill` command to load the GitHub Activity Radar Teacher skill, or open `.claude/skills/github-activity-radar-teacher/SKILL.md` to read the full guide.
