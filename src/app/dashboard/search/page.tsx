"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2 } from "lucide-react";

type StockAPIResponse = {
  ticker: string;
  candlestick_patterns?: Record<string, string>;
  overall_signal?: {
    decision: string;
    confidence: number;
    bullish: number;
    bearish: number;
    neutral: number;
  };
  technical_indicators?: {
    RSI: number;
    MACD: number;
    EMA50: number;
  };
  fundamentals?: {
    "PE Ratio": string;
    "Market Cap": string;
    EPS: string;
  };
  news?: string[];
};

const POPULAR_TICKERS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ICICIBANK",
  "BHARTIARTL",
  "KOTAKBANK",
  "LT",
  "ITC",
  "AXISBANK",
  "MARUTI",
  "SUNPHARMA",
  "TATAMOTORS",
  "BAJFINANCE",
  "WIPRO",
];

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<StockAPIResponse | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [popularStocks, setPopularStocks] = useState<StockAPIResponse[]>([]);
  const [loadingStocks, setLoadingStocks] = useState<Set<string>>(new Set());

  const fetchStock = async (
    ticker: string,
  ): Promise<StockAPIResponse | null> => {
    try {
      const res = await fetch(`/api/fetch-stock?ticker=${ticker}`);

      // Check if response is OK
      if (!res.ok) {
        const errorData = await res.json();
        console.error(`Error for ${ticker}:`, errorData.error);
        return null;
      }

      const response = await res.json();
      console.log(`Frontend received for ${ticker}:`, response);

      // Handle both response formats: { source, data: {...} } or direct data
      const data =
        response.data && typeof response.data === "object"
          ? response.data
          : response;

      if (!data || Object.keys(data).length === 0) {
        console.error(`Empty data for ${ticker}`);
        return null;
      }

      return { ...data, ticker: data.ticker || ticker };
    } catch (error) {
      console.error(`Error fetching ${ticker}:`, error);
      return null;
    }
  };

  const handleSearch = async () => {
    const ticker = searchQuery.trim().toUpperCase();
    if (!ticker) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    const data = await fetchStock(ticker);
    if (data) {
      setSearchResult(data);
    } else {
      setSearchError(`Ticker '${ticker}' not found or invalid`);
    }
    setSearchLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const loadPopularStocks = useCallback(async () => {
    const results = await Promise.allSettled(
      POPULAR_TICKERS.map(async (ticker) => {
        setLoadingStocks((prev) => new Set([...prev, ticker]));
        const data = await fetchStock(ticker);
        setLoadingStocks((prev) => {
          const next = new Set(prev);
          next.delete(ticker);
          return next;
        });
        return data;
      }),
    );

    const successfulStocks = results
      .filter(
        (result): result is PromiseFulfilledResult<StockAPIResponse | null> =>
          result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value as StockAPIResponse);

    setPopularStocks(successfulStocks);
  }, []);

  useEffect(() => {
    loadPopularStocks();
  }, [loadPopularStocks]);

  const handleStockClick = (ticker: string) => {
    router.push(`/dashboard/stock/${ticker}`);
  };

  const renderStockCard = (
    stock: StockAPIResponse,
    isLoading: boolean = false,
  ) => (
    <div
      key={stock.ticker}
      onClick={() => !isLoading && handleStockClick(stock.ticker)}
      className={`border-border bg-card border p-4 transition-all duration-300 ${
        isLoading
          ? "opacity-50"
          : "hover:border-primary/50 cursor-pointer hover:-translate-y-0.5"
      }`}
    >
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-start justify-between">
            <span className="bg-muted text-muted-foreground px-2 py-0.5 font-mono text-xs font-semibold tracking-widest">
              {stock.ticker}
            </span>
            {stock.overall_signal && (
              <span
                className={`px-2 py-0.5 text-xs font-medium ${
                  stock.overall_signal.decision === "BUY"
                    ? "bg-green-600/10 text-green-600"
                    : stock.overall_signal.decision === "SELL"
                      ? "bg-red-600/10 text-red-600"
                      : "bg-yellow-600/10 text-yellow-600"
                }`}
              >
                {stock.overall_signal.decision}
              </span>
            )}
          </div>
          {stock.technical_indicators && (
            <div className="mb-3 space-y-1">
              <p className="text-muted-foreground text-xs">
                RSI: {stock.technical_indicators.RSI.toFixed(2)}
              </p>
              <p className="text-muted-foreground text-xs">
                MACD: {stock.technical_indicators.MACD.toFixed(2)}
              </p>
            </div>
          )}
          <div className="border-border mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
            {stock.fundamentals?.["Market Cap"] &&
              stock.fundamentals["Market Cap"] !== "N/A" && (
                <div>
                  <span className="text-muted-foreground">Mkt Cap</span>
                  <p className="font-medium tabular-nums">
                    {stock.fundamentals["Market Cap"]}
                  </p>
                </div>
              )}
            {stock.overall_signal && (
              <div>
                <span className="text-muted-foreground">Confidence</span>
                <p className="font-medium tabular-nums">
                  {stock.overall_signal.confidence}%
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Search Bar */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Search Stocks</h1>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 font-mono"
          />
          <Button
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
          >
            {searchLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {/* Search Result */}
        {searchError && (
          <p className="text-destructive text-sm">{searchError}</p>
        )}
        {searchResult && (
          <div className="mt-4">{renderStockCard(searchResult)}</div>
        )}
      </div>

      {/* Popular Stocks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Popular Stocks</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {POPULAR_TICKERS.map((ticker) => {
            const stock = popularStocks.find((s) => s.ticker === ticker);
            const isLoading = loadingStocks.has(ticker);
            return renderStockCard(stock || { ticker }, isLoading);
          })}
        </div>
      </div>
    </div>
  );
}
