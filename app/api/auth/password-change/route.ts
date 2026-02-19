
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const token = (req as any).cookies.get('token')?.value;
        const user = await verifyAuth(token);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Get current user password hash
            const res = await client.query('SELECT password_hash FROM users WHERE id = $1', [user.id]);
            if (res.rows.length === 0) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const currentHash = res.rows[0].password_hash;
            const valid = await bcrypt.compare(currentPassword, currentHash);

            if (!valid) {
                return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
            }

            // Hash new password
            const newHash = await bcrypt.hash(newPassword, 10);
            await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
