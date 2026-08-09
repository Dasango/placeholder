-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for n8n vectors (dimension 1024 for BAAI bge-m3 on NVIDIA Build)
CREATE TABLE IF NOT EXISTS n8n_vectors (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1024) -- 1024 is the dimension of baai/bge-m3
);

-- Create HNSW index for performance on similarity searches
CREATE INDEX IF NOT EXISTS n8n_vectors_embedding_idx ON n8n_vectors USING hnsw (embedding vector_cosine_ops);
