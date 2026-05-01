import os
import pickle
from faiss import IndexFlatL2
import numpy as np

from app.rag.embeddings import get_embeddings

VECTOR_STORE_PATH = "data/vector_store"
DOCUMENTS_PATH = "data/documents.pkl"

class VectorStore:
    def __init__(self):
        self.index = None
        self.documents = []
        self._load()

    def _load(self):
        """Load existing vector store if available."""
        if os.path.exists(VECTOR_STORE_PATH) and os.path.exists(DOCUMENTS_PATH):
            try:
                self.index = np.load(VECTOR_STORE_PATH)
                with open(DOCUMENTS_PATH, 'rb') as f:
                    self.documents = pickle.load(f)
            except:
                self.index = None
                self.documents = []

    def add_documents(self, texts: list[str], metadata: list = None):
        """Add documents to the vector store."""
        if not texts:
            return

        embeddings = get_embeddings(texts)
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        self.index = IndexFlatL2(dimension)
        self.index.add(embeddings.astype('float32'))

        # Store documents with metadata
        self.documents = texts
        self._save()

    def _save(self):
        """Save vector store to disk."""
        os.makedirs("data", exist_ok=True)
        if self.index is not None:
            np.save(VECTOR_STORE_PATH, self.index)
        with open(DOCUMENTS_PATH, 'wb') as f:
            pickle.dump(self.documents, f)

    def search(self, query: str, k: int = 5) -> list:
        """Search for similar documents."""
        if self.index is None or not self.documents:
            return []

        from app.rag.embeddings import get_embeddings_model
        query_embedding = get_embeddings_model().encode([query])
        
        distances, indices = self.index.search(query_embedding.astype('float32'), k)
        
        results = []
        for idx in indices[0]:
            if idx < len(self.documents):
                results.append(self.documents[idx])
        return results

# Global vector store instance
_vector_store = None

def get_vector_store():
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store