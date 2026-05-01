import os
from dotenv import load_dotenv

load_dotenv()

HF_API_KEYS = [k.strip() for k in os.getenv("HF_API_KEYS", "").split(",") if k.strip()]
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")