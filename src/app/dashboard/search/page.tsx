"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { TrendingUp, TrendingDown, Heart, ShoppingCart } from "lucide-react";
import { api } from "@/trpc/react";

interface SearchResult {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  timestamp: string;
}

export default function SearchStocks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [showAction, setShowAction] = useState(false);
  const [actionType, setActionType] = useState<"watchlist" | "portfolio">(
    "watchlist",
  );
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");

  const utils = api.useContext();
  const searchMutation = api.stock.searchSymbol.useMutation();
  const getQuoteMutation = api.stock.getQuote.useMutation();
  const addWatchlistMutation = api.watchlist.add.useMutation();
  const addPositionMutation = api.portfolio.addPosition.useMutation();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchResults([]);
    setSelectedStock(null);

    if (query.trim().length === 0) return;

    try {
      const results = await searchMutation.mutateAsync({ query });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const handleSelectStock = async (symbol: string) => {
    try {
      const quote = await getQuoteMutation.mutateAsync({ symbol });
      if (quote) {
        setSelectedStock(quote);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedStock) return;

    try {
      await addWatchlistMutation.mutateAsync({ symbol: selectedStock.symbol });
      await utils.watchlist.getAll.invalidate();
      setShowAction(false);
      alert("Added to watchlist!");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  const handleAddToPortfolio = async () => {
    if (!selectedStock || !shares || !price) return;

    try {
      await addPositionMutation.mutateAsync({
        symbol: selectedStock.symbol,
        shares: parseFloat(shares),
        price: parseFloat(price),
      });
      await utils.portfolio.getAll.invalidate();
      setShowAction(false);
      setShares("");
      setPrice("");
      alert("Position added to portfolio!");
    } catch (error) {
      console.error("Error adding to portfolio:", error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Search Stocks</h1>
        <p className="text-gray-400">
          Find stocks and add them to your watchlist or portfolio
        </p>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Input
          placeholder="Search by stock symbol (e.g., AAPL, MSFT, GOOGL)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="h-12 w-full text-lg"
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && !selectedStock && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            Found {searchResults.length} result
            {searchResults.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {searchResults.map((symbol) => (
              <Card
                key={symbol}
                className="hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleSelectStock(symbol)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">{symbol}</p>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stock Details */}
      {selectedStock && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{selectedStock.symbol}</h2>
                  <p className="text-gray-400">
                    Last updated: {selectedStock.timestamp}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStock(null);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  Clear
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-900 p-4">
                  <p className="mb-1 text-sm text-gray-400">Current Price</p>
                  <p className="text-3xl font-bold">
                    ${selectedStock.price.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-900 p-4">
                  <p className="mb-1 text-sm text-gray-400">24h Change</p>
                  <div
                    className={`text-3xl font-bold ${
                      selectedStock.changePercent >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedStock.change > 0 ? "+" : ""}
                    {selectedStock.change.toFixed(2)} (
                    {selectedStock.changePercent.toFixed(2)}%)
                  </div>
                </div>

                <div className="rounded-lg bg-gray-900 p-4">
                  <p className="mb-1 text-sm text-gray-400">Volume</p>
                  <p className="text-xl font-bold">{selectedStock.volume}</p>
                </div>
              </div>

              <div className="flex gap-3 border-t pt-4">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    setActionType("watchlist");
                    setShowAction(true);
                  }}
                >
                  <Heart className="h-4 w-4" />
                  Add to Watchlist
                </Button>
                <Button
                  className="flex-1 gap-2"
                  variant="outline"
                  onClick={() => {
                    setActionType("portfolio");
                    setShowAction(true);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Portfolio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !selectedStock && (
        <Card className="border-dashed">
          <CardContent className="pt-12">
            <div className="text-center text-gray-400">
              <p>No stocks found matching "{searchQuery}"</p>
              <p className="mt-2 text-sm">
                Try searching for common symbols like AAPL, MSFT, GOOGL
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add to Watchlist Modal */}
      <AlertDialog
        open={showAction && actionType === "watchlist"}
        onOpenChange={setShowAction}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Watchlist</AlertDialogTitle>
            <AlertDialogDescription>
              Add {selectedStock?.symbol} to your watchlist to track its price
              movements
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddToWatchlist}>
              Add to Watchlist
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to Portfolio Modal */}
      <AlertDialog
        open={showAction && actionType === "portfolio"}
        onOpenChange={setShowAction}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Portfolio</AlertDialogTitle>
            <AlertDialogDescription>
              Record your {selectedStock?.symbol} purchase
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Number of Shares</label>
              <Input
                placeholder="e.g., 10.5"
                type="number"
                step="0.01"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Purchase Price per Share
              </label>
              <Input
                placeholder="e.g., 150.25"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            {shares && price && (
              <div className="rounded bg-gray-900 p-3 text-sm">
                <p className="text-gray-400">Total Cost</p>
                <p className="text-lg font-bold">
                  ${(parseFloat(shares) * parseFloat(price)).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddToPortfolio}>
              Add to Portfolio
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
