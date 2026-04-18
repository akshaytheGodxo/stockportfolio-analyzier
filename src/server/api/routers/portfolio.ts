import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const portfolioRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.portfolio.findMany({
      where: { userId: ctx.session.user.id },
      include: { transactions: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getBySymbol: protectedProcedure
    .input(z.object({ symbol: z.string().min(1).max(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.portfolio.findUnique({
        where: {
          userId_symbol: {
            userId: ctx.session.user.id,
            symbol: input.symbol.toUpperCase(),
          },
        },
        include: { transactions: { orderBy: { createdAt: "desc" } } },
      });
    }),

  addPosition: protectedProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(10),
        shares: z.number().positive(),
        price: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const symbol = input.symbol.toUpperCase();
      const total = input.shares * input.price;

      let portfolio = await ctx.db.portfolio.findUnique({
        where: {
          userId_symbol: {
            userId: ctx.session.user.id,
            symbol,
          },
        },
      });

      if (!portfolio) {
        portfolio = await ctx.db.portfolio.create({
          data: {
            symbol,
            shares: input.shares,
            averagePrice: input.price,
            userId: ctx.session.user.id,
          },
        });
      } else {
        const totalShares = portfolio.shares + input.shares;
        const newAveragePrice =
          (portfolio.averagePrice * portfolio.shares + total) / totalShares;

        portfolio = await ctx.db.portfolio.update({
          where: { id: portfolio.id },
          data: {
            shares: totalShares,
            averagePrice: newAveragePrice,
          },
        });
      }

      // Record transaction
      await ctx.db.transaction.create({
        data: {
          symbol,
          type: "buy",
          shares: input.shares,
          price: input.price,
          total,
          portfolioId: portfolio.id,
          userId: ctx.session.user.id,
        },
      });

      return portfolio;
    }),

  sellPosition: protectedProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(10),
        shares: z.number().positive(),
        price: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const symbol = input.symbol.toUpperCase();
      const total = input.shares * input.price;

      const portfolio = await ctx.db.portfolio.findUnique({
        where: {
          userId_symbol: {
            userId: ctx.session.user.id,
            symbol,
          },
        },
      });

      if (!portfolio) {
        throw new Error("Position not found");
      }

      if (portfolio.shares < input.shares) {
        throw new Error("Insufficient shares to sell");
      }

      const updatedPortfolio = await ctx.db.portfolio.update({
        where: { id: portfolio.id },
        data: {
          shares: portfolio.shares - input.shares,
        },
      });

      // Record transaction
      await ctx.db.transaction.create({
        data: {
          symbol,
          type: "sell",
          shares: input.shares,
          price: input.price,
          total,
          portfolioId: portfolio.id,
          userId: ctx.session.user.id,
        },
      });

      // Delete portfolio if no shares left
      if (updatedPortfolio.shares === 0) {
        await ctx.db.portfolio.delete({
          where: { id: portfolio.id },
        });
        return null;
      }

      return updatedPortfolio;
    }),

  deletePosition: protectedProcedure
    .input(z.object({ symbol: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const symbol = input.symbol.toUpperCase();
      return ctx.db.portfolio.deleteMany({
        where: {
          userId: ctx.session.user.id,
          symbol,
        },
      });
    }),
});
