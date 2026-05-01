from sentence_transformers import SentenceTransformer

# Use local embeddings model (free, no API calls)
_model = None

def get_embeddings_model():
    global _model
    if _model is None:
        # Using a lightweight, high-quality embeddings model
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def get_embeddings(texts: list[str]) -> list:
    """Generate embeddings for a list of texts."""
    model = get_embeddings_model()
    return model.encode(texts)

def get_query_embedding(query: str) -> list:
    """Generate embedding for a single query."""
    model = get_embeddings_model()
    return model.encode([query])[0]