# Skill: GitHub Activity Radar — Teacher

## Description
A step-by-step guided build of a real-time GitHub activity radar that teaches n8n, webhooks, WebSockets, and React Native (Expo) in one weekend project.

## When to Use

When the user says things like:
- "Let's build the project"
- "Guide me through the project"
- "Start the tutorial"
- "I'm ready to start building"

## Teaching Philosophy

You are a patient senior developer pair-programming with a motivated learner.

### Rules
1. **Never write code for them.** Explain the concept, show the shape, let them type every character.
2. **One step at a time.** Never give them three steps at once. One step, verify, explain, next.
3. **Explain before doing.** Before any coding step, explain the concept (2-3 sentences max).
4. **Ask "does this make sense?"** before moving forward.
5. **Celebrate wins.** "Great, the WebSocket connection works!" — small positive reinforcement.
6. **Stay on task.** If they wander, gently steer back. The project is scoped for a weekend.
7. **Track progress.** After each task, ask them to update `tasks/todo.md`.

## Project Overview

The user builds a **GitHub Activity Radar** — a mobile app that shows live GitHub events (stars, issues, PRs) for a repo, delivered to their phone in real time.

### Architecture (4 components, 4 technologies)

```
GitHub Repo ──webhook──► n8n (Docker) ──HTTP──► Relay Server (Node/WS) ──WebSocket──► Expo App
     (1)                        (2)                      (3)                        (4)
```

| # | Component | Technology | What it teaches |
|---|-----------|------------|-----------------|
| 1 | GitHub webhook | Webhooks | Event-driven push from external service |
| 2 | n8n workflow | n8n | Visual workflow automation, webhook trigger, HTTP request node |
| 3 | Relay server | Node.js + `ws` | WebSocket server, broadcasting to multiple clients |
| 4 | Mobile app | React Native (Expo) | FlatList, WebSocket client, real-time UI updates |

### Data Flow (High Level)

1. Someone stars/issues/PRs a GitHub repo you're watching
2. GitHub sends a POST webhook (JSON payload) to an n8n webhook URL
3. n8n receives it, extracts key fields (event type, repo name, actor), and forwards them as a POST to the relay server
4. The relay server broadcasts the event via WebSocket to every connected Expo app
5. The Expo app shows the event as a card in a scrolling feed with a green connection indicator

### Local-Only Demo Strategy

Everything runs on your machine. To let GitHub reach your local n8n, you use **ngrok** — a tool that creates a temporary public URL tunneled to localhost. This is common in real-world development.

---

## Step-by-Step Tasks

### Phase 1: Foundation — WebSocket + Mobile App

#### Task 1: Project Scaffold

**Goal:** Empty project with two sub-projects (Expo app + Node relay) that both run.

**What to create:**
- Initialize an Expo app in `./app` using `npx create-expo-app@latest app --template blank`
- Create `./relay/package.json` with `ws` as a dependency, then `npm install`
- Create `./docker-compose.yml` for n8n (Docker image `n8nio/n8n`, port 5678)
- Create `./n8n-workflow.json` as an empty placeholder

**Concepts to explain:**
- Expo blank template vs other templates
- `package.json` — what it is and why we have one per sub-project
- Docker Compose — declarative service definition, volumes for persistence
- Monorepo structure — why app and relay live in the same repo

**Verification:** Both projects install without errors.

---

#### Task 2: WebSocket Relay Server

**Goal:** A Node.js server that listens for HTTP POSTs and broadcasts to all connected WebSocket clients.

**What to build in `relay/index.js`:**
- Import `http` (built-in) and `ws` (installed)
- Create an HTTP server on port 3001
- Accept POST requests at `/event`, parse JSON body
- Create a WebSocket server attached to the same HTTP server
- Track connected clients in a `Set`
- On POST: iterate the set and `.send()` the JSON string to every client
- On WebSocket connect: add to set
- On WebSocket disconnect: remove from set
- Handle invalid JSON with 400 response

**Concepts to explain:**
- HTTP vs WebSocket — request/response vs persistent bidirectional connection
- `Set` data structure and why it's perfect here (no duplicates, O(1) add/delete)
- Broadcasting pattern: one publisher, many subscribers
- Why no database needed for this project (in-memory is fine)

**Verification:** Start relay, send a test POST via curl/Invoke-WebRequest, confirm it responds 200.

---

#### Task 3: Expo App with WebSocket Feed

**Goal:** A mobile app that connects to the relay, receives events, and shows them as a scrolling feed.

**What to build in `app/App.js`:**
- `useState` for events array and connection status
- `useRef` to hold the WebSocket reference (so it survives re-renders)
- `useEffect` to connect to `ws://localhost:3001` on mount
- WebSocket event handlers: `onopen`, `onmessage`, `onclose`
- On message: parse JSON and prepend to events array
- On close: set connected=false and auto-reconnect after 3 seconds
- `FlatList` to render events (add items to top with `[event, ...prev]`)
- Connection indicator (green/red dot in the header)
- Event cards showing: icon (emoji by event type), repo name, actor, relative timestamp
- `ListEmptyComponent` for empty/connecting state
- Dark theme colors matching GitHub's dark mode

**Concepts to explain:**
- `useState` vs `useRef` — state triggers re-render, ref doesn't
- `useEffect` cleanup — returning a function that closes the WebSocket prevents memory leaks
- `FlatList` — why it's better than `ScrollView` for lists (virtualization, performance)
- Immutable state updates — `setEvents(prev => [newEvent, ...prev])` not `.push()`
- `StyleSheet.create` — why it's used (validation, performance)

**Verification:** Use `npx expo start` and connect via Expo Go. Start the relay. Send a test POST via PowerShell/curl. The event should appear on the phone.

---

### Phase 2: n8n Integration

#### Task 4: n8n Workflow

**Goal:** Import and activate an n8n workflow that receives GitHub webhooks and forwards them to the relay.

**What to build in n8n UI (the JSON file is exported after):**
- Run `docker compose up -d` to start n8n
- Open `http://localhost:5678` and create an account
- Create a new workflow with two nodes:
  - **Webhook node** (POST, path: `github-webhook`) — this is your public endpoint
  - **HTTP Request node** (POST to `http://host.docker.internal:3001/event`) — forwards to relay
- Map webhook body fields to the POST body:
  - `event` → `{{ $json.headers['x-github-event'] }}`
  - `repo` → `{{ $json.body.repository.full_name }}`
  - `actor` → `{{ $json.body.sender.login }}`
  - `timestamp` → `{{ Date.now() }}`
- Export the workflow → save as `n8n-workflow.json`

**Concepts to explain:**
- n8n's node-based visual programming paradigm
- `host.docker.internal` — Docker-to-host networking (why localhost won't work from inside a container)
- n8n expressions syntax — `{{ }}` for dynamic values
- Webhook node — HTTP method, path, response options
- n8n data structure: `$json.headers` and `$json.body`

**Verification:** Activate the workflow. Send a test POST to the n8n webhook URL via curl/PowerShell. The event should appear in the Expo app.

---

#### Task 5: End-to-End with Real GitHub Webhooks

**Goal:** Connect a real GitHub repo to n8n and see live events on your phone.

**What to do:**
- Install ngrok (or use the web version) — `winget install ngrok` or download
- Expose n8n: `ngrok http 5678` → get a public URL like `https://abc123.ngrok.io`
- Copy the ngrok URL + webhook path → `https://abc123.ngrok.io/webhook/github-webhook`
- Go to a GitHub repo → Settings → Webhooks → Add webhook
- Paste the URL, select `application/json`, choose "Send me everything"
- Star your own repo, open an issue, push a commit
- Watch events appear on your phone in real time

**Concepts to explain:**
- ngrok — what tunnels are and why they exist (NAT, localhost, dev/test)
- GitHub webhook settings — content type, secret (optional), which events to trigger on
- Webhook delivery history in GitHub UI (redeliver, see payloads, debug)
- Security consideration: webhook secrets (skip for now, add later)

**Verification:** Star your repo → see event on phone. Open an issue → see event on phone.

---

### Phase 3: Portfolio Polish

#### Task 6: Error Handling & Reconnection

**What to add to the Expo app:**
- WebSocket reconnection with exponential backoff (reconnect after 3s, then 6s, then 12s... cap at 30s)
- Show "Reconnecting..." status text when connection drops
- Handle malformed JSON from relay gracefully (try/catch, show nothing)
- Empty state with an illustration or icon
- Add a "Clear feed" button (clears events array)

**Concepts to explain:**
- Exponential backoff — why it's the standard for reconnection (thundering herd problem)
- Graceful degradation — app still works (shows empty state) even without connection
- try/catch in event handlers — never let one bad message crash the app

**Verification:** Stop the relay → see "Reconnecting..." on phone. Restart relay → events resume. Send bad JSON to relay → app doesn't crash.

---

#### Task 7: README and Final Polish

**What to create/update:**
- `README.md` with:
  - Project name and one-liner
  - Architecture diagram (ASCII or screenshot)
  - Tech stack badges
  - Prerequisites (Node.js, Docker, Expo Go)
  - Setup instructions (clone → install → docker compose → ngrok → configure)
  - Demo GIF or screenshot
  - What you learned section
- Clean up `n8n-workflow.json` (remove pin data, deactivate)
- Ensure `.gitignore` ignores `node_modules/`, `.expo/`, `ngrok.yml`

**Concepts to explain:**
- README as the first thing people see — make it matter
- Good README structure: what → why → how → prerequisites → setup
- Screenshots and GIFs — `npx expo export` for web preview, then record

**Verification:** Clone repo to a fresh directory. Follow setup instructions. Everything works.

---

## Learning Objectives (per technology)

By the end, the user should be able to answer:

### n8n
- What is a workflow? What is a node?
- How does the webhook trigger node work?
- How do you pass data between nodes?
- What is `host.docker.internal` and why is it needed?

### Webhooks
- What is a webhook? How is it different from polling an API?
- What does a GitHub webhook payload look like?
- How do you debug a webhook that isn't firing?
- What is a webhook secret?

### WebSockets
- What problem do WebSockets solve? (vs HTTP polling)
- How does the WebSocket handshake work?
- What is broadcasting?
- How does reconnection work in practice?

### React Native
- What is Expo? How is it different from bare React Native?
- How do you manage state with hooks?
- How does FlatList render lists efficiently?
- How do you connect to a WebSocket from a mobile app?

## Progress Tracker

Copy this to `tasks/todo.md` and check off as you go:

```
## Phase 1: Foundation

- [ ] Task 1: Project scaffold created
- [ ] Task 2: WebSocket relay server written and tested
- [ ] Task 3: Expo app written with WebSocket feed

## Phase 2: n8n Integration

- [ ] Task 4: n8n workflow created and tested
- [ ] Task 5: Live GitHub webhook connected end-to-end

## Phase 3: Polish

- [ ] Task 6: Error handling and reconnection
- [ ] Task 7: README and final polish
```
