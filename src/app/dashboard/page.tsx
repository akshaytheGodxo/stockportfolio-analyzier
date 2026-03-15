import YahooFinance from "yahoo-finance2";

const TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM"];

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
    TICKERS.map((ticker) => yahooFinance.quote(ticker))
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

function formatVolume(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n.toString();
}

function formatMarketCap(n: number) {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  return "$" + (n / 1e6).toFixed(0) + "M";
}

// Up/down semantic colors — shadcn doesn't ship these so they're defined
// once here in oklch to match your palette's color space, easy to move to
// globals.css as --up / --down if you want them project-wide.
const UP_FG = "oklch(0.55 0.18 145)";
const UP_BG = "oklch(0.94 0.07 145)";
const DN_FG = "oklch(0.55 0.22 27)";
const DN_BG = "oklch(0.95 0.06 27)";

function PriceBar({ price, low, high }: { price: number; low: number; high: number }) {
  const pct = high > low ? ((price - low) / (high - low)) * 100 : 50;
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] tabular-nums text-muted-foreground">${low.toFixed(0)}</span>
        <span className="text-[10px] text-muted-foreground">52w range</span>
        <span className="text-[10px] tabular-nums text-muted-foreground">${high.toFixed(0)}</span>
      </div>
      <div className="relative h-[3px] rounded-full bg-border">
        <div
          className="absolute top-0 h-full rounded-full bg-primary/40"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-primary bg-card"
          style={{ left: `calc(${pct}% - 4px)` }}
        />
      </div>
    </div>
  );
}

function VolumeBar({ volume, avg }: { volume: number; avg: number }) {
  const ratio = avg > 0 ? volume / avg : 1;
  const width = Math.min(ratio * 50, 100);
  const isHigh = ratio > 1.2;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-[3px] rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${width}%`, backgroundColor: isHigh ? UP_FG : "var(--primary)" }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-14 text-right">
        {ratio.toFixed(2)}x avg
      </span>
    </div>
  );
}

function ChangeChip({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium tabular-nums"
      style={{
        backgroundColor: up ? UP_BG : DN_BG,
        color: up ? UP_FG : DN_FG,
      }}
    >
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

function StockCard({ q }: { q: QuoteData }) {
  return (
    <div className="group relative flex flex-col gap-3 p-5 border border-border bg-card text-card-foreground hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-xs font-semibold tracking-widest px-2 py-0.5 bg-muted text-muted-foreground">
            {q.ticker}
          </span>
          <p className="mt-1.5 text-sm text-muted-foreground leading-tight line-clamp-1 max-w-[160px]">
            {q.name}
          </p>
        </div>
        <ChangeChip pct={q.changePercent} />
      </div>

      {/* Price */}
      <div>
        <p className="text-3xl font-light tracking-tight tabular-nums text-foreground">
          ${q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p
          className="text-sm tabular-nums mt-0.5"
          style={{ color: q.change >= 0 ? UP_FG : DN_FG }}
        >
          {q.change >= 0 ? "+" : ""}
          {q.change.toFixed(2)} today
        </p>
      </div>

      {/* 52w range bar */}
      <PriceBar price={q.price} low={q.low52w} high={q.high52w} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Market Cap</p>
          <p className="text-sm tabular-nums font-medium text-foreground">{formatMarketCap(q.marketCap)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">P/E Ratio</p>
          <p className="text-sm tabular-nums font-medium text-foreground">
            {q.peRatio ? q.peRatio.toFixed(1) : "—"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Volume · {formatVolume(q.volume)}
          </p>
          <VolumeBar volume={q.volume} avg={q.avgVolume} />
        </div>
      </div>
    </div>
  );
}

function MarketSummaryBar({ quotes }: { quotes: QuoteData[] }) {
  const gainers = quotes.filter((q) => q.changePercent > 0).length;
  const losers = quotes.filter((q) => q.changePercent < 0).length;
  const avgChange = quotes.reduce((s, q) => s + q.changePercent, 0) / quotes.length;

  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-3 border border-border bg-card text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: UP_FG }} />
        <span className="text-muted-foreground">Gainers</span>
        <span className="font-semibold tabular-nums text-foreground">{gainers}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DN_FG }} />
        <span className="text-muted-foreground">Losers</span>
        <span className="font-semibold tabular-nums text-foreground">{losers}</span>
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
      <div className="ml-auto text-muted-foreground text-xs">
        Live · {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const quotes = await fetchQuotes();

  return (
    <main className="min-h-screen px-6 py-10 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight">
            Market <span className="font-semibold text-primary">Overview</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quotes.map((q) => (
            <StockCard key={q.ticker} q={q} />
          ))}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Data via Yahoo Finance · Not financial advice · For informational purposes only
        </p>

      </div>
    </main>
  );
}
