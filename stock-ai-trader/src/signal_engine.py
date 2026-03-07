def evaluate_signals(patterns):

    if not patterns:
        return {
            "decision": "NO SIGNAL",
            "confidence": 0,
            "bullish": 0,
            "bearish": 0,
            "neutral": 0
        }

    bullish = list(patterns.values()).count("Bullish")
    bearish = list(patterns.values()).count("Bearish")
    neutral = list(patterns.values()).count("Neutral")

    total = bullish + bearish + neutral

    if total == 0:
        return {
            "decision": "NO SIGNAL",
            "confidence": 0,
            "bullish": 0,
            "bearish": 0,
            "neutral": 0
        }

    confidence = round((bullish / total) * 100, 2)

    if bullish > bearish:
        decision = "BUY"
    elif bearish > bullish:
        decision = "SELL"
    else:
        decision = "HOLD"

    return {
        "decision": decision,
        "confidence": confidence,
        "bullish": bullish,
        "bearish": bearish,
        "neutral": neutral
    }