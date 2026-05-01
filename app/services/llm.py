import os
import random
import time
from openai import OpenAI
from app.config import HF_API_KEYS

BASE_URL = "https://router.huggingface.co/v1"
MODEL_NAME = "moonshotai/Kimi-K2.6"


def generate_response(prompt):
    # 🔥 Shuffle keys to distribute load across Render instances
    keys = HF_API_KEYS.copy()
    random.shuffle(keys)

    for key in keys:
        for attempt in range(2):  # retry twice per key
            try:
                client = OpenAI(
                    base_url=BASE_URL,
                    api_key=key
                )

                completion = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                    {
                        "role": "system",
                        "content": "You are an expert stock market analyst."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                    temperature=0.7
                )

                return completion.choices[0].message.content

            except Exception as e:
                error_msg = str(e)

                # ⚠️ Rate limit or quota issue → switch key
                if "429" in error_msg or "rate" in error_msg.lower():
                    print("[RATE LIMIT] Switching key...")
                    break

                # ⚠️ Other errors → retry
                print(f"[ERROR] {error_msg}")
                time.sleep(1)

    return "All Hugging Face Router API keys failed."