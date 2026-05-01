"""Ingestion script to populate vector store with stock knowledge."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.vector_store import get_vector_store

# Stock knowledge base - comprehensive financial context
STOCK_KNOWLEDGE = [
    # Basic Analysis Concepts
    """P/E Ratio (Price-to-Earnings): Measures stock price relative to earnings. 
    A high P/E suggests growth expectations; low P/E may indicate undervaluation.
    Average P/E ranges: Technology 20-40, Financials 10-15, Utilities 15-20.""",
    
    """EPS (Earnings Per Share): Net income divided by shares outstanding.
    Higher EPS indicates greater profitability. YoY EPS growth shows 
    company's ability to increase profits. Positive EPS trend is bullish.""",
    
    """RSI (Relative Strength Index): Momentum oscillator 0-100.
    RSI >70 = overbought (potential sell), RSI <30 = oversold (potential buy).
    RSI 50 = neutral. Best used with other indicators.""",
    
    """MACD (Moving Average Convergence Divergence): Trend-following momentum.
    Signal line crossover: MACD above signal = bullish, below = bearish.
    Zero line crossover indicates trend changes. Divergence from price = reversal signal.""",
    
    """Moving Averages: SMA and EMA smooth price data.
    50-day MA = short-term trend, 200-day MA = long-term trend.
    Golden Cross: 50-day crosses above 200-day = bullish.
    Death Cross: 50-day crosses below 200-day = bearish.""",
    
    # Fundamental Analysis
    """Revenue Growth: Year-over-year revenue increase shows business expansion.
    Consistent 15%+ revenue growth indicates strong market position.
    Compare revenue growth to industry average for context.""",
    
    """Debt-to-Equity Ratio: Measures financial leverage.
    D/E < 1 = low risk, 1-2 = moderate, > 2 = high leverage.
    Industry varies: Banks 2-5 is normal, Tech < 0.5 preferred.""",
    
    """Gross Margin: Revenue minus COGS divided by revenue.
    Higher gross margin = pricing power and operational efficiency.
    Improving margins over time is a positive signal.""",
    
    """Free Cash Flow: Cash from operations minus capital expenditures.
    Positive FCF indicates ability to pay dividends, repurchase shares,
    or invest in growth without external funding.""",
    
    # Technical Analysis Patterns
    """Support and Resistance: Price levels where buying/selling emerges.
    Support: price floor where buyers accumulate. Resistance: price ceiling.
    Breakout above resistance = bullish, breakdown below = bearish.""",
    
    """Volume Analysis: Trading volume confirms price movements.
    High volume on price increase = strong bullish signal.
    Low volume on price move = weak signal, potential reversal.""",
    
    """Chart Patterns: Head and Shoulders = reversal (bearish top, bullish bottom).
    Double Top/Bottom = reversal. Cup and Handle = continuation.
    Triangle patterns = consolidation before breakout.""",
    
    # Stock Evaluation
    """Value Investing: Focus on low P/E, low P/B, high dividend yield.
    Look for companies with strong fundamentals trading below intrinsic value.
    Margin of Safety: Buy at significant discount to calculated value.""",
    
    """Growth Investing: Focus on revenue and earnings growth rates.
    PEG ratio < 1 = undervalued growth. Look for 20%+ revenue growth.
    High P/E acceptable if growth rate justifies it.""",
    
    """Dividend Investing: Focus on dividend yield and payout ratio.
    Yield > 3% = attractive. Payout ratio < 60% = sustainable.
    Dividend growth over 5+ years indicates financial health.""",
    
    # Risk Management
    """Position Sizing: Never allocate more than 2-5% to single stock.
    Diversify across sectors to reduce portfolio volatility.
    Stop-loss: Set at 7-8% below purchase price for risk management.""",
    
    """Market Cycle Recognition: Bull markets follow bear markets.
    Early cycle: defensive stocks lead. Mid-cycle: cyclical stocks rise.
    Late cycle: value stocks outperform. Monitor Fed policy and yield curve.""",
    
    # Sector Analysis
    """Technology Sector: High growth, high P/E, innovation-driven.
    Focus on earnings quality, competitive moat, and management.
    Semiconductors are cyclical - watch inventory levels.""",
    
    """Financial Sector: Sensitive to interest rates and credit cycles.
    Banks benefit from rate spreads. Insurance companies benefit from investments.
    Watch for loan growth and asset quality metrics.""",
    
    """Healthcare Sector: Defensive with aging population tailwind.
    Pharmaceuticals have patent cliffs. Medical devices have steady demand.
    FDA approvals are key catalysts. Biotech is high-risk/high-reward.""",
    
    """Energy Sector: Highly cyclical, tied to oil prices.
    Oil $70-80/bbl = sweet spot for producers. Watch inventory data.
    ESG pressures are reshaping the sector. Renewable energy growing.""",
]

def ingest_knowledge():
    """Ingest stock knowledge into vector store."""
    print("📚 Ingesting stock knowledge into vector store...")
    
    vector_store = get_vector_store()
    vector_store.add_documents(STOCK_KNOWLEDGE)
    
    print(f"✅ Added {len(STOCK_KNOWLEDGE)} documents to vector store")
    print(f"📊 Vector store now contains {len(vector_store.documents)} documents")

if __name__ == "__main__":
    ingest_knowledge()