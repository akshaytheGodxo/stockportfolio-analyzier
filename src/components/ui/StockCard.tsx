"use client";
import { Button } from "./button";
import { PlusCircleIcon } from "lucide-react";
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


const UP_FG = "oklch(0.55 0.18 145)";
const UP_BG = "oklch(0.94 0.07 145)";
const DN_FG = "oklch(0.55 0.22 27)";
const DN_BG = "oklch(0.95 0.06 27)";

function formatMarketCap(n: number) {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  return "$" + (n / 1e6).toFixed(0) + "M";
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



function formatVolume(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n.toString();
}

export function StockCard({ q, }: { q: QuoteData, }) {
  return (
    <div className="group relative flex flex-col gap-3 p-5 border border-border bg-card text-card-foreground hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex w-full flex-row items-start justify-between">
        <div className="">
          <span className="font-mono text-xs font-semibold tracking-widest px-2 py-0.5 bg-muted text-muted-foreground">
            {q.ticker}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground leading-tight line-clamp-1 max-w-[160px]">
          {q.name}
        </p>

        <div className="flex flex-row justify-between">
          <ChangeChip pct={q.changePercent} />
          <Button className="cursor-pointer" >
            <PlusCircleIcon />
          </Button>
        </div>
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