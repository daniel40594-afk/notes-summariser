
import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// GET: List documents
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const user = await verifyAuth(token);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');

        const client = await pool.connect();
        try {
            let query = 'SELECT * FROM documents WHERE user_id = $1';
            const params: any[] = [user.id];

            if (workspaceId) {
                query += ' AND workspace_id = $2';
                params.push(workspaceId);
            }

            query += ' ORDER BY uploaded_at DESC';

            const result = await client.query(query, params);
            return NextResponse.json({ documents: result.rows });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Documents GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove document
export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const user = await verifyAuth(token);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get('id');

        if (!documentId) return NextResponse.json({ error: 'Document ID required' }, { status: 400 });

        const client = await pool.connect();
        try {
            // Verify ownership
            const docCheck = await client.query('SELECT user_id FROM documents WHERE id = $1', [documentId]);
            if (docCheck.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            // user.id is string from verifyAuth. docCheck user_id might be string or number depending on column.
            // Safe comparison: String()
            if (String(docCheck.rows[0].user_id) !== String(user.id)) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            await client.query('DELETE FROM documents WHERE id = $1', [documentId]);

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Documents DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
