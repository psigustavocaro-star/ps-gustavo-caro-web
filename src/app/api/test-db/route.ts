import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL;

    // VERSIÓN 2.0 - SIN PRISMA
    if (!dbUrl || dbUrl.length < 10) {
        return NextResponse.json({
            success: false,
            version: "2.0",
            error: 'DATABASE_URL no está configurada',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }

    try {
        const pool = new Pool({ connectionString: dbUrl });
        const result = await pool.query('SELECT NOW()');
        await pool.end();

        return NextResponse.json({
            success: true,
            version: "2.0",
            message: 'Conexión directa con PG exitosa',
            data: result.rows[0],
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            version: "2.0",
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
