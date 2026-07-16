import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as projectService from "../services/projectService";
import {
  createBrandAliasSchema,
  createCompetitorSchema,
  createProjectSchema,
  updateCompetitorSchema,
  updateProjectSchema,
} from "../validation/project";

export const projectsRouter = Router();

projectsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await projectService.listProjects());
  }),
);

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createProjectSchema.parse(req.body);
    res.status(201).json(await projectService.createProject(input));
  }),
);

projectsRouter.get(
  "/:projectId",
  asyncHandler(async (req, res) => {
    res.json(await projectService.getProjectOrThrow(req.params.projectId));
  }),
);

projectsRouter.patch(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const input = updateProjectSchema.parse(req.body);
    res.json(await projectService.updateProject(req.params.projectId, input));
  }),
);

projectsRouter.post(
  "/:projectId/brand-aliases",
  asyncHandler(async (req, res) => {
    const input = createBrandAliasSchema.parse(req.body);
    res.status(201).json(await projectService.addBrandAlias(req.params.projectId, input));
  }),
);

projectsRouter.delete(
  "/:projectId/brand-aliases/:aliasId",
  asyncHandler(async (req, res) => {
    await projectService.removeBrandAlias(req.params.projectId, req.params.aliasId);
    res.status(204).send();
  }),
);

projectsRouter.post(
  "/:projectId/competitors",
  asyncHandler(async (req, res) => {
    const input = createCompetitorSchema.parse(req.body);
    res.status(201).json(await projectService.addCompetitor(req.params.projectId, input));
  }),
);

projectsRouter.patch(
  "/:projectId/competitors/:competitorId",
  asyncHandler(async (req, res) => {
    const input = updateCompetitorSchema.parse(req.body);
    res.json(await projectService.updateCompetitor(req.params.projectId, req.params.competitorId, input));
  }),
);
