import feedparser

def get_news(ticker):

    symbol = ticker.split(".")[0]

    url = f"https://news.google.com/rss/search?q={symbol}+stock"

    feed = feedparser.parse(url)

    news = []

    for entry in feed.entries[:5]:
        news.append(entry.title)

    return news