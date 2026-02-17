import { pipeline } from '@xenova/transformers';
import { v4 as uuidv4 } from 'uuid';
import computeCosineSimilarity from 'compute-cosine-similarity';
import pool from '@/lib/db';

// --- Types ---
export interface DocumentChunk {
    id: string;
    documentId: string;
    content: string;
    embedding: number[];
    metadata: {
        filename: string;
        page?: number;
    };
}

export interface SearchResult {
    chunk: DocumentChunk;
    score: number;
}

// --- Configuration ---
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
let embeddingPipeline: any = null;

// --- Embedding Service ---
export const getEmbeddingPipeline = async () => {
    if (!embeddingPipeline) {
        console.log('[RAG] Loading embedding model...');
        embeddingPipeline = await pipeline('feature-extraction', EMBEDDING_MODEL, {
            quantized: true,
        });
        console.log('[RAG] Model loaded.');
    }
    return embeddingPipeline;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    const pipe = await getEmbeddingPipeline();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
};

// --- Text Extraction ---
export const extractText = async (fileBuffer: Buffer, fileType: string, filename: string): Promise<string> => {
    console.log(`[RAG] Extracting text from ${filename} (${fileType})`);

    if (fileType === 'application/pdf') {
        // Lazy load pdf-parse
        // 1. Polyfill for standard PDF.js in Node
        if (!global.DOMMatrix) {
            // @ts-ignore
            global.DOMMatrix = class DOMMatrix {
                a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
                constructor() { }
            };
        }

        // @ts-ignore
        const pdfModule = require('pdf-parse');
        const pdf = pdfModule.PDFParse || (typeof pdfModule === 'function' ? pdfModule : pdfModule.default);

        try {
            let data;
            try {
                // 1. Try as function
                data = await pdf(fileBuffer);
            } catch (e: any) {
                if (e.message?.includes("Class constructors")) {
                    console.log('[RAG] PDF Parse requires new, instantiating...');
                    // 2. Try as class
                    // @ts-ignore
                    data = await new pdf(fileBuffer);
                } else {
                    throw e;
                }
            }

            if (data && data.text && data.text.trim().length > 50) {
                return data.text;
            } else {
                console.log('[RAG] PDF has little text. Attempting OCR...');
                throw new Error('Scanned PDF detected. Please upload as images for OCR or use a text-based PDF.');
            }
        } catch (e) {
            console.error('PDF Parse Error:', e);
            throw new Error('Failed to parse PDF.');
        }
    }
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // docx
        // Lazy load mammoth
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
    }
    else if (fileType === 'text/plain') {
        return fileBuffer.toString('utf-8');
    }
    else if (fileType.startsWith('image/')) {
        // Lazy load tesseract
        const Tesseract = require('tesseract.js');
        console.log('[RAG] Running OCR on image...');
        const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
        return text;
    }

    throw new Error(`Unsupported file type: ${fileType}`);
};

// --- Chunking ---
export const chunkText = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim().length > 0) {
            chunks.push(chunk);
        }
    }
    return chunks;
};

// --- Ingestion ---
export const processDocument = async (
    fileBuffer: Buffer,
    fileType: string,
    filename: string,
    documentId: string
): Promise<number> => {
    // 1. Extract
    const text = await extractText(fileBuffer, fileType, filename);

    // 2. Chunk
    const textChunks = chunkText(text);
    console.log(`[RAG] Generated ${textChunks.length} chunks from ${filename}`);

    // 3. Embed & Store
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const chunkContent of textChunks) {
            const embedding = await generateEmbedding(chunkContent);
            const chunkId = uuidv4();

            await client.query(
                'INSERT INTO document_chunks (id, document_id, content, embedding, metadata) VALUES ($1, $2, $3, $4, $5)',
                [chunkId, documentId, chunkContent, JSON.stringify(embedding), JSON.stringify({ filename })]
            );
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    return textChunks.length;
};

// --- Retrieval ---
export const searchSimilarChunks = async (query: string, topK: number = 5): Promise<SearchResult[]> => {
    const queryEmbedding = await generateEmbedding(query);

    // Fetch all chunks from DB (Playground scale: fetch all to memory)
    const client = await pool.connect();
    let chunks: DocumentChunk[] = [];

    try {
        const res = await client.query('SELECT id, document_id, content, embedding, metadata FROM document_chunks');
        chunks = res.rows.map(row => ({
            id: row.id,
            documentId: row.document_id,
            content: row.content,
            embedding: row.embedding, // database returns parsed JSONB object (array of numbers) automatically? or needs parsing? pg usually returns auto-parsed for JSONB.
            metadata: row.metadata
        }));
    } finally {
        client.release();
    }

    // Brute force cosine similarity
    const scores = chunks.map(chunk => ({
        chunk,
        score: computeCosineSimilarity(queryEmbedding, chunk.embedding) || 0
    }));

    // Sort descending
    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK);
};

export const deleteDocumentFromStore = async (documentId: string) => {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
        console.log(`[RAG] Deleted chunks for doc ${documentId}.`);
    } finally {
        client.release();
    }
}
