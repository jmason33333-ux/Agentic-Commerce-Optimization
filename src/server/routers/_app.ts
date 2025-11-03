import { router } from "../trpc";
import { workspaceRouter } from "./workspace";
import { productRouter } from "./product";
import { auditRouter } from "./audit";
import { suggestionRouter } from "./suggestion";
import { analyticsRouter } from "./analytics";
import { jobRouter } from "./job";
import { csvRouter } from "./csv";
import { feedRouter } from "./feed";

export const appRouter = router({
  workspace: workspaceRouter,
  product: productRouter,
  audit: auditRouter,
  suggestion: suggestionRouter,
  analytics: analyticsRouter,
  job: jobRouter,
  csv: csvRouter,
  feed: feedRouter,
});

export type AppRouter = typeof appRouter;
