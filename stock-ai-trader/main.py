import json
from fastapi import FastAPI
from cachetools import TTLCache

from src.data_loader import get_stock_data
from src.technical_indicators import add_indicators
from src.candlestick_patterns import detect_patterns
from src.signal_engine import evaluate_signals
from src.fundamental import get_fundamentals
from src.news_fetcher import get_news

app = FastAPI()

# Cache: stores 100 stocks for 5 minutes
cache = TTLCache(maxsize=100, ttl=300)


@app.get("/")
async def home():
    return {"message": "Stock AI API running 🚀"}


@app.get("/analyze/{ticker}")
async def analyze_stock(ticker: str):

    ticker = ticker.upper()

    # 🔥 Check cache first
    if ticker in cache:
        return {
            "source": "cache",
            "data": cache[ticker]
        }

    # ------------------------
    # Fetch data
    # ------------------------
    df = get_stock_data(ticker)

    if df.empty:
        return {"error": "Stock data not found"}

    df = add_indicators(df)

    patterns = detect_patterns(df)
    stats = evaluate_signals(patterns)
    fundamentals = get_fundamentals(ticker)
    news = get_news(ticker)

    # ------------------------
    # Technical indicators
    # ------------------------
    indicators = {}

    if "RSI" in df.columns:
        indicators["RSI"] = float(df["RSI"].iloc[-1])

    if "MACD" in df.columns:
        indicators["MACD"] = float(df["MACD"].iloc[-1])

    if "EMA50" in df.columns:
        indicators["EMA50"] = float(df["EMA50"].iloc[-1])

    response = {
        "ticker": ticker,
        "candlestick_patterns": patterns,
        "overall_signal": stats,
        "technical_indicators": indicators,
        "fundamentals": fundamentals,
        "news": news
    }

    # 🔥 Store in cache
    cache[ticker] = response

    # Optional: save JSON file
    with open(f"{ticker}.json", "w") as f:
        json.dump(response, f, indent=4)

    return {
        "source": "fresh",
        "data": response
    }