# NextUp

Creators share a timeline of what they plan to make; fans vote on what they want next.
Next.js 15 (App Router) · Postgres (Neon) via Drizzle · Google + Instagram sign-in · deploys on Vercel.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

No setup needed: without `DATABASE_URL`, an embedded Postgres is created in `data/pglite` with a demo creator at `/@demo`.
Without Google/Instagram keys, sign-in buttons fall back to a **dev-only test login** (disabled in production).
Delete the `data/` folder to reset the local database.

## Go live (about 30 minutes)

### 1. Database: Neon
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string → this is `DATABASE_URL`.

### 2. Code on GitHub
Push this folder to a new GitHub repository (`.env*`, `data/` and `node_modules` are already ignored).

### 3. Vercel
1. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
2. Add environment variables (see `.env.example`): `DATABASE_URL`, `APP_URL` (e.g. `https://nextup.vercel.app` or your own domain), and the Google/Instagram keys below.
3. Deploy. The app runs in Singapore (`sin1`, set in `vercel.json`) to sit next to the Neon database. Create the Neon project in **AWS Asia Pacific (Singapore)**. The `vercel-build` script runs database migrations before building.
4. Optional: add the demo creator to production with `DATABASE_URL=... npm run db:seed`.

### 4. Google sign-in (YouTube creators + all fans)
1. [Google Cloud Console](https://console.cloud.google.com) → new project.
2. **APIs & Services → Library** → enable **YouTube Data API v3**.
3. **OAuth consent screen**: External; app name, support email, homepage `APP_URL`, privacy policy `APP_URL/privacy`, terms `APP_URL/terms`.
   Scopes: `openid`, `email`, `profile`, `.../auth/youtube.readonly`.
4. **Credentials → Create OAuth client ID → Web application**.
   Authorized redirect URI: `APP_URL/auth/google/callback` (add `http://localhost:3000/auth/google/callback` too for local testing).
5. Put the client ID/secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

> `youtube.readonly` is a *sensitive* scope. Until Google verifies the app, only accounts added as **test users** can sign in as creators, and others see an "unverified app" warning. Submit for verification before launch (takes days to weeks). Fan sign-in only uses basic scopes and isn't affected.

### 5. Instagram sign-in (Instagram creators)
1. [Meta for Developers](https://developers.facebook.com) → **Create app** → use case **"Manage messaging & content on Instagram"**.
2. **Instagram → API setup with Instagram login** → note the **Instagram app ID / secret** → `INSTAGRAM_CLIENT_ID` / `INSTAGRAM_CLIENT_SECRET`.
3. **Business login settings** → OAuth redirect URI: `APP_URL/auth/instagram/callback`.
4. Add privacy policy URL `APP_URL/privacy` and data-deletion instructions URL `APP_URL/privacy`.
5. In development mode only Instagram accounts added as testers can sign in. Request **Advanced Access** for `instagram_business_basic` through App Review before launch.

Only **Business or Creator** Instagram accounts can use Instagram login. Personal accounts can switch for free in the Instagram app.

## Before launch checklist
- [ ] Put a real contact email in `app/privacy/page.tsx`, and have the privacy policy and terms reviewed
- [ ] Google OAuth app verified · Meta App Review approved
- [ ] Custom domain on Vercel, and `APP_URL` + OAuth redirect URIs updated to it
- [ ] Neon: enable point-in-time restore / backups on a paid plan when you have real users

## Scripts
| | |
|---|---|
| `npm run dev` | local dev server |
| `npm run db:generate` | create a migration after editing `lib/db/schema.ts` |
| `npm run db:migrate` | apply migrations to `DATABASE_URL` |
| `npm run db:seed` | add the `@demo` creator |
| `npm run db:studio` | browse the database |
| `npm run typecheck` | TypeScript check |

## How it works
- `lib/db/schema.ts`: tables (users, accounts, sessions, creators, items, votes)
- `lib/auth/`: OAuth (Google with PKCE, Instagram), database-backed sessions (only a SHA-256 of the cookie token is stored)
- `app/auth/[provider]`: sign-in start + callback routes
- `app/actions.ts`: server actions; every write checks ownership; one vote per account per item; creators can't vote on their own items
- `app/[handle]`: public `/@handle` page
