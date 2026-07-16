import path from "node:path";
import cors from "cors";
import express from "express";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { candidatesRouter, seedKeywordsRouter } from "./routes/paraphrase";
import { platformConfigsRouter, scheduleConfigsRouter, targetConfigsRouter } from "./routes/configs";
import { dashboardRouter } from "./routes/dashboard";
import { projectsRouter } from "./routes/projects";
import { promptSetsRouter, promptsRouter } from "./routes/prompts";
import { runsRouter } from "./routes/runs";
import { schedulerRouter } from "./routes/scheduler";
import { startScheduler } from "./scheduler/cron";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/prompt-sets", promptSetsRouter);
app.use("/api/prompts", promptsRouter);
app.use("/api/prompts/:promptId/runs", runsRouter);
app.use("/api/projects/:projectId/seed-keywords", seedKeywordsRouter);
app.use("/api", candidatesRouter);
app.use("/api/scheduler", schedulerRouter);
app.use("/api/projects/:projectId/platform-configs", platformConfigsRouter);
app.use("/api/projects/:projectId/target-configs", targetConfigsRouter);
app.use("/api/projects/:projectId/schedule-configs", scheduleConfigsRouter);
app.use("/api/projects/:projectId/dashboard", dashboardRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`GEO Optimize API listening on port ${config.port}`);
  startScheduler();
});
