import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL;

    // Diagnóstico versión 3.0
    const diag = {
        version: "3.0",
        hasUrl: !!dbUrl,
        urlLength: dbUrl?.length || 0,
        urlStarts: dbUrl?.substring(0, 10),
        env: process.env.NODE_ENV
    };

    if (!dbUrl || dbUrl.length < 10) {
        return NextResponse.json({
            success: false,
            diagnostic: diag,
            error: 'DATABASE_URL no está configurada o es muy corta',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }

    let pool: Pool | null = null;
    try {
        pool = new Pool({
            connectionString: dbUrl,
            connectionTimeoutMillis: 5000
        });

        const result = await pool.query('SELECT NOW() as now');
        await pool.end();

        return NextResponse.json({
            success: true,
            diagnostic: diag,
            message: 'Conexión directa con PG exitosa',
            data: result.rows[0],
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        if (pool) await pool.end().catch(() => { });
        return NextResponse.json({
            success: false,
            diagnostic: diag,
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
