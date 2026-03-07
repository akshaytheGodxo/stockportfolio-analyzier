import streamlit as st
from src.data_loader import get_stock_data
from src.technical_indicators import add_indicators
from src.candlestick_patterns import detect_patterns
from src.signal_engine import evaluate_signals
from src.fundamental import get_fundamentals
from src.news_fetcher import get_news

st.title("📊 AI Stock Analyzer")

ticker = st.text_input("Enter Stock Symbol", "RELIANCE")

if st.button("Analyze"):

    df = get_stock_data(ticker)

    if df.empty:
        st.error("Stock data not found.")
        st.stop()

    df = add_indicators(df)

    patterns = detect_patterns(df)

    stats = evaluate_signals(patterns)

    fundamentals = get_fundamentals(ticker)

    news = get_news(ticker)

    st.subheader("Candlestick Signals")

    if len(patterns) == 0:
        st.warning("No candlestick patterns detected.")
    else:
        cols = st.columns(3)
        for i, (name, signal) in enumerate(patterns.items()):
            cols[i % 3].metric(name, signal)

    st.subheader("Overall Market Signal")

    st.metric(
        label="Decision",
        value=stats["decision"],
        delta=f'{stats["confidence"]}% bullish'
    )

    st.write("Bullish:", stats["bullish"])
    st.write("Bearish:", stats["bearish"])
    st.write("Neutral:", stats["neutral"])

    st.subheader("Fundamentals")

    col1, col2, col3 = st.columns(3)

    col1.metric("P/E Ratio", fundamentals.get("PE Ratio"))
    col2.metric("Market Cap", fundamentals.get("Market Cap"))
    col3.metric("EPS", fundamentals.get("EPS"))

    st.subheader("Technical Indicators")

    if not df.empty:

        col1, col2, col3 = st.columns(3)

        if "RSI" in df.columns:
            col1.metric("RSI", round(df["RSI"].iloc[-1],2))

        if "MACD" in df.columns:
            col2.metric("MACD", round(df["MACD"].iloc[-1],2))

        if "EMA50" in df.columns:
            col3.metric("EMA50", round(df["EMA50"].iloc[-1],2))

    st.subheader("Latest News")

    for n in news:
        st.write("•", n)