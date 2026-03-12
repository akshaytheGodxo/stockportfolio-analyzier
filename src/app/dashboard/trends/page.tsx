'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Search, Plus } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  timestamp: string;
}

interface GlobalQuote {
  '01. symbol'?: string;
  '05. price'?: string;
  '09. change'?: string;
  '10. change percent'?: string;
  '06. volume'?: string;
  '07. latest trading day'?: string;
  [key: string]: string | undefined;
}

const DEFAULT_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META'];

export default function TrendsPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_STOCKS);

  useEffect(() => {
    const fetchStockData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      const newStocks: StockData[] = [];
      const errorMessages: (string | null)[] = [];

      for (const symbol of watchlist) {
        try {
          const response = await fetch(`/api/check-stock?symbol=${symbol}`);
          
          if (!response.ok) {
            const error = `API error for ${symbol}: ${response.statusText}`;
            console.error(error);
            errorMessages.push(error);
            continue;
          }

          const data = (await response.json()) as Record<string, unknown>;
          console.log(`Full response for ${symbol}:`, JSON.stringify(data, null, 2));

          // Check for API rate limit or error messages
          if (typeof data.Note === 'string') {
            console.warn(`API Note for ${symbol}: ${data.Note}`);
            errorMessages.push(`${symbol}: ${data.Note}`);
            setError(data.Note);
            continue;
          }

          if (typeof data.Information === 'string') {
            console.warn(`API Information for ${symbol}: ${data.Information}`);
            errorMessages.push(`${symbol}: ${data.Information}`);
            continue;
          }

          if (typeof data.Error === 'string') {
            console.warn(`API Error for ${symbol}: ${data.Error}`);
            errorMessages.push(`${symbol}: ${data.Error}`);
            continue;
          }

          const quote = data['Global Quote'] as GlobalQuote | undefined;
          
          if (quote && Object.keys(quote).length > 0) {
            const price = parseFloat(quote['05. price'] ?? '0');
            
            // Only add if we have valid price data
            if (!isNaN(price) && price > 0) {
              newStocks.push({
                symbol: quote['01. symbol'] ?? symbol,
                price,
                change: parseFloat(quote['09. change'] ?? '0'),
                changePercent: parseFloat((quote['10. change percent'] ?? '0').replace('%', '')),
                volume: quote['06. volume'] ?? 'N/A',
                timestamp: quote['07. latest trading day'] ?? new Date().toISOString().split('T')[0]!,
              });
              console.log(`Successfully loaded ${symbol}:`, { price, volume: quote['06. volume'] });
            } else {
              console.warn(`Invalid price data for ${symbol}:`, quote);
              errorMessages.push(`${symbol}: Invalid or missing price data`);
            }
          } else {
            console.warn(`No Global Quote data for ${symbol}`, data);
            errorMessages.push(`${symbol}: No quote data received`);
          }
        } catch (err) {
          const errorMsg = `Failed to fetch ${symbol}: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          errorMessages.push(errorMsg);
        }
      }

      if (errorMessages.length > 0 && newStocks.length === 0) {
        setError(errorMessages.slice(0, 2).join(' | '));
      }

      setStocks(newStocks);
      setLoading(false);
    };

    void fetchStockData();
    const interval = setInterval(() => {
      void fetchStockData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [watchlist]);

  const handleAddStock = async () => {
    const upperSymbol = searchSymbol.toUpperCase().trim();
    if (!upperSymbol || watchlist.includes(upperSymbol)) {
      return;
    }

    setWatchlist([...watchlist, upperSymbol]);
    setSearchSymbol('');
  };

  const handleRemoveStock = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
    setStocks(stocks.filter((s) => s.symbol !== symbol));
  };

  const sortedStocks = [...stocks].sort((a, b) => b.changePercent - a.changePercent);

  return (
    <div className="p-6 space-y-6 bg-linear-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Market Trends</h1>
        <p className="text-gray-400">Track stock trends and market movements in real-time</p>
      </div>

      {/* Search Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Add Stock to Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={handleAddStock}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 space-y-2">
          <p className="text-red-200 font-semibold">⚠️ Data Fetch Error</p>
          <p className="text-red-200 text-sm">{error}</p>
          {error.includes('API key') && (
            <div className="text-red-100 text-xs mt-3 pt-3 border-t border-red-700 space-y-1">
              <p>To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Get a free API key from <a href="https://www.alphavantage.co/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-50">alphavantage.co</a></li>
                <li>Create a <code className="bg-red-800 px-2 py-1 rounded">.env.local</code> file in the project root</li>
                <li>Add: <code className="bg-red-800 px-2 py-1 rounded">ALPHA_VANTAGE_KEY=your_api_key_here</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && stocks.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 mt-4">Loading market data...</p>
          <p className="text-gray-500 text-xs mt-2">Fetching stock data from Alpha Vantage</p>
        </div>
      )}

      {/* No Data State */}
      {stocks.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No stocks in your watchlist</p>
          <p className="text-gray-500 text-sm">Add stocks above to track their trends and performance</p>
        </div>
      )}

      {/* Main Stats Grid */}
      {stocks.length > 0 && (
        <>
          {/* Top Gainers and Losers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Gainers */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedStocks.slice(0, 3).map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <p className="text-gray-400 text-sm">${stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-400">
                        +{stock.changePercent.toFixed(2)}%
                      </p>
                      <p className="text-gray-400 text-sm">+${stock.change.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedStocks.slice(-3).reverse().map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-white">{stock.symbol}</p>
                      <p className="text-gray-400 text-sm">${stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-400">
                        {stock.changePercent.toFixed(2)}%
                      </p>
                      <p className="text-gray-400 text-sm">${stock.change.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* All Stocks Table */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Complete Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-gray-300 font-semibold">Symbol</th>
                      <th className="text-right py-3 text-gray-300 font-semibold">Price</th>
                      <th className="text-right py-3 text-gray-300 font-semibold">Change</th>
                      <th className="text-right py-3 text-gray-300 font-semibold">Change %</th>
                      <th className="text-right py-3 text-gray-300 font-semibold">Volume</th>
                      <th className="text-center py-3 text-gray-300 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock) => (
                      <tr key={stock.symbol} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 text-white font-semibold">{stock.symbol}</td>
                        <td className="text-right py-3 text-white">${stock.price.toFixed(2)}</td>
                        <td className={`text-right py-3 font-semibold ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </td>
                        <td className={`text-right py-3 font-semibold flex items-center justify-end gap-1 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.changePercent >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 text-gray-400">
                          {stock.volume}
                        </td>
                        <td className="text-center py-3">
                          {watchlist.length > 1 && (
                            <button
                              onClick={() => handleRemoveStock(stock.symbol)}
                              className="text-red-400 hover:text-red-300 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-400 text-sm">Average Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  ${(stocks.reduce((sum, s) => sum + s.price, 0) / stocks.length).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-400 text-sm">Average Change</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length).toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-400 text-sm">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {stocks.length} Assets
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
