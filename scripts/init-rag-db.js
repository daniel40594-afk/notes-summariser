const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initDB() {
    const client = await pool.connect();
    try {
        console.log('Initializing RAG Database Tables...');

        // Documents Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        filename VARCHAR NOT NULL,
        file_type VARCHAR,
        file_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Created documents table.');

        // Document Chunks Table (Vector Store)
        // We store embedding as JSONB array for simplicity/compatibility
        await client.query(`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
        content TEXT,
        embedding JSONB, 
        metadata JSONB
      );
    `);
        console.log('Created document_chunks table.');

        // Chat Sessions Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        title VARCHAR DEFAULT 'New Chat',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Created chat_sessions table.');

        // Chat Messages Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role VARCHAR NOT NULL, -- 'user' or 'assistant'
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('Created chat_messages table.');

        console.log('RAG Tables initialized successfully.');
    } catch (err) {
        console.error('Error initializing tables:', err);
    } finally {
        client.release();
        pool.end();
    }
}

initDB();
