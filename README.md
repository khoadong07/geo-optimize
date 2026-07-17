# geo-optimize

GEO (Generative Engine Optimization) tracking platform for the Vietnamese market — tracks brand visibility, ranking, and sentiment across AI answer engines (Gemini, OpenAI now; more later).

## Run locally

```bash
cp .env.example .env   # fill in OPENAI_API_KEY / GEMINI_API_KEY (or just DEEPINFRA_API_KEY, see below)
docker compose up -d   # starts Postgres
npm install
npm run prisma:migrate
npm run dev             # http://localhost:3000, dashboard at /dashboard.html
```

### Don't have OpenAI/Gemini API keys yet?

Set `DEEPINFRA_API_KEY` (get one at https://deepinfra.com) and leave `OPENAI_API_KEY`/`GEMINI_API_KEY`
empty — the `OPENAI` and `GEMINI` platforms/providers transparently fall back to DeepInfra
(`openai/gpt-oss-120b` and `google/gemini-2.5-flash` respectively, both served through DeepInfra's
single OpenAI-compatible endpoint). As soon as you set the real `OPENAI_API_KEY`/`GEMINI_API_KEY`,
those take over automatically — no code changes needed either way.

## What's implemented (Phase 1 MVP)

- **Project setup**: brands, brand aliases, competitors, prompt sets/groups, prompt versioning.
- **LLM paraphrase generation**: seed keyword → LLM-generated question variants → human review/approval.
- **Platform / Target / Schedule config** per project.
- **Run execution**: calls the enabled platform's real API (OpenAI or Gemini, falling back to DeepInfra when a real key isn't configured — see above), scans the response for brand/competitor mentions, computes a simple visibility score, and classifies sentiment via an LLM-as-judge.
- **Scheduler**: hourly cron checks due `ScheduleConfig`s and executes runs (`POST /api/scheduler/tick` to trigger manually).
- **Dashboard**: `GET /api/projects/:projectId/dashboard` (JSON) and `public/dashboard.html` (simple table view).

See `prisma/schema.prisma` for the full data model.
