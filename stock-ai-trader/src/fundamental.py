import yfinance as yf

def get_fundamentals(symbol):

    symbol = symbol.upper().strip()

    if not symbol.endswith(".NS"):
        symbol = symbol + ".NS"

    try:
        ticker = yf.Ticker(symbol)

        info = ticker.info

    except Exception:
        return {
            "PE Ratio": "N/A",
            "Market Cap": "N/A",
            "EPS": "N/A"
        }

    fundamentals = {
        "PE Ratio": info.get("trailingPE", "N/A"),
        "Market Cap": info.get("marketCap", "N/A"),
        "EPS": info.get("trailingEps", "N/A")
    }

    return fundamentals