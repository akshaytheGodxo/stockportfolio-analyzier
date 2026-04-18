import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

interface StockQuote {
  "01. symbol"?: string;
  "05. price"?: string;
  "09. change"?: string;
  "10. change percent"?: string;
  "06. volume"?: string;
  "07. latest trading day"?: string;
  [key: string]: string | undefined;
}

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  timestamp: string;
}

async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(`/api/check-stock?symbol=${symbol}`);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;

    if (
      typeof data.Note === "string" ||
      typeof data.Information === "string" ||
      typeof data.Error === "string"
    ) {
      return null;
    }

    const quote = data["Global Quote"] as StockQuote | undefined;
    if (quote && Object.keys(quote).length > 0) {
      const price = parseFloat(quote["05. price"] ?? "0");
      if (!isNaN(price) && price > 0) {
        return {
          symbol: quote["01. symbol"] ?? symbol,
          price,
          change: parseFloat(quote["09. change"] ?? "0"),
          changePercent: parseFloat(
            (quote["10. change percent"] ?? "0").replace("%", ""),
          ),
          volume: quote["06. volume"] ?? "N/A",
          timestamp:
            quote["07. latest trading day"] ??
            new Date().toISOString().split("T")[0] ??
            "",
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

export const stockRouter = createTRPCRouter({
  getQuote: publicProcedure
    .input(z.object({ symbol: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      const data = await fetchStockData(input.symbol);
      return data;
    }),

  getMultipleQuotes: publicProcedure
    .input(z.object({ symbols: z.array(z.string().min(1).max(10)) }))
    .query(async ({ input }) => {
      const results = await Promise.allSettled(
        input.symbols.map((symbol) => fetchStockData(symbol)),
      );

      return results
        .map((result) => {
          if (result.status === "fulfilled") {
            return result.value;
          }
          return null;
        })
        .filter((item) => item !== null && item !== undefined);
    }),

  searchSymbol: publicProcedure
    .input(z.object({ query: z.string().min(1).max(20) }))
    .query(async ({ input }) => {
      // In a real app, you'd use a proper symbol search API
      // For now, return common tickers that match the query
      const commonSymbols = [
        "AAPL",
        "MSFT",
        "GOOGL",
        "AMZN",
        "NVDA",
        "TSLA",
        "META",
        "JPM",
        "BA",
        "JNJ",
      ];
      return commonSymbols.filter((symbol) =>
        symbol.toLowerCase().includes(input.query.toLowerCase()),
      );
    }),
});
