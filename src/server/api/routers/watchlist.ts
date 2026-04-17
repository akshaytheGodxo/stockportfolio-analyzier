import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const watchlistRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.watchlist.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  add: protectedProcedure
    .input(z.object({ symbol: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.watchlist.findUnique({
        where: {
          userId_symbol: {
            userId: ctx.session.user.id,
            symbol: input.symbol.toUpperCase(),
          },
        },
      });

      if (existing) {
        return existing;
      }

      return ctx.db.watchlist.create({
        data: {
          symbol: input.symbol.toUpperCase(),
          userId: ctx.session.user.id,
        },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ symbol: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.watchlist.delete({
        where: {
          userId_symbol: {
            userId: ctx.session.user.id,
            symbol: input.symbol.toUpperCase(),
          },
        },
      });
    }),

  removeById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.watchlist.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  isInWatchlist: protectedProcedure
    .input(z.object({ symbol: z.string().min(1).max(10) }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.watchlist.findUnique({
        where: {
          userId_symbol: {
            userId: ctx.session.user.id,
            symbol: input.symbol.toUpperCase(),
          },
        },
      });
      return !!item;
    }),
});
