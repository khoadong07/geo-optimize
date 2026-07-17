import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as promptService from "../services/promptService";
import {
  createPromptGroupSchema,
  createPromptSchema,
  createPromptSetSchema,
  editPromptTextSchema,
  setPromptStatusSchema,
} from "../validation/prompt";

export const promptSetsRouter = Router({ mergeParams: true });

promptSetsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await promptService.listPromptSets(req.params.projectId));
  }),
);

promptSetsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createPromptSetSchema.parse(req.body);
    res.status(201).json(await promptService.createPromptSet(req.params.projectId, input));
  }),
);

promptSetsRouter.post(
  "/:promptSetId/groups",
  asyncHandler(async (req, res) => {
    const input = createPromptGroupSchema.parse(req.body);
    res.status(201).json(await promptService.createPromptGroup(req.params.promptSetId, input));
  }),
);

promptSetsRouter.get(
  "/:promptSetId/prompts",
  asyncHandler(async (req, res) => {
    res.json(await promptService.listPrompts(req.params.promptSetId));
  }),
);

promptSetsRouter.post(
  "/:promptSetId/prompts",
  asyncHandler(async (req, res) => {
    const input = createPromptSchema.parse(req.body);
    res.status(201).json(await promptService.createPrompt(req.params.promptSetId, input));
  }),
);

export const promptsRouter = Router();

promptsRouter.get(
  "/:promptId",
  asyncHandler(async (req, res) => {
    res.json(await promptService.getPromptOrThrow(req.params.promptId));
  }),
);

promptsRouter.post(
  "/:promptId/versions",
  asyncHandler(async (req, res) => {
    const input = editPromptTextSchema.parse(req.body);
    res.status(201).json(await promptService.editPromptText(req.params.promptId, input));
  }),
);

promptsRouter.patch(
  "/:promptId/status",
  asyncHandler(async (req, res) => {
    const input = setPromptStatusSchema.parse(req.body);
    res.json(await promptService.setPromptStatus(req.params.promptId, input));
  }),
);
