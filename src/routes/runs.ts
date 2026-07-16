import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as runService from "../services/runService";
import { executeRunSchema } from "../validation/run";

export const runsRouter = Router({ mergeParams: true });

runsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await runService.listRuns(req.params.promptId));
  }),
);

runsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = executeRunSchema.parse(req.body);
    res.status(201).json(await runService.executeRun({ promptId: req.params.promptId, platform: input.platform }));
  }),
);
