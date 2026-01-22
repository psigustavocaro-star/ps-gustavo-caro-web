import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl || dbUrl.length < 10) {
        return NextResponse.json({
            success: false,
            error: 'DATABASE_URL no está configurada',
            urlLength: dbUrl?.length || 0,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }

    try {
        const pool = new Pool({ connectionString: dbUrl });

        // Test query
        const result = await pool.query('SELECT COUNT(*) as count FROM "Booking"');
        const count = result.rows[0].count;

        await pool.end();

        return NextResponse.json({
            success: true,
            message: 'Conexión a Supabase exitosa (sin Prisma)',
            bookingsCount: parseInt(count),
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
