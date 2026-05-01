"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";
import { api } from "@/trpc/react";
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

export default function StockDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;
  const [data, setData] = useState<StockAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { mutate: addToWatchlistMutate } = api.watchlist.add.useMutation({
    onSuccess: () => {
      alert("Added to watchlist");
    },
  });

  const addToWatchlist = () => {
    addToWatchlistMutate({ symbol: ticker });
  };

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    fetch(`/api/fetch-stock?ticker=${ticker}`)
      .then((res) => res.json())
      .then((response) => {
        console.log(`Details page received for ${ticker}:`, response);

        // Handle both response formats: { source, data: {...} } or direct data
        const data =
          response.data && typeof response.data === "object"
            ? response.data
            : response;

        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch stock data");
        setLoading(false);
      });
  }, [ticker]);

  if (loading)
    return (
      <div className="text-muted-foreground p-8 text-center">Loading...</div>
    );
  if (error || !data)
    return (
      <div className="text-destructive p-8 text-center">
        {error || "Stock not found"}
      </div>
    );

  const signal = data.overall_signal;
  const isBullish = signal?.decision === "BUY";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeftIcon className="h-4 w-4" /> Back
      </Button>

      <div className="border-border bg-card border p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{data.ticker}</h1>
          </div>

          {signal && (
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold ${
                  isBullish
                    ? "bg-green-600/10 text-green-600"
                    : signal.decision === "SELL"
                      ? "bg-red-600/10 text-red-600"
                      : "bg-yellow-600/10 text-yellow-600"
                }`}
              >
                {signal.decision}
              </span>
            </div>
          )}
          <Button className="cursor-pointer" onClick={addToWatchlist}>
            <PlusIcon className="h-4 w-4" /> Add to Watchlist
          </Button>
        </div>

        {/* Signal Breakdown */}
        {signal && (
          <div className="bg-muted/50 mb-6 grid grid-cols-3 gap-4 p-4">
            <div className="text-center">
              <p className="text-muted-foreground text-xs uppercase">Bullish</p>
              <p className="text-2xl font-bold text-green-600">
                {signal.bullish}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs uppercase">Neutral</p>
              <p className="text-2xl font-bold text-yellow-600">
                {signal.neutral}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs uppercase">Bearish</p>
              <p className="text-2xl font-bold text-red-600">
                {signal.bearish}
              </p>
            </div>
          </div>
        )}

        {/* Technical Indicators */}
        {data.technical_indicators && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Technical Indicators</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground text-xs uppercase">RSI</p>
                <p className="text-lg font-medium tabular-nums">
                  {data.technical_indicators.RSI.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">MACD</p>
                <p className="text-lg font-medium tabular-nums">
                  {data.technical_indicators.MACD.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">EMA50</p>
                <p className="text-lg font-medium tabular-nums">
                  {data.technical_indicators.EMA50.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fundamentals */}
        {data.fundamentals && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Fundamentals</h2>
            <div className="grid grid-cols-3 gap-4">
              {data.fundamentals["PE Ratio"] &&
                data.fundamentals["PE Ratio"] !== "N/A" && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      P/E Ratio
                    </p>
                    <p className="text-lg font-medium tabular-nums">
                      {data.fundamentals["PE Ratio"]}
                    </p>
                  </div>
                )}
              {data.fundamentals["Market Cap"] &&
                data.fundamentals["Market Cap"] !== "N/A" && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      Market Cap
                    </p>
                    <p className="text-lg font-medium tabular-nums">
                      {data.fundamentals["Market Cap"]}
                    </p>
                  </div>
                )}
              {data.fundamentals["EPS"] &&
                data.fundamentals["EPS"] !== "N/A" && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      EPS
                    </p>
                    <p className="text-lg font-medium tabular-nums">
                      {data.fundamentals["EPS"]}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Candlestick Patterns */}
        {data.candlestick_patterns && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Candlestick Patterns</h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {Object.entries(data.candlestick_patterns).map(
                ([pattern, signal]) => (
                  <div
                    key={pattern}
                    className={`border p-2 text-xs ${
                      signal === "Bullish"
                        ? "border-green-600/30 bg-green-600/5 text-green-600"
                        : signal === "Bearish"
                          ? "border-red-600/30 bg-red-600/5 text-red-600"
                          : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <span className="font-medium">{pattern}</span>
                    <span className="ml-2">{signal}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* News */}
        {data.news && data.news.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Latest News</h2>
            <ul className="space-y-2">
              {data.news.map((item, idx) => (
                <li
                  key={idx}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex w-full flex-row gap-2">
        <Button
          className="w-1/2 cursor-pointer hover:bg-red-600"
          variant={"destructive"}
        >
          Sell
        </Button>

        <Button className="w-1/2 cursor-pointer bg-green-600 text-white">
          Buy
        </Button>
      </div>
    </div>
  );
}
