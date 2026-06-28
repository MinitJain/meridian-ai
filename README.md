# Meridian AI

Real-time AI search assistant with live streaming responses. Built with React, Socket.IO, Mistral AI, and Tavily.

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Socket.IO client
- **Backend:** Express + Socket.IO + MistralAI (LangChain) + Tavily + Nodemailer
- **AI logic:** `backend/core/` — fully decoupled, reusable in other projects

## Quick Start

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your keys:

| Variable | Description |
|----------|-------------|
| `MISTRAL_API_KEY` | Mistral AI API key |
| `TAVILY_API_KEY` | Tavily web search API key |
| `EMAIL_USER` | Gmail address for email tool |
| `EMAIL_PASS` | Gmail app password |

## Deploy

```bash
npm run build   # Installs deps + builds frontend
npm start       # Starts Express on :3000
```

Designed for one-command deploy on Railway or Render.

## Architecture

```
types → services → hooks → components → App.tsx
```

Each layer is decoupled — swap Socket.IO for WebSockets/SSE without touching UI code.
