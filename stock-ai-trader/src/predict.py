import joblib
from src.data_loader import fetch_data
from src.feature_engineering import add_indicators
from src.candlestick_patterns import detect_patterns

model = joblib.load("models/trading_model.pkl")

def get_predictions():

    df = fetch_data()

    pattern_signals = detect_patterns(df)

    df = add_indicators(df)

    latest = df.iloc[-1:]

    pred = model.predict(latest)[0]
    prob = model.predict_proba(latest)[0][1]

    signal = "BUY" if pred == 1 else "SELL"

    return signal, prob, pattern_signals