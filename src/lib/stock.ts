const API_KEY = process.env.FINNHUB_KEY

const symbols = ["AAPL","MSFT","TSLA","NVDA","AMZN","META"]

export async function getStocks() {
  const stocks = await Promise.all(
    symbols.map(async (symbol) => {
      const quoteRes = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`,
        { next: { revalidate: 60 } }
      )

      const profileRes = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`,
        { next: { revalidate: 86400 } }
      )

      const quote = await quoteRes.json()
      const profile = await profileRes.json()

      return {
        symbol,
        name: profile.name,
        price: quote.c,
        changePercent: quote.dp,
        volume: quote.v ?? 0,
        marketCap: profile.marketCapitalization
      }
    })
  )

  return stocks
}