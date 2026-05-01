import re
import json
import yfinance as yf
from functools import lru_cache

SYMBOL_FILE = "data/symbols.json"


# 🔹 Load stored symbols
def load_symbols():
    try:
        with open(SYMBOL_FILE, "r") as f:
            return json.load(f)
    except:
        return {}


# 🔹 Save new symbol
def save_symbol(name, ticker):
    data = load_symbols()
    data[name] = ticker

    with open(SYMBOL_FILE, "w") as f:
        json.dump(data, f, indent=2)


# 🔹 Cache lookup (important)
@lru_cache(maxsize=100)
def try_yfinance_lookup(name):
    try:
        ticker = yf.Ticker(name)
        data = ticker.history(period="1d")

        if not data.empty:
            return name
    except:
        pass
    return None


def extract_symbol(query):
    query = query.upper()
    stored_symbols = load_symbols()

    # 🔥 1. Check stored symbols (learned memory)
    for key in stored_symbols:
        if key in query:
            return stored_symbols[key]

    # 🔥 2. Extract possible words
    words = re.findall(r'\b[A-Z]{2,15}\b', query)

    for word in words:

        # Try US ticker
        if try_yfinance_lookup(word):
            save_symbol(word, word)   # 🔥 learn it
            return word

        # Try NSE ticker
        if try_yfinance_lookup(word + ".NS"):
            save_symbol(word, word + ".NS" )   # 🔥 learn it
            return word + ".NS"

    # 🔥 fallback
    return "AAPL"