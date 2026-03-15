import { Stock, StockDetail  }  from "@/types"

// Mock stock data - replace with real API later
export const MOCK_STOCKS: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    volume: 45234567,
    marketCap: 2800000000000,
    high52w: 198.23,
    low52w: 164.08,
    pe: 28.5,
    sector: "Technology",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.56,
    change: -1.23,
    changePercent: -0.85,
    volume: 23456789,
    marketCap: 1800000000000,
    high52w: 155.78,
    low52w: 120.45,
    pe: 24.2,
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.91,
    change: 5.67,
    changePercent: 1.52,
    volume: 34567890,
    marketCap: 2800000000000,
    high52w: 420.82,
    low52w: 309.45,
    pe: 32.1,
    sector: "Technology",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 151.23,
    change: 0.89,
    changePercent: 0.59,
    volume: 45678901,
    marketCap: 1600000000000,
    high52w: 180.96,
    low52w: 101.15,
    pe: 48.3,
    sector: "Consumer Cyclical",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 248.42,
    change: -3.21,
    changePercent: -1.28,
    volume: 78901234,
    marketCap: 790000000000,
    high52w: 299.29,
    low52w: 138.25,
    pe: 65.2,
    sector: "Consumer Cyclical",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 485.12,
    change: 8.45,
    changePercent: 1.77,
    volume: 23456789,
    marketCap: 1200000000000,
    high52w: 531.49,
    low52w: 288.35,
    pe: 26.8,
    sector: "Technology",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 875.34,
    change: 23.45,
    changePercent: 2.75,
    volume: 56789012,
    marketCap: 2200000000000,
    high52w: 974.00,
    low52w: 385.50,
    pe: 68.4,
    sector: "Technology",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 195.67,
    change: 1.23,
    changePercent: 0.63,
    volume: 12345678,
    marketCap: 570000000000,
    high52w: 205.88,
    low52w: 135.19,
    pe: 11.2,
    sector: "Financial Services",
  },
]

export const getMockStockDetail = (symbol: string): StockDetail | null => {
  const stock = MOCK_STOCKS.find((s) => s.symbol === symbol)
  if (!stock) return null

  return {
    ...stock,
    description: `${stock.name} is a leading company in the ${stock.sector} sector.`,
    website: `https://www.${stock.symbol.toLowerCase()}.com`,
    employees: Math.floor(Math.random() * 200000) + 10000,
    headquarters: "United States",
    dividendYield: stock.sector === "Financial Services" ? 2.5 : 0.5,
    earningsPerShare: stock.price / (stock.pe || 20),
  }
}

export const searchStocks = (query: string): Stock[] => {
  if (!query.trim()) return MOCK_STOCKS
  const lowerQuery = query.toLowerCase()
  return MOCK_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  )
}
