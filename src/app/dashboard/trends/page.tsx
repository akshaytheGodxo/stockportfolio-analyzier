'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Search, Plus, X, Activity, BarChart3, Wallet } from 'lucide-react';

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

function Sparkline({ positive }: { positive: boolean }) {
  const points = positive
    ? '0,28 8,22 16,26 24,18 32,20 40,12 48,16 56,8 64,10 72,4'
    : '0,4 8,10 16,8 24,16 32,12 40,20 48,18 56,26 64,22 72,28';
  return (
    <svg width="72" height="32" viewBox="0 0 72 32" fill="none">
      <defs>
        <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#10b981' : '#f43f5e'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? '#10b981' : '#f43f5e'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#10b981' : '#f43f5e'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
            errorMessages.push(`API error for ${symbol}: ${response.statusText}`);
            continue;
          }
          const data = (await response.json()) as Record<string, unknown>;
          if (typeof data.Note === 'string') { setError(data.Note); continue; }
          if (typeof data.Information === 'string') { errorMessages.push(`${symbol}: ${data.Information}`); continue; }
          if (typeof data.Error === 'string') { errorMessages.push(`${symbol}: ${data.Error}`); continue; }
          const quote = data['Global Quote'] as GlobalQuote | undefined;
          if (quote && Object.keys(quote).length > 0) {
            const price = parseFloat(quote['05. price'] ?? '0');
            if (!isNaN(price) && price > 0) {
              newStocks.push({
                symbol: quote['01. symbol'] ?? symbol,
                price,
                change: parseFloat(quote['09. change'] ?? '0'),
                changePercent: parseFloat((quote['10. change percent'] ?? '0').replace('%', '')),
                volume: quote['06. volume'] ?? 'N/A',
                timestamp: quote['07. latest trading day'] ?? new Date().toISOString().split('T')[0]!,
              });
            } else errorMessages.push(`${symbol}: Invalid price`);
          } else errorMessages.push(`${symbol}: No data`);
        } catch (err) {
          errorMessages.push(`Failed to fetch ${symbol}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      if (errorMessages.length > 0 && newStocks.length === 0) {
        setError(errorMessages.slice(0, 2).join(' | '));
      }
      setStocks(newStocks);
      setLoading(false);
    };

    void fetchStockData();
    const interval = setInterval(() => void fetchStockData(), 30000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const handleAddStock = () => {
    const upper = searchSymbol.toUpperCase().trim();
    if (!upper || watchlist.includes(upper)) return;
    setWatchlist([...watchlist, upper]);
    setSearchSymbol('');
  };

  const handleRemoveStock = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
    setStocks(stocks.filter((s) => s.symbol !== symbol));
  };

  const sortedStocks = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const avgPrice = stocks.length ? stocks.reduce((s, x) => s + x.price, 0) / stocks.length : 0;
  const avgChange = stocks.length ? stocks.reduce((s, x) => s + x.changePercent, 0) / stocks.length : 0;
  const gainers = sortedStocks.filter(s => s.changePercent >= 0);
  const losers = [...sortedStocks].reverse().filter(s => s.changePercent < 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&display=swap');

        .trends-root {
          font-family: 'Syne', sans-serif;
          background: #080c14;
          min-height: 100vh;
          padding: 2.5rem 2rem;
          position: relative;
          overflow-x: hidden;
          color: #e2e8f0;
        }

        .trends-root::before {
          content: '';
          position: fixed;
          top: -20%;
          left: -10%;
          width: 55vw;
          height: 55vw;
          background: radial-gradient(circle, rgba(16,185,129,0.045) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .trends-root::after {
          content: '';
          position: fixed;
          bottom: -15%;
          right: -10%;
          width: 45vw;
          height: 45vw;
          background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .trends-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .t-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .t-title-block {}

        .t-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .t-eyebrow::before {
          content: '';
          display: inline-block;
          width: 18px;
          height: 1px;
          background: #10b981;
        }

        .t-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .t-title span {
          color: #10b981;
        }

        .t-live-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 100px;
          padding: 0.35rem 0.9rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          color: #10b981;
          letter-spacing: 0.08em;
        }

        .t-live-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        /* Search */
        .t-search-bar {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 2rem;
          backdrop-filter: blur(8px);
        }

        .t-search-icon {
          color: #64748b;
          flex-shrink: 0;
        }

        .t-search-input {
          flex: 1;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: #e2e8f0 !important;
          letter-spacing: 0.06em;
        }

        .t-search-input::placeholder { color: #475569; }

        .t-search-input:focus {
          ring: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        .t-add-btn {
          background: #10b981 !important;
          color: #022c22 !important;
          border: none !important;
          border-radius: 10px !important;
          font-family: 'Syne', sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.8rem !important;
          padding: 0.5rem 1.1rem !important;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .t-add-btn:hover {
          background: #34d399 !important;
          transform: translateY(-1px);
        }

        /* Error */
        .t-error {
          background: rgba(244,63,94,0.07);
          border: 1px solid rgba(244,63,94,0.2);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          color: #fda4af;
          line-height: 1.6;
        }

        /* Loading */
        .t-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 0;
          gap: 1rem;
        }

        .t-spinner {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(16,185,129,0.1);
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .t-loading p {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #475569;
          letter-spacing: 0.08em;
        }

        /* Stats row */
        .t-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        @media (max-width: 640px) { .t-stats-row { grid-template-columns: 1fr; } }

        .t-stat-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(8px);
          transition: border-color 0.2s;
        }

        .t-stat-card:hover { border-color: rgba(255,255,255,0.13); }

        .t-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .t-stat-icon.green { background: rgba(16,185,129,0.1); color: #10b981; }
        .t-stat-icon.indigo { background: rgba(99,102,241,0.1); color: #818cf8; }
        .t-stat-icon.amber { background: rgba(245,158,11,0.1); color: #fbbf24; }

        .t-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          color: #64748b;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.2rem;
        }

        .t-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .t-stat-value.positive { color: #10b981; }
        .t-stat-value.negative { color: #f43f5e; }

        /* Gainers/Losers grid */
        .t-gl-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        @media (max-width: 768px) { .t-gl-grid { grid-template-columns: 1fr; } }

        .t-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(8px);
        }

        .t-panel-header {
          padding: 1rem 1.25rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .t-panel-title {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .t-gl-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }

        .t-gl-row:last-child { border-bottom: none; }
        .t-gl-row:hover { background: rgba(255,255,255,0.025); }

        .t-gl-sym {
          font-weight: 700;
          font-size: 0.95rem;
          color: #f1f5f9;
          letter-spacing: 0.03em;
          width: 60px;
        }

        .t-gl-price {
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          color: #64748b;
        }

        .t-gl-change {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: right;
        }

        .t-gl-change.up { color: #10b981; }
        .t-gl-change.down { color: #f43f5e; }

        /* Table */
        .t-table-panel {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(8px);
        }

        .t-table-header {
          padding: 1rem 1.5rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .t-table-title {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .t-table-count {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          color: #475569;
          letter-spacing: 0.08em;
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
        }

        table.t-table {
          width: 100%;
          border-collapse: collapse;
        }

        .t-table thead tr {
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .t-table thead th {
          padding: 0.65rem 1.5rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem;
          color: #475569;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 400;
          text-align: left;
        }

        .t-table thead th:not(:first-child) { text-align: right; }
        .t-table thead th:last-child { text-align: center; }

        .t-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.035);
          transition: background 0.12s;
        }

        .t-table tbody tr:last-child { border-bottom: none; }
        .t-table tbody tr:hover { background: rgba(255,255,255,0.025); }

        .t-table td {
          padding: 0.8rem 1.5rem;
          font-size: 0.88rem;
        }

        .t-table .col-sym {
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: 0.04em;
        }

        .t-table .col-num {
          font-family: 'DM Mono', monospace;
          font-size: 0.82rem;
          color: #cbd5e1;
          text-align: right;
        }

        .t-table .col-change {
          font-family: 'DM Mono', monospace;
          font-size: 0.82rem;
          text-align: right;
        }

        .t-table .col-change.up { color: #10b981; }
        .t-table .col-change.down { color: #f43f5e; }

        .t-table .col-vol {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #475569;
          text-align: right;
        }

        .t-table .col-spark { text-align: right; }

        .t-table .col-action { text-align: center; }

        .t-remove-btn {
          background: transparent;
          border: 1px solid rgba(244,63,94,0.2);
          border-radius: 6px;
          color: #f43f5e;
          font-size: 0.7rem;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.15s;
          opacity: 0.5;
        }

        .t-remove-btn:hover {
          background: rgba(244,63,94,0.1);
          border-color: rgba(244,63,94,0.5);
          opacity: 1;
        }

        .t-badge-up {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.15);
          color: #10b981;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .t-badge-down {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.15);
          color: #f43f5e;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Empty state */
        .t-empty {
          text-align: center;
          padding: 5rem 0;
        }

        .t-empty p {
          font-family: 'DM Mono', monospace;
          color: #475569;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          line-height: 1.8;
        }

        /* Divider line */
        .t-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent);
          margin: 0.25rem 0 1.75rem;
        }
      `}</style>

      <div className="trends-root">
        <div className="trends-inner">

          {/* Header */}
          <div className="t-header">
            <div className="t-title-block">
              <div className="t-eyebrow">Market Trends</div>
              <h1 className="t-title">Live <span>Watchlist</span></h1>
            </div>
            <div className="t-live-badge">
              <span className="t-live-dot" />
              LIVE · AUTO-REFRESH 30s
            </div>
          </div>

          {/* Search */}
          <div className="t-search-bar">
            <Search className="t-search-icon" size={16} />
            <input
              className="t-search-input"
              placeholder="Add a symbol — e.g. NVDA, BRK.B"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
            />
            <button className="t-add-btn" onClick={handleAddStock}>
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="t-error">
              ⚠ {error}
              {error.includes('API key') && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(244,63,94,0.15)' }}>
                  Get a free key at alphavantage.co · Add ALPHA_VANTAGE_KEY to .env.local
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && stocks.length === 0 && (
            <div className="t-loading">
              <div className="t-spinner" />
              <p>FETCHING MARKET DATA</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && stocks.length === 0 && (
            <div className="t-empty">
              <p>No stocks loaded.<br />Add symbols above to begin tracking.</p>
            </div>
          )}

          {stocks.length > 0 && (
            <>
              {/* Stats row */}
              <div className="t-stats-row">
                <div className="t-stat-card">
                  <div className="t-stat-icon green"><Wallet size={18} /></div>
                  <div>
                    <div className="t-stat-label">Avg. Price</div>
                    <div className="t-stat-value">${avgPrice.toFixed(2)}</div>
                  </div>
                </div>
                <div className="t-stat-card">
                  <div className="t-stat-icon indigo"><Activity size={18} /></div>
                  <div>
                    <div className="t-stat-label">Avg. Change</div>
                    <div className={`t-stat-value ${avgChange >= 0 ? 'positive' : 'negative'}`}>
                      {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="t-stat-card">
                  <div className="t-stat-icon amber"><BarChart3 size={18} /></div>
                  <div>
                    <div className="t-stat-label">Tracked</div>
                    <div className="t-stat-value">{stocks.length} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>assets</span></div>
                  </div>
                </div>
              </div>

              {/* Gainers / Losers */}
              <div className="t-gl-grid">
                {/* Gainers */}
                <div className="t-panel">
                  <div className="t-panel-header">
                    <TrendingUp size={14} color="#10b981" />
                    <span className="t-panel-title" style={{ color: '#10b981' }}>Top Gainers</span>
                  </div>
                  {gainers.slice(0, 3).map(stock => (
                    <div className="t-gl-row" key={stock.symbol}>
                      <span className="t-gl-sym">{stock.symbol}</span>
                      <Sparkline positive={true} />
                      <div style={{ textAlign: 'right' }}>
                        <div className="t-gl-change up">+{stock.changePercent.toFixed(2)}%</div>
                        <div className="t-gl-price">${stock.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {gainers.length === 0 && (
                    <div style={{ padding: '1.25rem', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#475569' }}>No gainers today</div>
                  )}
                </div>

                {/* Losers */}
                <div className="t-panel">
                  <div className="t-panel-header">
                    <TrendingDown size={14} color="#f43f5e" />
                    <span className="t-panel-title" style={{ color: '#f43f5e' }}>Top Losers</span>
                  </div>
                  {losers.slice(0, 3).map(stock => (
                    <div className="t-gl-row" key={stock.symbol}>
                      <span className="t-gl-sym">{stock.symbol}</span>
                      <Sparkline positive={false} />
                      <div style={{ textAlign: 'right' }}>
                        <div className="t-gl-change down">{stock.changePercent.toFixed(2)}%</div>
                        <div className="t-gl-price">${stock.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {losers.length === 0 && (
                    <div style={{ padding: '1.25rem', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#475569' }}>No losers today</div>
                  )}
                </div>
              </div>

              {/* Full table */}
              <div className="t-table-panel">
                <div className="t-table-header">
                  <span className="t-table-title">Complete Watchlist</span>
                  <span className="t-table-count">{stocks.length} symbols</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="t-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Price</th>
                        <th>Change</th>
                        <th>Change %</th>
                        <th>Volume</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map(stock => {
                        const up = stock.changePercent >= 0;
                        return (
                          <tr key={stock.symbol}>
                            <td className="col-sym">{stock.symbol}</td>
                            <td className="col-num">${stock.price.toFixed(2)}</td>
                            <td className={`col-change ${up ? 'up' : 'down'}`}>
                              {up ? '+' : ''}{stock.change.toFixed(2)}
                            </td>
                            <td className="col-action">
                              <span className={up ? 't-badge-up' : 't-badge-down'}>
                                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                {up ? '+' : ''}{stock.changePercent.toFixed(2)}%
                              </span>
                            </td>
                            <td className="col-vol">
                              {Number(stock.volume).toLocaleString() || stock.volume}
                            </td>
                            <td className="col-action">
                              {watchlist.length > 1 && (
                                <button className="t-remove-btn" onClick={() => handleRemoveStock(stock.symbol)}>
                                  <X size={10} />
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}