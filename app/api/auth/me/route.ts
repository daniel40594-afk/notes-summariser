
import { NextResponse, NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const verified = await verifyAuth(token);

        if (!verified) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await pool.connect();
        const result = await client.query('SELECT id, email, role, status FROM users WHERE id = $1', [verified.id]);
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
