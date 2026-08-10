import os
import psycopg2
from pgvector.psycopg2 import register_vector
import numpy as np

# Database URL
DB_URI = os.getenv("DATABASE_URL", "postgresql://astraq:password@localhost:5432/astraq_db")

def test_pgvector_similarity():
    print("--- 1. Connecting to Postgres database ---")
    conn = psycopg2.connect(DB_URI)
    conn.autocommit = True
    cursor = conn.cursor()

    # 2. Register vector extension for psycopg2
    register_vector(conn)

    print("--- 2. Ensuring pgvector extension is enabled ---")
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    print("--- 3. Creating test_document_embeddings table ---")
    cursor.execute("DROP TABLE IF EXISTS test_document_embeddings;")
    cursor.execute("""
        CREATE TABLE test_document_embeddings (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            embedding vector(3) -- 3-dimensional vector for quick demonstration
        );
    """)

    print("--- 4. Inserting sample document embeddings ---")
    documents = [
        ("Artificial Intelligence and Machine Learning in Software QA", [0.9, 0.1, 0.1]),
        ("Clinical Research & HIPAA Compliance Standards for Digital Health", [0.1, 0.8, 0.2]),
        ("Fintech Payment Gateways and PCI-DSS Security Protocols", [0.2, 0.1, 0.9])
    ]

    for content, vec in documents:
        cursor.execute(
            "INSERT INTO test_document_embeddings (content, embedding) VALUES (%s, %s);",
            (content, np.array(vec))
        )
    print(f"Inserted {len(documents)} sample documents into PostgreSQL vector table.")

    print("\n--- 5. Performing Cosine Similarity Search for query: 'Medical and Healthcare' ---")
    # Query vector close to Healthcare ([0.1, 0.9, 0.1])
    query_vector = np.array([0.1, 0.9, 0.1])
    
    # Cosine distance operator is <=> (1 - cosine_similarity)
    cursor.execute("""
        SELECT id, content, embedding <=> %s AS distance
        FROM test_document_embeddings
        ORDER BY distance ASC
        LIMIT 3;
    """, (query_vector,))

    results = cursor.fetchall()
    for row in results:
        doc_id, content, distance = row
        similarity = 1.0 - distance
        print(f"  [ID {doc_id}] Cosine Similarity: {similarity:.4f} | Document: '{content}'")

    cursor.close()
    conn.close()
    print("\n✅ PGVECTOR TEST COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    test_pgvector_similarity()
