import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as configService from "../services/configService";
import {
  createScheduleConfigSchema,
  createTargetConfigSchema,
  updateScheduleConfigSchema,
  upsertPlatformConfigSchema,
} from "../validation/config";

export const platformConfigsRouter = Router({ mergeParams: true });

platformConfigsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await configService.listPlatformConfigs(req.params.projectId));
  }),
);

platformConfigsRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const input = upsertPlatformConfigSchema.parse(req.body);
    res.json(await configService.upsertPlatformConfig(req.params.projectId, input));
  }),
);

export const targetConfigsRouter = Router({ mergeParams: true });

targetConfigsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await configService.listTargetConfigs(req.params.projectId));
  }),
);

targetConfigsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createTargetConfigSchema.parse(req.body);
    res.status(201).json(await configService.createTargetConfig(req.params.projectId, input));
  }),
);

targetConfigsRouter.delete(
  "/:targetConfigId",
  asyncHandler(async (req, res) => {
    await configService.deleteTargetConfig(req.params.projectId, req.params.targetConfigId);
    res.status(204).send();
  }),
);

export const scheduleConfigsRouter = Router({ mergeParams: true });

scheduleConfigsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await configService.listScheduleConfigs(req.params.projectId));
  }),
);

scheduleConfigsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createScheduleConfigSchema.parse(req.body);
    res.status(201).json(await configService.createScheduleConfig(req.params.projectId, input));
  }),
);

scheduleConfigsRouter.patch(
  "/:scheduleConfigId",
  asyncHandler(async (req, res) => {
    const input = updateScheduleConfigSchema.parse(req.body);
    res.json(await configService.updateScheduleConfig(req.params.projectId, req.params.scheduleConfigId, input));
  }),
);
