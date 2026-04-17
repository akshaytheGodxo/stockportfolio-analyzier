import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const alertRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.alert.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        symbol: z.string().min(1).max(10),
        type: z.enum(["price_above", "price_below", "percent_change"]),
        targetValue: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alert.create({
        data: {
          symbol: input.symbol.toUpperCase(),
          type: input.type,
          targetValue: input.targetValue,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean().optional(),
        targetValue: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alert.updateMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          isActive: input.isActive,
          targetValue: input.targetValue,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alert.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  deleteBySymbol: protectedProcedure
    .input(z.object({ symbol: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.alert.deleteMany({
        where: {
          userId: ctx.session.user.id,
          symbol: input.symbol.toUpperCase(),
        },
      });
    }),
});
