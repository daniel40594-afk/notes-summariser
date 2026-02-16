
import { NextResponse } from 'next/server';
import { processDocument, extractText } from '@/lib/rag';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        console.log('[Debug API] Starting RAG processing test (PDF)...');
        const docId = uuidv4();
        const userId = 'debug-user'; // Dummy user

        // 1. Insert Dummy Document to satisfy FK
        const client = await pool.connect();
        try {
            // clean up potential previous run
            // await client.query('DELETE FROM documents WHERE user_id = $1', [userId]);

            const res = await client.query(
                'INSERT INTO documents (id, user_id, filename, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [docId, userId, 'debug_test.pdf', 'application/pdf', 1024]
            );
            console.log('[Debug API] Inserted Doc ID:', res.rows[0].id);
        } finally {
            client.release();
        }

        // 2. Create Minimal PDF Buffer
        // Minimal PDF binary structure
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(Hello RAG World!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000206 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF`;
        const buffer = Buffer.from(pdfContent);

        console.log(`[Debug API] Processing Test Doc ID: ${docId}`);

        // 3. Process full document (Extract + Embed + Store)
        const count = await processDocument(buffer, 'application/pdf', 'debug_test.pdf', docId);

        return NextResponse.json({ success: true, count, docId });

    } catch (error: any) {
        console.error('[Debug API] RAG Processing Failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
