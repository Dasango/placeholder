# Implementation Plan: GitHub Activity Radar

## Overview
A React Native (Expo) mobile app that displays live GitHub activity (stars, issues, PRs) for a repo using n8n as the webhook receiver/transformer and a WebSocket relay server to push events to the app in real time.

## Architecture

```
GitHub Repo ──webhook──► n8n (Docker) ──HTTP──► Relay Server (Node/ws) ──WebSocket──► Expo App
```

All local, all demoable in one terminal session. ngrok tunnels n8n to the internet.

## Project Structure

```
github-activity-radar/
├── app/                    # Expo app
├── relay/                  # WebSocket relay server
├── n8n-workflow.json       # Exported n8n workflow
├── docker-compose.yml      # n8n
└── README.md
```

## Task List

### Phase 1: Foundation (WebSocket + Mobile App)
- [ ] **Task 1:** Project scaffold — init Expo app, init relay, verify both run
- [ ] **Task 2:** WebSocket relay server — single Node.js file, broadcasts incoming messages to all connected clients
- [ ] **Task 3:** Expo app with WebSocket client — real-time scrolling feed, connection indicator, mock data for dev

### Phase 2: n8n Integration
- [ ] **Task 4:** n8n workflow — docker-compose, webhook trigger → transform → forward to relay
- [ ] **Task 5:** End-to-end connection — ngrok tunnel, connect GitHub webhook, validate full flow

### Phase 3: Portfolio Polish
- [ ] **Task 6:** Error handling & reconnection — WebSocket reconnection, empty state, error state
- [ ] **Task 7:** README & final touches — architecture diagram, setup instructions, demo screenshots

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Docker/n8n doesn't work on Windows | Med | Fallback: use n8n's cloud free tier or npx direct install |
| ngrok rate limits (40 req/min) | Low | Fine for personal repo demo |
| WebSocket reconnection edge cases | Low | Use standard reconnection strategy |

## Learning Path
Each task introduces one concept. Order is intentional:
1. Scaffold → project structure and toolchain
2. Relay server → HTTP + WebSocket fundamentals
3. Expo app → mobile state management + real-time UI
4. n8n workflow → visual automation, data transformation
5. Live webhooks → ngrok, GitHub integration
6. Error handling → production readiness
7. README → portfolio polish
