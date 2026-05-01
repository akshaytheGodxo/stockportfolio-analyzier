import yfinance as yf

def get_stock_data(symbol):
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period="1d")

        if data.empty:
            return {"error": "No data found"}

        return {
            "symbol": symbol,
            "price": float(data["Close"].iloc[-1]),
            "volume": int(data["Volume"].iloc[-1])
        }
    except Exception as e:
        return {"error": str(e)}