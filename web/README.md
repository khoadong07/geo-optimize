# web

React + Vite dashboard for GEO Optimize. Fetches from the backend's `/api/...` JSON endpoints — see `src/api.ts`.

## Dev

```bash
npm install
npm run dev   # proxies /api and /health to http://localhost:3000 (see vite.config.ts)
```

Run the backend (`../` — `npm run dev` there) and Postgres alongside for real data.

## Docker

Built and served via nginx (`Dockerfile` + `nginx.conf`), which also proxies `/api/*` to the `app` service — see the root `docker-compose.yml`.
