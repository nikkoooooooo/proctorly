# Proctorly

Proctorly is a web app for creating and taking quizzes with lightweight proctoring signals (tab/window tracking) and simple attempt tracking.

## Features
- Google OAuth login
- Create quizzes with timed questions
- Join quizzes using a 6-character code
- Attempt tracking and scoring
- Basic proctoring signals (tab/window switch count, blur warning)

## Tech Stack
- Next.js (App Router)
- React 19
- Better Auth
- Drizzle ORM + Neon (Postgres)
- Tailwind CSS

## Quick Start
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (or `.env.local`) with:
```bash
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

3. Run the dev server:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts
- `npm run dev` - start dev server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run lint` - lint the codebase

## Project Structure
- `app/` - routes and pages
- `components/` - shared UI components
- `lib/` - DB, schema, helpers, and server actions
- `client/` - client-side auth utilities
- `drizzle/` - migration artifacts and config

## Notes
- Make sure your database schema is in sync with `lib/schema.ts`.
- OAuth callback URLs must match your app domain.
- Theme toggle is in the navbar and stored in localStorage (`proctorly-theme`).
