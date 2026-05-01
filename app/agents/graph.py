from langgraph.graph import StateGraph
from typing import TypedDict

from app.tools.stock_api import get_stock_data
from app.tools.news_api import get_news
from app.services.llm import generate_response
from app.utils.helpers import extract_symbol


# 🔹 State Definition
class AgentState(TypedDict):
    query: str
    context: str
    stock_data: dict
    news: str
    response: str
    symbol: str


# 🔹 Nodes

def retrieve(state):
    symbol = extract_symbol(state["query"])

    context = f"""
Basic stock analysis principles:
- Stock prices depend on earnings, demand, and news
- Positive news → bullish sentiment
- Negative news → bearish sentiment
- Volume indicates strength of movement

Stock: {symbol}
"""

    return {"context": context}


def fetch_stock(state):
    symbol = extract_symbol(state["query"])
    data = get_stock_data(symbol)

    return {
        "stock_data": data,
        "symbol": symbol  # 🔥 pass symbol forward
    }


def fetch_news(state):
    symbol = state.get("symbol", "")
    query = f"{symbol} stock market news"

    news_list = get_news(query)

    news_text = ""
    for n in news_list:
        news_text += f"""
Title: {n.get('title')}
Description: {n.get('description')}
Content: {n.get('content')}
---
"""

    return {"news": news_text}


def generate(state):
    prompt = f"""
You are an expert stock market analyst AI.

Analyze ONLY the provided data.

Stock:
{state.get('symbol')}

Context:
{state.get('context')}

Stock Data:
{state.get('stock_data')}

Recent News:
{state.get('news')}

User Question:
{state['query']}

Instructions:
- Identify relevant news
- Ignore irrelevant information
- Explain how news impacts stock price
- Use stock data in reasoning

Output format:
1. Summary
2. Key Factors (bullet points)
3. Risk Level
4. Final Decision (Buy / Hold / Sell with reason)
"""

    response = generate_response(prompt)
    return {"response": response}


# 🔹 Graph

graph = StateGraph(AgentState)

graph.add_node("retrieve", retrieve)
graph.add_node("fetch_stock", fetch_stock)
graph.add_node("fetch_news", fetch_news)
graph.add_node("generate", generate)

graph.set_entry_point("retrieve")

graph.add_edge("retrieve", "fetch_stock")
graph.add_edge("fetch_stock", "fetch_news")
graph.add_edge("fetch_news", "generate")

app_graph = graph.compile()