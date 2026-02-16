
import pool from '@/lib/db';
import { deleteDocumentFromStore } from '@/lib/rag';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET: List documents
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded: any = jwt.decode(token);
        const userId = decoded?.userId;

        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC',
                [userId]
            );
            return NextResponse.json({ documents: result.rows });
        } finally {
            client.release();
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove document
export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded: any = jwt.decode(token);
        const userId = decoded?.userId;

        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get('id');

        if (!documentId) return NextResponse.json({ error: 'Document ID required' }, { status: 400 });

        const client = await pool.connect();
        try {
            // Verify ownership
            const docCheck = await client.query('SELECT user_id FROM documents WHERE id = $1', [documentId]);
            if (docCheck.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            if (docCheck.rows[0].user_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

            // Delete from DB (Cascade will delete chunks, but we have helper purely for abstraction if needed)
            // Actually Cascade ON DELETE CASCADE in init-rag-db will handle chunks deletion from DB.
            // But we should verify. 
            // In init-rag-db: document_id UUID REFERENCES documents(id) ON DELETE CASCADE
            // So just deleting document is enough.

            await client.query('DELETE FROM documents WHERE id = $1', [documentId]);

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
