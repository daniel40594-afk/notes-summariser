import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    const { id } = await params;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name } = await req.json();

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Ensure owner owns it
            const check = await client.query('SELECT id FROM workspaces WHERE id = $1 AND user_id = $2', [id, user.id]);
            if (check.rowCount === 0) {
                return NextResponse.json({ error: 'Workspace not found or unauthorized' }, { status: 404 });
            }

            const result = await client.query(
                'UPDATE workspaces SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            return NextResponse.json({ workspace: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to rename workspace:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('token')?.value;
    const user = await verifyAuth(token);
    const { id } = await params;

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
        // FKs are ON DELETE CASCADE, so documents and chats should be cleaned up automatically?
        // Wait, documents table has ON DELETE CASCADE on workspace_id?
        // Let's check init-rag-db.js. Yes: REFERENCES workspaces(id) ON DELETE CASCADE.
        // What about 'document_chunks'? They reference 'documents' ON DELETE CASCADE.
        // So deleting a workspace deletes its documents, which deletes their chunks. Chain reaction works.

        const result = await client.query(
            'DELETE FROM workspaces WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Workspace not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete workspace:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
