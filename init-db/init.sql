-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for n8n vectors
CREATE TABLE IF NOT EXISTS n8n_vectors (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536) -- Standard dimension for OpenAI embeddings (e.g. text-embedding-3-small)
);

-- Create HNSW index for performance on similarity searches
CREATE INDEX IF NOT EXISTS n8n_vectors_embedding_idx ON n8n_vectors USING hnsw (embedding vector_cosine_ops);
