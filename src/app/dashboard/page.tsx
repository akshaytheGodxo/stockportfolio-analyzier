import YahooFinance from "yahoo-finance2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircleIcon,
  TrendingUp,
  TrendingDown,
  Heart,
  Wallet,
  Activity,
} from "lucide-react";
import { StockCard } from "@/components/ui/StockCard";
import Link from "next/link";

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

export default async function DashboardPage() {
  const quotes = await fetchQuotes();

  const topGainers = [...quotes]
    .sort((a, b) => (b?.changePercent ?? 0) - (a?.changePercent ?? 0))
    .slice(0, 3);
  const topLosers = [...quotes]
    .sort((a, b) => (a?.changePercent ?? 0) - (b?.changePercent ?? 0))
    .slice(0, 3);
  const gainers = quotes.filter((q) => q.changePercent > 0).length;
  const losers = quotes.filter((q) => q.changePercent < 0).length;
  const avgChange =
    quotes.reduce((s, q) => s + q.changePercent, 0) / quotes.length;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Welcome back! Your portfolio and market overview
          </p>
        </div>
        <Link href="/dashboard/search">
          <Button>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </Link>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Gainers Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{gainers}</div>
            <p className="mt-1 text-xs text-gray-500">
              out of {quotes.length} stocks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Losers Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{losers}</div>
            <p className="mt-1 text-xs text-gray-500">
              out of {quotes.length} stocks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Average Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${avgChange >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {avgChange >= 0 ? "+" : ""}
              {avgChange.toFixed(2)}%
            </div>
            <p className="mt-1 text-xs text-gray-500">market average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Last Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="mt-1 text-xs text-gray-500">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Gainers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topGainers.length > 0 ? (
                topGainers.map((stock) => (
                  <div
                    key={stock?.ticker}
                    className="flex items-center justify-between rounded-lg bg-gray-900 p-3 transition hover:bg-gray-800"
                  >
                    <div>
                      <p className="font-semibold">{stock?.ticker}</p>
                      <p className="text-sm text-gray-400">{stock?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${stock?.price.toFixed(2)}
                      </p>
                      <Badge variant="default" className="mt-1 bg-green-600">
                        +{stock?.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-gray-400">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLosers.length > 0 ? (
                topLosers.map((stock) => (
                  <div
                    key={stock?.ticker}
                    className="flex items-center justify-between rounded-lg bg-gray-900 p-3 transition hover:bg-gray-800"
                  >
                    <div>
                      <p className="font-semibold">{stock?.ticker}</p>
                      <p className="text-sm text-gray-400">{stock?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${stock?.price.toFixed(2)}
                      </p>
                      <Badge variant="destructive" className="mt-1">
                        {stock?.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-gray-400">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Market Overview - All Tracked Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quotes.map(
              (stock) =>
                stock && (
                  <div
                    key={stock.ticker}
                    className="rounded-lg bg-gray-900 p-4 transition hover:bg-gray-800"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-lg font-bold">{stock.ticker}</h3>
                      <Badge
                        variant={
                          stock.changePercent >= 0 ? "default" : "destructive"
                        }
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="mb-3 line-clamp-1 text-sm text-gray-400">
                      {stock.name}
                    </p>
                    <p className="mb-1 text-2xl font-bold">
                      ${stock.price.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {stock.change >= 0 ? "↑" : "↓"} $
                      {Math.abs(stock.change).toFixed(2)}
                    </p>
                  </div>
                ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/dashboard/portfolio">
          <Card className="cursor-pointer transition hover:border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Manage your stock positions and track gains/losses
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/watchlist">
          <Card className="cursor-pointer transition hover:border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Track your favorite stocks in real-time
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/trends">
          <Card className="cursor-pointer transition hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                View market trends and live watchlist updates
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
