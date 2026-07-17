import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { tickSchedules } from "../scheduler/cron";

export const schedulerRouter = Router();

// Manual trigger for the same logic the hourly cron runs — useful for
// testing/demoing without waiting for the next tick.
schedulerRouter.post(
  "/tick",
  asyncHandler(async (_req, res) => {
    res.json(await tickSchedules());
  }),
);
