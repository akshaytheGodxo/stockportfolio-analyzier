// Stock and market data types
export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high52w?: number
  low52w?: number
  pe?: number
  sector?: string
}

export interface StockDetail extends Stock {
  description?: string
  website?: string
  employees?: number
  headquarters?: string
  dividendYield?: number
  earningsPerShare?: number
}

export interface WatchlistItem {
  id: string
  userId: string
  symbol: string
  addedAt: Date
}

export interface PortfolioPosition {
  id: string
  userId: string
  symbol: string
  shares: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
}

export interface Alert {
  id: string
  userId: string
  symbol: string
  type: "price_above" | "price_below" | "percent_change"
  targetValue: number
  isActive: boolean
  createdAt: Date
  triggeredAt?: Date
}

export interface Transaction {
  id: string
  userId: string
  symbol: string
  type: "buy" | "sell"
  shares: number
  price: number
  total: number
  timestamp: Date
}

// Subscription types
export type SubscriptionTier = "free" | "pro" | "premium"

export interface SubscriptionFeatures {
  maxWatchlistItems: number
  maxPortfolioPositions: number
  maxAlerts: number
  realTimeData: boolean
  advancedCharts: boolean
  paperTrading: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

export interface UserSubscription {
  userId: string
  tier: SubscriptionTier
  features: SubscriptionFeatures
  expiresAt?: Date
}

// Feature gating
export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxWatchlistItems: 5,
    maxPortfolioPositions: 3,
    maxAlerts: 2,
    realTimeData: false,
    advancedCharts: false,
    paperTrading: true,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    maxWatchlistItems: 50,
    maxPortfolioPositions: 100,
    maxAlerts: 20,
    realTimeData: true,
    advancedCharts: true,
    paperTrading: true,
    apiAccess: false,
    prioritySupport: false,
  },
  premium: {
    maxWatchlistItems: -1, // unlimited
    maxPortfolioPositions: -1,
    maxAlerts: -1,
    realTimeData: true,
    advancedCharts: true,
    paperTrading: true,
    apiAccess: true,
    prioritySupport: true,
  },
}
