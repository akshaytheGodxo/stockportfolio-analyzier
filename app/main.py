from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.agents.graph import app_graph

app = FastAPI()

class Query(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "Stock RAG Agent Running 🚀"}

@app.post("/chat")
def chat(q: Query):
    result = app_graph.invoke({"query": q.question})

    if not result.get("response"):
        raise HTTPException(status_code=500, detail="LLM failed")

    return {"answer": result["response"]}