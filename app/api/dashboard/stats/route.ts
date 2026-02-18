import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        const verified = await verifyAuth(token);

        // Default role if not verified (though middleware should catch this)
        let role = 'user';

        if (verified) {
            const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [verified.id]);
            if (userRes.rows.length > 0) {
                role = userRes.rows[0].role;
            }
        }

        const client = await pool.connect();

        // 1. Total Users
        const totalUsersResult = await client.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(totalUsersResult.rows[0].count);

        // 2. Active (Approved) Users
        const activeUsersResult = await client.query("SELECT COUNT(*) FROM users WHERE status = 'approved'");
        const activeUsers = parseInt(activeUsersResult.rows[0].count);

        // 3. Recent Signups (Last 5)
        const recentSignupsResult = await client.query(`
      SELECT id, email, created_at, status 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
        const recentSignups = recentSignupsResult.rows;

        client.release();

        return NextResponse.json({
            totalUsers,
            activeUsers,
            recentSignups,
            role
        });

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
