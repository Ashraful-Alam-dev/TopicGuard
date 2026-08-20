# TopicGuard

TopicGuard helps a classroom coordinate project/thesis topic registration without duplicate or near-duplicate topics slipping through. Students register a topic under a submission (assignment); the app checks it against everyone else's titles — both exact and *semantic* duplicates — before it's saved, and can optionally ask an AI model for quick feedback on the topic itself.

## Features

- **Auth** — email/password registration with OTP email verification, login, forgot/reset password, JWT stored in an httpOnly cookie.
- **Classrooms** — a monitor creates a classroom and shares a join code; students join with it. Monitor role can be transferred; classrooms can be archived.
- **Submissions** — a monitor opens a submission (e.g. "Thesis Topic — Fall 2026") that students register topics against; it can later be closed to lock topics in.
- **Topic registration** — students (solo or as a team, with a leader + members) submit a topic title.
  - **Exact-match check** as they type.
  - **Semantic similarity check** on submit, using text embeddings — flags topics that are worded differently but conceptually the same, and shows the closest matches before letting the student confirm anyway.
- **Consult AI** *(optional)* — an on-demand button that sends the topic (plus lightweight context) to an LLM via Groq and returns a score, a couple of quick comments, and 2–3 alternative title suggestions.
- **Messaging** — simple classroom-wide announcements/messages from the monitor.
- **Rate limiting** — per-user request limits on Consult AI (stricter, tuned to Groq's free-tier budget) and on topic register/edit (looser, since embeddings run locally by default).

## Tech stack

| | |
|---|---|
| **Backend** | NestJS (TypeScript), Prisma ORM, PostgreSQL (tested against Neon), Passport-JWT |
| **Frontend** | Next.js (App Router), React Query, React Hook Form + Zod, Tailwind, shadcn/ui |
| **Embeddings** | Local by default (`@huggingface/transformers`, `Xenova/all-MiniLM-L6-v2`, runs in-process, no API key needed) — swappable for OpenAI embeddings |
| **AI feedback** | Groq (OpenAI-compatible API), default model `openai/gpt-oss-120b` |
| **Email** | Brevo (OTP + notification emails) |

## Project structure

```
backend/   NestJS API — src/{auth,classroom,submission,topics,consult-ai,message,users,embedding,email,...}
frontend/  Next.js app — src/app (routes), src/components, src/lib (api clients, hooks, validation)
```

Each backend feature is a self-contained Nest module (controller + service + DTOs). The frontend mirrors that: one API client + one React Query hook file per resource under `lib/`.

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) instance)
- A [Brevo](https://www.brevo.com) account for transactional email (OTPs)
- A free [Groq](https://console.groq.com) API key if you want Consult AI enabled (the rest of the app works fine without it — the button just returns "temporarily unavailable")

### 1. Backend

```bash
cd backend
npm install
cp src/.env.example .env   # fill in the values below
npx prisma migrate deploy  # or `prisma migrate dev` if you have a schema to evolve
npm run start:dev
```

**Environment variables** (`backend/.env`):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret used to sign auth JWTs |
| `JWT_EXPIRES_IN` | | Default `1d` |
| `PORT` | | Default `3000` |
| `CORS_ORIGIN` | | Your frontend URL, e.g. `http://localhost:3001` |
| `COOKIE_SECURE` | | `true` in production (HTTPS) |
| `EMBEDDING_PROVIDER` | | `transformers` (default, local/free) or `openai` |
| `TRANSFORMER_MODEL` | | Default `Xenova/all-MiniLM-L6-v2` |
| `SIMILARITY_THRESHOLD` | | Cosine-similarity cutoff for flagging a "similar" topic, default `0.30` |
| `OPENAI_API_KEY` / `OPENAI_EMBEDDING_MODEL` | | Only if `EMBEDDING_PROVIDER=openai` |
| `GROQ_API_KEY` | | Enables Consult AI; omitted = feature soft-disabled |
| `GROQ_MODEL` | | Default `openai/gpt-oss-120b` |
| `GROQ_BASE_URL` | | Default `https://api.groq.com/openai/v1` |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | ✅ | For OTP/notification emails |

The API is served under the `/api` prefix (e.g. `http://localhost:3000/api`), with `GET /api/health` as an unauthenticated healthcheck.

### 2. Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
npm run dev
```

Visit `http://localhost:3001` (or whatever port Next.js picks).

## How it fits together (typical flow)

1. A user registers, verifies via OTP, and logs in.
2. As a **monitor**, they create a classroom (gets a join code) and open a **submission** for students to register topics against.
3. **Students** join the classroom with the code, then register a topic (optionally with teammates) under an open submission.
4. Before saving, the topic title is checked for exact duplicates (live, as they type) and semantic near-duplicates (on submit, via embeddings) — if something similar already exists, the student sees the match(es) and can rename or submit anyway.
5. Students can optionally hit **Consult AI** for a quick score + suggestions before finalizing.
6. The monitor closes the submission once the window is over, locking topics in place.

## Rate limits

To keep the app inexpensive and abuse-resistant at a small scale (tens to ~100 users), a few endpoints carry simple, in-memory, per-user rate limits:

- **Consult AI**: 30s cooldown between calls + 10 calls/day per user (Groq's free tier caps the whole app at 1,000 requests/day).
- **Register/edit topic**: 10 requests/minute per user (shared across both, since each triggers an embedding call).

These limits reset automatically and don't require any extra infrastructure — see `backend/src/common/rate-limit/`. Note they're per server process; if you ever scale the API horizontally, move this to a shared store (e.g. Redis).

## Notes

- Passwords are hashed with `bcrypt`; JWTs live in an httpOnly cookie, not local storage.
- The default embedding provider runs fully locally on the server (no external API calls, no per-request cost) — it just takes a few seconds to warm up on first boot.
- Consult AI is intentionally "best-effort": if Groq is slow, down, or rate-limited, the app degrades gracefully and lets the student submit manually instead of blocking them.