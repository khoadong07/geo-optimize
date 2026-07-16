import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as dashboardService from "../services/dashboardService";

export const dashboardRouter = Router({ mergeParams: true });

dashboardRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await dashboardService.getProjectDashboard(req.params.projectId));
  }),
);
