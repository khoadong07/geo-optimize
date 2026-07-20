# geo-optimize

GEO (Generative Engine Optimization) tracking platform for the Vietnamese market — tracks brand visibility, ranking, and sentiment across AI answer engines.

## Architecture

- **backend/** — NestJS API (auth + projects) backed by MongoDB via Mongoose.
- **frontend/** — Next.js dashboard.

## Auth

Login credentials and MongoDB credentials are not hardcoded anywhere — every instance must set its own via `.env`. The backend refuses to start if any of these are missing:

- `AUTH_USERNAME` / `AUTH_PASSWORD` — seeded as the first user in MongoDB on the backend's first boot (no-ops afterwards; the source of truth becomes the `users` collection).
- `JWT_SECRET` — signs session tokens.
- `MONGO_ROOT_USERNAME` / `MONGO_ROOT_PASSWORD` — root credentials for the Mongo container itself (auth is enabled on the container).

## Run locally

```bash
cp .env.example .env   # fill in every value — see "Auth" above
docker compose up -d   # starts Mongo (with auth), backend, frontend
```

Or run backend/frontend directly against a local Mongo:

```bash
cd backend && npm install && npm run start:dev   # http://localhost:4000
cd frontend && npm install && npm run dev        # http://localhost:3001
```
