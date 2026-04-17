import { postRouter } from "@/server/api/routers/post";
import { stockRouter } from "@/server/api/routers/stock";
import { watchlistRouter } from "@/server/api/routers/watchlist";
import { portfolioRouter } from "@/server/api/routers/portfolio";
import { alertRouter } from "@/server/api/routers/alert";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  stock: stockRouter,
  watchlist: watchlistRouter,
  portfolio: portfolioRouter,
  alert: alertRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
