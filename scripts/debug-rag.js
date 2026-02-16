
const { processDocument } = require('../lib/rag');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

async function testRag() {
    console.log('Starting RAG Debug...');

    // Mock buffer (Text file)
    const text = "This is a test document for the RAG system. It contains some simple text to verify embedding generation and database insertion.";
    const buffer = Buffer.from(text);

    try {
        const docId = uuidv4();
        console.log(`Processing Test Doc ID: ${docId}`);

        // Test Processing
        // We'll use a dummy filename and text/plain type
        const count = await processDocument(buffer, 'text/plain', 'test_debug.txt', docId);

        console.log(`Success! Generated ${count} chunks.`);
    } catch (error) {
        console.error('RAG Processing Failed:', error);
    }
}

testRag();
