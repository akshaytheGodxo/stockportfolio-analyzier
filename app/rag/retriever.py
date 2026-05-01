from app.rag.vector_store import get_vector_store

def retrieve_docs(query: str, k: int = 5) -> str:
    """Retrieve relevant documents from vector store."""
    vector_store = get_vector_store()
    results = vector_store.search(query, k=k)
    
    if not results:
        # Fallback context if no documents in vector store
        return ""
    
    return "\n\n".join(results)