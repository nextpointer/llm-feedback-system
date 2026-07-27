# Advanced Feedback System

A secure, full-stack web application that allows customers to submit restaurant reviews and allows administrators to view insights in real-time. The backend processes text using a Large Language Model (LLM) to extract structured insights, stores results in a database, and pushes live updates to a protected React dashboard.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [Database Schema](#database-schema)
- [How It Works](#how-it-works)
- [Screenshots](#screenshots)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Vite |
| **UI Components** | shadcn/ui + Tailwind CSS v4 |
| **State Management** | Zustand |
| **Routing** | React Router v7 |
| **Backend** | Node.js + Express 5 + TypeScript |
| **Database** | PostgreSQL (Neon Serverless) |
| **Real-time** | Socket.io |
| **LLM** | Groq API (Llama 3.3-70B-Versatile) |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs |
| **Package Manager** | Bun (monorepo workspaces) |

---

## Features

- **Public Feedback Form** — Anyone can submit a restaurant review
- **LLM-Powered Analysis** — Each review is analyzed for sentiment, key topics, and urgency
- **Admin Authentication** — JWT-based role-based access control
- **Real-Time Dashboard** — Admin sees new feedback instantly via WebSocket
- **Urgent Action Flagging** — Reviews mentioning food poisoning or severe complaints are highlighted
- **Sentiment Badges** — Visual indicators for Positive/Neutral/Negative reviews
- **Responsive Design** — Works on desktop and mobile

---

## Project Structure

```
llm-feedback-system/
├── apps/
│   ├── client/                        # React frontend
│   │   ├── src/
│   │   │   ├── components/ui/         # Shadcn UI components
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx           # Public feedback form
│   │   │   │   ├── Login.tsx          # Admin login
│   │   │   │   └── Dashboard.tsx      # Protected admin dashboard
│   │   │   ├── stores/
│   │   │   │   └── authStore.ts       # Zustand auth state
│   │   │   ├── lib/
│   │   │   │   ├── api.ts             # Fetch wrapper with JWT
│   │   │   │   ├── socket.ts          # Socket.io client
│   │   │   │   └── utils.ts           # Utility functions
│   │   │   ├── App.tsx                # Router setup
│   │   │   ├── main.tsx               # Entry point
│   │   │   └── index.css              # Tailwind + shadcn theme
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── server/                        # Express backend
│       ├── src/
│       │   ├── config/
│       │   │   ├── db.ts              # PostgreSQL connection pool
│       │   │   └── seed.ts            # DB init + admin seed
│       │   ├── middleware/
│       │   │   └── auth.ts            # JWT verification
│       │   ├── routes/
│       │   │   ├── auth.ts            # POST /api/login
│       │   │   └── feedback.ts        # POST /api/feedback, GET /api/feedback/insights
│       │   ├── services/
│       │   │   └── llm.ts             # Groq API integration
│       │   └── types/
│       │       └── index.ts           # TypeScript interfaces
│       ├── index.ts                   # Entry point
│       └── package.json
│
├── .env.example                       # Environment variable template
├── package.json                       # Monorepo root (Bun workspaces)
├── tsconfig.json                      # Root TypeScript config
└── README.md
```

---

## Prerequisites

Before you begin, make sure you have:

1. **Bun** installed — [bun.sh](https://bun.sh)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Neon PostgreSQL account** — [neon.tech](https://neon.tech)
   - Create a free project
   - Copy the connection string from the dashboard

3. **Groq API key** — [console.groq.com](https://console.groq.com)
   - Sign up for free
   - Generate an API key

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/llm-feedback-system.git
cd llm-feedback-system
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

**Server environment:**

```bash
cp .env.example apps/server/.env
```

Edit `apps/server/.env`:

```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
GROQ_API_KEY=gsk_your_groq_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=admin123
PORT=3001
```

**Client environment:**

```bash
cp .env.example apps/client/.env
```

Edit `apps/client/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

### 4. Start the Application

```bash
# Start both client and server concurrently
bun run dev

# Or start them separately:
bun run dev:server   # Backend on http://localhost:3001
bun run dev:client   # Frontend on http://localhost:5173
```

The server will automatically:
- Connect to your Neon PostgreSQL database
- Create the `users` and `feedback` tables if they don't exist
- Seed the admin user with the credentials from your `.env`

---

## Environment Variables

### Server (`apps/server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `GROQ_API_KEY` | Yes | Groq API key for LLM analysis |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `ADMIN_EMAIL` | No | Admin email (default: `admin@restaurant.com`) |
| `ADMIN_PASSWORD` | No | Admin password (default: `admin123`) |
| `PORT` | No | Server port (default: `3001`) |
| `CLIENT_URL` | No | Frontend URL for CORS (default: `http://localhost:5173`) |

### Client (`apps/client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (default: `http://localhost:3001`) |
| `VITE_WS_URL` | No | Backend WebSocket URL (default: `http://localhost:3001`) |

---

## Running the Application

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@restaurant.com` |
| Password | `admin123` |

### Access Points

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Public feedback form |
| `http://localhost:5173/login` | Admin login page |
| `http://localhost:5173/dashboard` | Admin dashboard (protected) |

---

## API Reference

### POST `/api/login`

Authenticate admin user and receive a JWT token.

**Request:**
```json
{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@restaurant.com",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST `/api/feedback`

Submit a restaurant review. This is a **public** endpoint (no auth required).

**Request:**
```json
{
  "text": "The pizza was amazing but the service was slow and cold."
}
```

**Response (201):**
```json
{
  "id": 1,
  "raw_text": "The pizza was amazing but the service was slow and cold.",
  "sentiment": "Neutral",
  "key_items": ["Pizza", "Service"],
  "requires_action": false,
  "created_at": "2026-07-27T10:30:00.000Z"
}
```

---

### GET `/api/feedback/insights`

Retrieve all feedback entries. **Protected** — requires valid admin JWT.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "raw_text": "The pizza was amazing...",
    "sentiment": "Positive",
    "key_items": ["Pizza"],
    "requires_action": false,
    "created_at": "2026-07-27T10:30:00.000Z"
  }
]
```

---

## WebSocket Events

### Connection

The client connects to the Socket.io server on the same port as the Express API (`3001`).

### Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | Client → Server | — | Client connects |
| `disconnect` | Client → Server | — | Client disconnects |
| `feedback:new` | Server → Client | `Feedback` object | Broadcast when new feedback is submitted |

### WebSocket Testing

1. Open the admin dashboard at `http://localhost:5173/dashboard`
2. Open the server terminal — you should see `Client connected: <socket-id>`
3. Open a second browser tab with the feedback form at `http://localhost:5173`
4. Submit a review
5. The dashboard tab should update **automatically** without refreshing
6. Check the server terminal for the broadcast log

---

## Database Schema

### `users` Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `feedback` Table

```sql
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  raw_text TEXT NOT NULL,
  sentiment VARCHAR(20) NOT NULL,
  key_items JSONB NOT NULL DEFAULT '[]',
  requires_action BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## How It Works

```
┌──────────────┐     POST /api/feedback     ┌──────────────┐
│              │ ──────────────────────────▶ │              │
│    Client    │                            │    Server    │
│  (React App) │ ◀────────────────────────── │  (Express)   │
│              │     201 + JSON response     │              │
└──────────────┘                            └──────┬───────┘
                                                   │
                                          ┌────────▼────────┐
                                          │   Groq API      │
                                          │  (LLM Analysis) │
                                          └────────┬────────┘
                                                   │
                                          Sentiment, Key Items,
                                          Requires Action
                                                   │
                                          ┌────────▼────────┐
                                          │   PostgreSQL    │
                                          │    (Neon)       │
                                          └────────┬────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │   Socket.io     │
                                          │   Broadcast     │
                                          └────────┬────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │  Admin Dashboard │
                                          │  (Real-time UI)  │
                                          └──────────────────┘
```

### Flow

1. **Customer visits** the feedback form at `/`
2. **Customer writes** a review and clicks Submit
3. **Server receives** the text at `POST /api/feedback`
4. **Server calls Groq LLM** with the review text
5. **LLM returns** structured JSON: sentiment, key items, urgency flag
6. **Server stores** everything in PostgreSQL
7. **Server broadcasts** the new feedback via Socket.io
8. **Admin dashboard** receives the broadcast and prepends the new entry
9. **Urgent reviews** are highlighted in red for immediate attention

---

## LLM Integration Details

The system uses **Groq's free API** with the `llama-3.3-70b-versatile` model to analyze each review.

### Prompt Template

```
Analyze the following restaurant review and return a JSON object with exactly these fields:
- sentiment: "Positive", "Neutral", or "Negative"
- key_items: an array of strings mentioning food, service, ambience, or other topics
- requires_action: true if the review mentions food poisoning, severe complaints, health issues, or urgent problems; false otherwise

Review: "<customer_review>"

Return ONLY the JSON object, no other text.
```

### Response Parsing

The LLM response is parsed as JSON. If parsing fails, the system falls back to safe defaults:
- `sentiment`: `"Neutral"`
- `key_items`: `[]`
- `requires_action`: `false`

---

## License

MIT
