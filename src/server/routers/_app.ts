import { router } from "../trpc";
import { workspaceRouter } from "./workspace";
import { productRouter } from "./product";
import { auditRouter } from "./audit";
import { suggestionRouter } from "./suggestion";
import { analyticsRouter } from "./analytics";
import { jobRouter } from "./job";
import { csvRouter } from "./csv";
import { wizardRouter } from "./wizard";
import { feedRouter } from "./feed";
import { checkoutRouter } from "./checkout";

export const appRouter = router({
  workspace: workspaceRouter,
  product: productRouter,
  audit: auditRouter,
  suggestion: suggestionRouter,
  analytics: analyticsRouter,
  job: jobRouter,
  csv: csvRouter,
  wizard: wizardRouter,
  feed: feedRouter,
  checkout: checkoutRouter,
});

export type AppRouter = typeof appRouter;
