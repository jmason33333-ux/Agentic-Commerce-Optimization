import { router } from "../trpc";
import { workspaceRouter } from "./workspace";
import { productRouter } from "./product";
import { auditRouter } from "./audit";
import { suggestionRouter } from "./suggestion";
import { analyticsRouter } from "./analytics";
import { jobRouter } from "./job";

export const appRouter = router({
  workspace: workspaceRouter,
  product: productRouter,
  audit: auditRouter,
  suggestion: suggestionRouter,
  analytics: analyticsRouter,
  job: jobRouter,
});

export type AppRouter = typeof appRouter;
