"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Plus, Trash2, Heart } from "lucide-react";
import { api } from "@/trpc/react";

interface WatchlistItem {
  id: string;
  symbol: string;
  createdAt: Date;
}

type StockAnalysis = {
  ticker: string;
  candlestick_patterns: Record<string, string>;
  overall_signal: {
    decision: string;
    confidence: number;
    bullish: number;
    bearish: number;
    neutral: number;
  };
  technical_indicators: {
    RSI: number;
    MACD: number;
    EMA50: number;
  };
  fundamentals: Record<string, string>;
  news: string[];
};

export default function WatchlistPage() {
  const [analysisMap, setAnalysisMap] = useState<
    Record<string, StockAnalysis | null>
  >({});
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const utils = api.useContext();
  const watchlistQuery = api.watchlist.getAll.useQuery();
  const addMutation = api.watchlist.add.useMutation();
  const removeMutation = api.watchlist.remove.useMutation();

  // const stockAnalysisQuery = api.stock.getAnalysisMultiple.useQuery(
  //   { symbols: watchlistItems.map((w) => w.symbol) },
  //   { enabled: watchlistItems.length > 0 },
  // );

  useEffect(() => {
    if (watchlistQuery.data) {
      setWatchlistItems(
        watchlistQuery.data.map((w) => ({
          id: w.id,
          symbol: w.symbol,
          createdAt: w.createdAt,
        })),
      );
      setLoading(false);
    }
  }, [watchlistQuery.data]);
  console.log(watchlistItems);
  // console.log(process.env.NEXT_PUBLIC_BASE_URL);
  useEffect(() => {
    if (watchlistItems.length === 0) return;

    watchlistItems.forEach((item) => {
      fetch(`/api/fetch-stock?ticker=${item.symbol}`)
        .then((res) => res.json())
        .then((response) => {
          console.log(`Received for ${item.symbol}:`, response);

          const data =
            response.data && typeof response.data === "object"
              ? response.data
              : response;

          setAnalysisMap((prev) => ({
            ...prev,
            [item.symbol]: data,
          }));
        })
        .catch((err) => {
          console.error(`Error for ${item.symbol}:`, err);

          setAnalysisMap((prev) => ({
            ...prev,
            [item.symbol]: null,
          }));
        });
    });
  }, [watchlistItems]);

  const handleAddToWatchlist = async () => {
    if (!newSymbol.trim()) return;

    try {
      await addMutation.mutateAsync({ symbol: newSymbol.toUpperCase() });
      await utils.watchlist.getAll.invalidate();
      setNewSymbol("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };
  console.log(analysisMap);
  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      await removeMutation.mutateAsync({ symbol });
      await utils.watchlist.getAll.invalidate();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };
  const getStockData = (symbol: string) => {
    return analysisMap[symbol] || null;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Loading watchlist...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <Button onClick={() => setShowAddModal(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add to Watchlist
        </Button>
      </div>

      {watchlistItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12">
            <div className="text-center text-gray-400">
              <Heart className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="mb-4">Your watchlist is empty</p>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Stock
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {watchlistItems.map((item) => {
            const stock = getStockData(item.symbol);

            return (
              <Card key={item.id} className="relative">
                <CardContent className="pt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setDeleteConfirm(item.symbol)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>

                  <div className="mb-4">
                    <h3 className="text-2xl font-bold">{item.symbol}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {stock ? (
                    <div className="space-y-4">
                      {/* Signal */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Signal</p>
                        <Badge
                          className={`text-white ${
                            stock.overall_signal.decision === "BUY"
                              ? "bg-green-500"
                              : stock.overall_signal.decision === "SELL"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        >
                          {stock.overall_signal.decision}
                        </Badge>
                      </div>

                      {/* Confidence */}
                      <div>
                        <p className="text-sm text-gray-400">Confidence</p>
                        <p className="text-lg font-semibold">
                          {stock.overall_signal.confidence}%
                        </p>
                      </div>

                      {/* Indicators */}
                      <div className="border-t pt-3">
                        <p className="mb-2 text-sm text-gray-400">Indicators</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">RSI</p>
                            <p
                              className={`font-semibold ${
                                stock.technical_indicators.RSI > 70
                                  ? "text-red-500"
                                  : stock.technical_indicators.RSI < 30
                                    ? "text-green-500"
                                    : ""
                              }`}
                            >
                              {stock.technical_indicators.RSI.toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400">MACD</p>
                            <p className="font-semibold">
                              {stock.technical_indicators.MACD.toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400">EMA50</p>
                            <p className="font-semibold">
                              {stock.technical_indicators.EMA50.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pattern Summary */}
                      <div className="border-t pt-3 text-sm">
                        <p className="text-gray-400">Patterns</p>
                        <p>
                          B: {stock.overall_signal.bullish} | S:{" "}
                          {stock.overall_signal.bearish} | N:{" "}
                          {stock.overall_signal.neutral}
                        </p>
                      </div>

                      {/* News */}
                      <div className="border-t pt-3">
                        <p className="mb-2 text-sm text-gray-400">News</p>
                        <ul className="space-y-1 text-sm">
                          {stock.news.slice(0, 2).map((n, i) => (
                            <li key={i}>• {n}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      Loading analysis...
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add to Watchlist Modal */}
      <AlertDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Watchlist</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the stock symbol you want to watch
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Stock Symbol (e.g., AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddToWatchlist()}
            />
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddToWatchlist}>
              Add to Watchlist
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Watchlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteConfirm} from your
              watchlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleRemoveFromWatchlist(deleteConfirm)
              }
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
