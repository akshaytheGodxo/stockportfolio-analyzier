import pandas_ta as ta

def add_indicators(df):

    if df.empty:
        return df

    df["RSI"] = ta.rsi(df["Close"], length=14)

    macd = ta.macd(df["Close"])
    if macd is not None:
        df["MACD"] = macd["MACD_12_26_9"]

    df["EMA50"] = ta.ema(df["Close"], length=50)

    df = df.dropna()

    return df