import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as paraphraseService from "../services/paraphraseService";
import {
  approveCandidateSchema,
  createSeedKeywordSchema,
  generateBatchSchema,
  rejectCandidateSchema,
} from "../validation/paraphrase";

export const seedKeywordsRouter = Router({ mergeParams: true });

seedKeywordsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await paraphraseService.listSeedKeywords(req.params.projectId));
  }),
);

seedKeywordsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createSeedKeywordSchema.parse(req.body);
    res.status(201).json(await paraphraseService.createSeedKeyword(req.params.projectId, input));
  }),
);

seedKeywordsRouter.post(
  "/:seedKeywordId/generate",
  asyncHandler(async (req, res) => {
    const input = generateBatchSchema.parse(req.body);
    res.status(201).json(await paraphraseService.generateBatch(req.params.seedKeywordId, input));
  }),
);

export const candidatesRouter = Router();

candidatesRouter.get(
  "/batches/:generationBatchId/candidates",
  asyncHandler(async (req, res) => {
    res.json(await paraphraseService.listCandidates(req.params.generationBatchId));
  }),
);

candidatesRouter.post(
  "/candidates/:candidateId/approve",
  asyncHandler(async (req, res) => {
    const input = approveCandidateSchema.parse(req.body);
    res.json(await paraphraseService.approveCandidate(req.params.candidateId, input));
  }),
);

candidatesRouter.post(
  "/candidates/:candidateId/reject",
  asyncHandler(async (req, res) => {
    const input = rejectCandidateSchema.parse(req.body);
    res.json(await paraphraseService.rejectCandidate(req.params.candidateId, input));
  }),
);
