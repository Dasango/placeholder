-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- n8n_vectors stores the chunked documents with their embeddings.
-- Dimension 768 matches the nomic-embed-text model used by the RAG workflow.
CREATE TABLE IF NOT EXISTS n8n_vectors (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(768)
);

-- HNSW index for fast cosine similarity searches
CREATE INDEX IF NOT EXISTS n8n_vectors_embedding_idx ON n8n_vectors USING hnsw (embedding vector_cosine_ops);