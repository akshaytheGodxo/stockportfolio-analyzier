import yfinance as yf
import pandas as pd

def get_stock_data(symbol):

    symbol = symbol.upper().strip()

    if not symbol.endswith(".NS"):
        symbol = symbol + ".NS"

    try:
        df = yf.download(
            symbol,
            period="6mo",
            interval="1d",
            progress=False
        )
    except Exception:
        return pd.DataFrame()

    if df.empty:
        return pd.DataFrame()

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df[['Open','High','Low','Close','Volume']]

    df = df.dropna()

    return df