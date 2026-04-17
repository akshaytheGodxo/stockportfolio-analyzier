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
import { TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useState as useStateCallback } from "react";

interface PortfolioItem {
  id: string;
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice?: number;
}

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [formData, setFormData] = useState({
    symbol: "",
    shares: "",
    price: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const utils = api.useContext();
  const portfolioQuery = api.portfolio.getAll.useQuery();
  const addPositionMutation = api.portfolio.addPosition.useMutation();
  const sellPositionMutation = api.portfolio.sellPosition.useMutation();
  const deletePositionMutation = api.portfolio.deletePosition.useMutation();
  const stockQuoteQuery = api.stock.getMultipleQuotes.useQuery(
    {
      symbols: portfolioItems.map((p) => p.symbol),
    },
    { enabled: portfolioItems.length > 0 },
  );

  useEffect(() => {
    if (portfolioQuery.data) {
      setPortfolioItems(
        portfolioQuery.data.map((p) => ({
          id: p.id,
          symbol: p.symbol,
          shares: p.shares,
          averagePrice: p.averagePrice,
        })),
      );
      setLoading(false);
    }
  }, [portfolioQuery.data]);

  const handleAddPosition = async () => {
    if (!formData.symbol || !formData.shares || !formData.price) return;

    try {
      await addPositionMutation.mutateAsync({
        symbol: formData.symbol.toUpperCase(),
        shares: parseFloat(formData.shares),
        price: parseFloat(formData.price),
      });
      await utils.portfolio.getAll.invalidate();
      setFormData({ symbol: "", shares: "", price: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding position:", error);
    }
  };

  const handleSellPosition = async () => {
    if (!selectedSymbol || !formData.shares || !formData.price) return;

    try {
      await sellPositionMutation.mutateAsync({
        symbol: selectedSymbol,
        shares: parseFloat(formData.shares),
        price: parseFloat(formData.price),
      });
      await utils.portfolio.getAll.invalidate();
      setFormData({ symbol: "", shares: "", price: "" });
      setShowSellModal(false);
      setSelectedSymbol("");
    } catch (error) {
      console.error("Error selling position:", error);
    }
  };

  const handleDeletePosition = async (symbol: string) => {
    try {
      await deletePositionMutation.mutateAsync({ symbol });
      await utils.portfolio.getAll.invalidate();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting position:", error);
    }
  };

  const getStockPrice = (symbol: string) => {
    if (!stockQuoteQuery.data) return null;
    return stockQuoteQuery.data.find((s) => s?.symbol === symbol);
  };

  const getTotalValue = (symbol: string) => {
    const item = portfolioItems.find((p) => p.symbol === symbol);
    const stock = getStockPrice(symbol);
    if (!item || !stock) return null;
    return item.shares * stock.price;
  };

  const getGainLoss = (symbol: string) => {
    const item = portfolioItems.find((p) => p.symbol === symbol);
    const stock = getStockPrice(symbol);
    if (!item || !stock) return null;
    const totalValue = item.shares * stock.price;
    const totalCost = item.shares * item.averagePrice;
    return totalValue - totalCost;
  };

  const getTotalPortfolioValue = () => {
    return portfolioItems.reduce((sum, item) => {
      const value = getTotalValue(item.symbol);
      return sum + (value || 0);
    }, 0);
  };

  const getTotalPortfolioCost = () => {
    return portfolioItems.reduce((sum, item) => {
      return sum + item.shares * item.averagePrice;
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Loading portfolio...</div>
      </div>
    );
  }

  const portfolioValue = getTotalPortfolioValue();
  const portfolioCost = getTotalPortfolioCost();
  const portfolioGainLoss = portfolioValue - portfolioCost;
  const portfolioGainLossPercent =
    portfolioCost > 0 ? (portfolioGainLoss / portfolioCost) * 100 : 0;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <Button onClick={() => setShowAddModal(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      {portfolioItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${portfolioValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${portfolioCost.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Gain/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  portfolioGainLoss >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ${Math.abs(portfolioGainLoss).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Return %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  portfolioGainLossPercent >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {portfolioGainLossPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {portfolioItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12">
            <div className="text-center text-gray-400">
              <p className="mb-4">No positions yet</p>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Position
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {portfolioItems.map((item) => {
            const stock = getStockPrice(item.symbol);
            const totalValue = getTotalValue(item.symbol);
            const gainLoss = getGainLoss(item.symbol);
            const gainLossPercent =
              totalValue && gainLoss
                ? (gainLoss / (item.shares * item.averagePrice)) * 100
                : 0;

            return (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-bold">{item.symbol}</h3>
                          <p className="text-sm text-gray-400">
                            {item.shares} shares @ $
                            {item.averagePrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {stock && (
                      <>
                        <div className="flex-1 text-right">
                          <p className="text-lg font-semibold">
                            ${stock.price.toFixed(2)}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 ${
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
                            {Math.abs(stock.changePercent).toFixed(2)}%
                          </div>
                        </div>

                        <div className="flex-1 text-right">
                          <p className="text-lg font-semibold">
                            ${totalValue?.toFixed(2)}
                          </p>
                          {gainLoss !== null && (
                            <Badge
                              variant={
                                gainLoss >= 0 ? "default" : "destructive"
                              }
                            >
                              {gainLoss >= 0 ? "+" : ""}
                              {gainLoss.toFixed(2)} (
                              {gainLossPercent.toFixed(2)}
                              %)
                            </Badge>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSymbol(item.symbol);
                          setShowSellModal(true);
                        }}
                      >
                        Sell
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm(item.symbol)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Position Modal */}
      <AlertDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Position</AlertDialogTitle>
            <AlertDialogDescription>
              Add a new stock position to your portfolio
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Stock Symbol (e.g., AAPL)"
              value={formData.symbol}
              onChange={(e) =>
                setFormData({ ...formData, symbol: e.target.value })
              }
            />
            <Input
              placeholder="Number of Shares"
              type="number"
              step="0.01"
              value={formData.shares}
              onChange={(e) =>
                setFormData({ ...formData, shares: e.target.value })
              }
            />
            <Input
              placeholder="Purchase Price per Share"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddPosition}>
              Add Position
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sell Position Modal */}
      <AlertDialog open={showSellModal} onOpenChange={setShowSellModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sell Position</AlertDialogTitle>
            <AlertDialogDescription>
              Sell your {selectedSymbol} shares
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Number of Shares"
              type="number"
              step="0.01"
              value={formData.shares}
              onChange={(e) =>
                setFormData({ ...formData, shares: e.target.value })
              }
            />
            <Input
              placeholder="Sale Price per Share"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSellPosition}>
              Sell Position
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
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this position?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleDeletePosition(deleteConfirm)
              }
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
