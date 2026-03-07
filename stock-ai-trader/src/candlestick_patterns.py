import talib
import numpy as np

def detect_patterns(df):
    if df.empty or len(df) < 5:
        return {}
    open_ = df['Open'].astype(float).values
    high_ = df['High'].astype(float).values
    low_ = df['Low'].astype(float).values
    close_ = df['Close'].astype(float).values

    patterns = {
        "Hammer": talib.CDLHAMMER,
        "Inverted Hammer": talib.CDLINVERTEDHAMMER,
        "Engulfing": talib.CDLENGULFING,
        "Doji": talib.CDLDOJI,
        "Morning Star": talib.CDLMORNINGSTAR,
        "Evening Star": talib.CDLEVENINGSTAR,
        "Shooting Star": talib.CDLSHOOTINGSTAR,
        "Harami": talib.CDLHARAMI,
        "Harami Cross": talib.CDLHARAMICROSS,
        "Piercing Line": talib.CDLPIERCING,
        "Dark Cloud Cover": talib.CDLDARKCLOUDCOVER,
        "Three White Soldiers": talib.CDL3WHITESOLDIERS,
        "Three Black Crows": talib.CDL3BLACKCROWS,
        "Spinning Top": talib.CDLSPINNINGTOP,
        "Long Legged Doji": talib.CDLLONGLEGGEDDOJI,
        "Dragonfly Doji": talib.CDLDRAGONFLYDOJI,
        "Gravestone Doji": talib.CDLGRAVESTONEDOJI,
        "Marubozu": talib.CDLMARUBOZU,
        "Tasuki Gap": talib.CDLTASUKIGAP,
        "Upside Gap Two Crows": talib.CDLUPSIDEGAP2CROWS
    }

    signals = {}

    for name, func in patterns.items():

        result = func(open_, high_, low_, close_)

        if len(result) == 0:
            signals[name] = "No Data"
            continue

        last = result[-1]

        if last > 0:
            signals[name] = "Bullish"
        elif last < 0:
            signals[name] = "Bearish"
        else:
            signals[name] = "Neutral"

    return signals