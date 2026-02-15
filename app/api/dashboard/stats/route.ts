import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
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
            recentSignups
        });

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
