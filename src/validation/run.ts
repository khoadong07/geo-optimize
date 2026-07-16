import { z } from "zod";
import { platformNameEnum } from "./config";

export const executeRunSchema = z.object({
  platform: platformNameEnum,
});
export type ExecuteRunInput = z.infer<typeof executeRunSchema>;
