
import { processDocument, deleteDocumentFromStore } from '@/lib/rag';
import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Note: Next.js App Router handles FormData automatically
export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check (Simple JWT check as per existing auth.ts styles - reusing pattern)
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Decode token manually or use lib/auth helper if exported
        // Assuming simple decoding for now as we don't have lib/auth visibly exported in context
        // But let's try to verify if we can.
        // For safety/speed, decode:
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }
        const userId = decoded.userId;

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const workspaceId = formData.get('workspaceId') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log(`[Upload API] Processing file: ${file.name}, type: ${file.type}, size: ${file.size}, workspace: ${workspaceId}`);

        // 3. Database Entry for Document
        const client = await pool.connect();
        let documentId = uuidv4();

        try {
            await client.query(
                'INSERT INTO documents (id, user_id, filename, file_type, file_size, workspace_id) VALUES ($1, $2, $3, $4, $5, $6)',
                [documentId, userId, file.name, file.type, file.size, workspaceId || null]
            );
        } finally {
            client.release();
        }

        // 4. Processing (Extraction + Embedding)
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        try {
            const chunkCount = await processDocument(buffer, file.type, file.name, documentId);
            return NextResponse.json({ success: true, documentId, chunkCount });
        } catch (err: any) {
            console.error('[Upload API] Processing failed:', err);
            // Cleanup DB entry if processing failed
            const cleanupClient = await pool.connect();
            try {
                await cleanupClient.query('DELETE FROM documents WHERE id = $1', [documentId]);
                // Chunks are not created yet if processDocument failed, but if partial failure, use lib helper
                await deleteDocumentFromStore(documentId);
            } finally {
                cleanupClient.release();
            }

            return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[Upload API] Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
