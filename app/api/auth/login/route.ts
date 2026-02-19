import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return NextResponse.json({ error: 'Email not found' }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }

        // Check approval status
        // OPTIONAL: You can block login here if status is not approved. 
        // However, the requirement says "Users cannot access the dashboard until approved".
        // So we can let them login but middleware will block access to dashboard.
        // Or we can return the status to frontend to show a "Pending" message.

        const token = await signToken({ userId: user.id, email: user.email, role: user.role, status: user.status });

        const response = NextResponse.json({ success: true, user: { email: user.email, role: user.role, status: user.status } });

        // Set HTTP-only cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
