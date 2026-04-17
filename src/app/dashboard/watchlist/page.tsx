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

export default function WatchlistPage() {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const utils = api.useContext();
  const watchlistQuery = api.watchlist.getAll.useQuery();
  const addMutation = api.watchlist.add.useMutation();
  const removeMutation = api.watchlist.remove.useMutation();
  const stockQuoteQuery = api.stock.getMultipleQuotes.useQuery(
    { symbols: watchlistItems.map((w) => w.symbol) },
    { enabled: watchlistItems.length > 0 },
  );

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
    if (!stockQuoteQuery.data) return null;
    return stockQuoteQuery.data.find((s) => s?.symbol === symbol);
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
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Current Price</p>
                        <p className="text-2xl font-bold">
                          ${stock.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">24h Change</p>
                          <div
                            className={`flex items-center gap-1 text-lg font-semibold ${
                              stock.changePercent >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {stock.changePercent >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {stock.change > 0 ? "+" : ""}
                            {stock.change.toFixed(2)} (
                            {Math.abs(stock.changePercent).toFixed(2)}
                            %)
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Volume</p>
                            <p className="font-semibold">{stock.volume}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Last Updated</p>
                            <p className="font-semibold">{stock.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      Loading price data...
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
