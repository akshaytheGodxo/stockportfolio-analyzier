import YahooFinance from "yahoo-finance2";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { StockCard } from "@/components/ui/StockCard";
const TICKERS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
  "RELIANCE.NS",
];

type QuoteData = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high52w: number;
  low52w: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
};

async function fetchQuotes(): Promise<QuoteData[]> {
  const yahooFinance = new YahooFinance();
  const results = await Promise.allSettled(
    TICKERS.map((ticker) => yahooFinance.quote(ticker)),
  );

  return results
    .map((result, i) => {
      if (result.status === "rejected") return null;
      const q = result.value;
      return {
        ticker: TICKERS[i],
        name: q.shortName ?? q.longName ?? TICKERS[i],
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        high52w: q.fiftyTwoWeekHigh ?? 0,
        low52w: q.fiftyTwoWeekLow ?? 0,
        volume: q.regularMarketVolume ?? 0,
        avgVolume: q.averageDailyVolume3Month ?? q.averageDailyVolume10Day ?? 0,
        marketCap: q.marketCap ?? 0,
        peRatio: q.trailingPE ?? null,
      } satisfies QuoteData;
    })
    .filter(Boolean) as QuoteData[];
}

// Up/down semantic colors — shadcn doesn't ship these so they're defined
// once here in oklch to match your palette's color space, easy to move to
// globals.css as --up / --down if you want them project-wide.
const UP_FG = "oklch(0.55 0.18 145)";
const UP_BG = "oklch(0.94 0.07 145)";
const DN_FG = "oklch(0.55 0.22 27)";
const DN_BG = "oklch(0.95 0.06 27)";

function MarketSummaryBar({ quotes }: { quotes: QuoteData[] }) {
  const gainers = quotes.filter((q) => q.changePercent > 0).length;
  const losers = quotes.filter((q) => q.changePercent < 0).length;
  const avgChange =
    quotes.reduce((s, q) => s + q.changePercent, 0) / quotes.length;

  return (
    <div className="border-border bg-card flex flex-wrap items-center gap-6 border px-6 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: UP_FG }}
        />
        <span className="text-muted-foreground">Gainers</span>
        <span className="text-foreground font-semibold tabular-nums">
          {gainers}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: DN_FG }}
        />
        <span className="text-muted-foreground">Losers</span>
        <span className="text-foreground font-semibold tabular-nums">
          {losers}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Avg move</span>
        <span
          className="font-semibold tabular-nums"
          style={{ color: avgChange >= 0 ? UP_FG : DN_FG }}
        >
          {avgChange >= 0 ? "+" : ""}
          {avgChange.toFixed(2)}%
        </span>
      </div>
      <div className="text-muted-foreground ml-auto text-xs">
        Live ·{" "}
        {new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const quotes = await fetchQuotes();

  return (
    <main className="bg-background text-foreground min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight">
            Market <span className="text-primary font-semibold">Overview</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time quotes · {TICKERS.length} tracked companies
          </p>
        </div>

        {/* Summary bar */}
        <div className="mb-8">
          <MarketSummaryBar quotes={quotes} />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quotes.map((q) => (
            <StockCard key={q.ticker} q={q} />
          ))}
        </div>

        {/* Footer */}
        <p className="text-muted-foreground mt-10 text-center text-xs">
          Data via Yahoo Finance · Not financial advice · For informational
          purposes only
        </p>
      </div>
    </main>
  );
}
