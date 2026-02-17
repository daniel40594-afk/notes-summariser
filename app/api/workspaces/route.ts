import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const user = await verifyAuth(token);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM workspaces WHERE user_id = $1 ORDER BY created_at DESC',
            [user.id] // Currently user.id is email based on auth.ts, but let's verify if we standardized on UUID or Email. 
            // Checking existing code... auth.ts uses email as ID usually or looks up DB. 
            // Wait, init-rag-db.js documents.user_id is VARCHAR. auth.ts verifyAuth returns { id: string, email: string, role: string, status: string }.
        );
        return NextResponse.json({ workspaces: result.rows });
    } catch (error) {
        console.error('Failed to fetch workspaces:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const user = await verifyAuth(token);

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
            const result = await client.query(
                'INSERT INTO workspaces (user_id, name) VALUES ($1, $2) RETURNING *',
                [user.id, name]
            );
            return NextResponse.json({ workspace: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to create workspace:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
