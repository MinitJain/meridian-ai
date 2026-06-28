# Meridian AI Bot — Project Recovery

## Goal
AI search bot with web search + real-time streaming responses.

## Stack
- **Backend:** Express + Socket.IO + MistralAI (LangChain) + Tavily + Nodemailer
- **Frontend:** React 19 + Vite + TypeScript + socket.io-client
- **AI logic:** `backend/core/` — fully decoupled, reusable across projects

---

## Current State (June 2026)

### ✅ Done
- Packages installed: `express`, `socket.io`, `cors`, `@tavily/core`, `@langchain/mistralai`, `@langchain/core`, `nodemailer`, `zod`, `dotenv`
- `backend/core/model.js` — MistralAI (mistral-large-latest) singleton with bound emailTool; exports `model` and `emailTool`
- `backend/core/search.js` — Tavily search wrapper; exports `searchWeb(query)`
- `backend/server.js` — Express + HTTP server on port 3000, CORS, JSON middleware
- `backend/sockets/server.socket.js` — Socket.IO init with event handlers:
  - `user_question` → `shouldSearch()` (Mistral classifier) → Tavily (conditional) → emit `sources` → stream Mistral → handle tool calls → stream follow-up → emit `response_done`
  - `shouldSearch()` replaces the old greylist — asks Mistral YES/NO if web search is needed
  - Everything wrapped in try/catch → emits `error` event on failure
- `backend/mail.service.js` — Nodemailer email sender
- `backend/.env` — `MISTRAL_API_KEY`, `TAVILY_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`
- Frontend: Vite + React 19 + TypeScript + socket.io-client
- `frontend/src/types/chat.ts` — `Source` and `Message` (with optional `error` field) interfaces
- `frontend/src/services/socket.ts` — typed Socket.IO helper functions; raw `io()` NOT exported
- `frontend/src/hooks/useChat.ts` — messages state, socket event wiring (sources, chunk, done, error)
- `frontend/src/hooks/useScroll.ts` — generic scroll detection (not chat-specific, reusable)
- `frontend/src/components/ChatMessage.tsx/css` — React.memo with custom comparator; supports error state
- `frontend/src/components/ChatInput.tsx/css` — auto-growing textarea, inline send arrow, Enter/Shift+Enter
- `frontend/src/components/SourceChips.tsx/css` — horizontal chips, inline SVG icon, no external service
- `frontend/src/components/ThinkingDots.tsx/css` — CSS animated dots, respects prefers-reduced-motion
- `frontend/src/App.tsx` — glue layer: useChat + useScroll, empty state, scroll-to-bottom button
- `frontend/src/index.css` — CSS variables, dark theme, resets, custom scrollbar, `--error` var
- `frontend/vite.config.ts` — proxy `/socket.io` → `http://localhost:3000`
- `package.json` scripts: `npm run dev` (node --watch), `npm start` (node server.js)

## Project Structure
```
meridian-ai/
├── backend/
│   ├── core/
│   │   ├── model.js          → MistralAI + emailTool (singleton, reusable)
│   │   └── search.js         → Tavily wrapper (reusable)
│   ├── sockets/
│   │   └── server.socket.js  → Socket.IO init + event handlers
│   ├── server.js             → Express + HTTP server on :3000
│   ├── mail.service.js       → Nodemailer transport
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── types/
│   │   │   └── chat.ts       → Source, Message interfaces
│   │   ├── services/
│   │   │   └── socket.ts     → Typed Socket.IO wrapper (no raw export)
│   │   ├── hooks/
│   │   │   ├── useChat.ts    → Messages state + socket wiring
│   │   │   └── useScroll.ts  → Generic scroll detection
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx/css  → Memoized user/bot messages + error state
│   │   │   ├── ChatInput.tsx/css    → Auto-growing textarea + send icon
│   │   │   ├── SourceChips.tsx/css  → Horizontal scrollable source chips
│   │   │   └── ThinkingDots.tsx/css → CSS animated loading dots
│   │   ├── App.tsx           → Glue: useChat + useScroll
│   │   ├── App.css           → Layout (centered 720px, dark)
│   │   ├── index.css         → CSS variables, resets, theme
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts        → Proxy /socket.io → :3000
│   └── package.json
└── AGENTS.md
```

## Architecture (Layer Separation)
```
types → services → hooks → components → App.tsx
```
Each layer has zero knowledge of the next:
- **types/chat.ts** — pure data interfaces
- **services/socket.ts** — transport layer (no React imports); raw io() not exported — can swap Socket.IO for WebSockets/SSE
- **hooks/useChat.ts, useScroll.ts** — state + side effects (no DOM knowledge)
- **components/** — pure presentational, driven by props
- **App.tsx** — glue layer, decides when to auto-scroll

## Event Design
| Event | Direction | Payload |
|-------|-----------|---------|
| `user_question` | Client → Server | `{ id, text }` |
| `sources` | Server → Client | `{ id, results }` |
| `response_chunk` | Server → Client | `{ id, token }` |
| `response_done` | Server → Client | `{ id }` |
| `error` | Server → Client | `{ id, error }` |

## Data Flow
1. Client emits `user_question { id, text }`
2. Server calls `shouldSearch(text)` — asks Mistral YES/NO classifier (~200ms, ~$0.0001)
3. If YES → `searchWeb()` (Tavily) → emit `sources { id, results }` → prepend context to prompt
4. If NO → no search, no source chips emitted
5. Stream Mistral response → emit `response_chunk { id, token }` per token
6. If tool call detected (send_email) → execute tool → emit result → stream follow-up
7. Emit `response_done { id }`
8. Everything in try/catch → emit `error { id, error }` on failure

## Key Decisions
- **Search decision:** Mistral YES/NO classifier instead of fragile greylist — eliminates false positives/negatives
- **Model singleton:** One ChatMistralAI instance created at import, reused across all connections
- **Per-user isolation:** Each socket connection gets its own `messages[]` array
- **Transport encapsulation:** chatSocket doesn't expose raw io() — swap transport without touching UI
- **Tool calls inline:** After stream, check `tool_calls`, execute ToolMessage, stream follow-up
- **Generic hooks:** useScroll is reusable for any scrollable list
- **CSS:** Dark theme (#0B0B0B), 720px centered, no animation libs, no state management libs, no CSS framework
- **Constraints:** Performance > Readability > UX > Visual polish

## Reusing core/ in Another Project
Copy `backend/core/` — contains the complete AI layer:
- `model.js` — Mistral model with bound email tool
- `search.js` — Tavily web search

Import and call directly. Zero dependency on the socket/express code.

## How to Run
**Terminal 1 (backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (frontend):**
```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` in a browser.

- `npm run dev` uses `node --watch` (Node 18+ built-in file watcher) for auto-restart on changes.
- `npm start` runs `node server.js` without watch mode.

## Debug / Common Issues
- **EADDRINUSE:** `lsof -ti:3000 | xargs kill -9`
- **Frontend proxy error:** Backend must be running on :3000 before frontend loads
- **Build verification:** `node --check server.js` (backend), `tsc -b` (frontend)

## What's Left (Cosmetic Polish)
- Markdown rendering in ChatMessage (add react-markdown)
- Textarea auto-resize refinement
- Conversation persistence (add when user accounts are needed)

## What's NOT Needed
- RAG / vector databases — Tavily searches the live web
- Auth / user system — add when needed (Supabase/Redis)
- State management libraries — React state + hooks is sufficient

## Resources
- LangChain MistralAI: https://docs.langchain.com/oss/javascript/integrations/chat/mistral
- Socket.IO v4: https://socket.io/docs/v4/
- Tavily JS SDK: https://docs.tavily.com/docs/js-sdk/overview
