import requests
from app.config import NEWS_API_KEY

def get_news(query):
    try:
        url = f"https://newsapi.org/v2/everything?q={query}&apiKey={NEWS_API_KEY}"
        response = requests.get(url).json()

        articles = []
        for a in response.get("articles", [])[:5]:  
            articles.append({
                "title": a["title"],
                "description": a.get("description", ""),
                "content": a.get("content", "")
            })

        return articles
    except Exception as e:
        return [f"Error fetching news: {str(e)}"]   