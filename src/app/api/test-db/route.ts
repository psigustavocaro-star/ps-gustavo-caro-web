import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl || dbUrl.length < 10) {
        return NextResponse.json({
            success: false,
            error: 'DATABASE_URL no está configurada en Vercel',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }

    try {
        // Prisma 7 con adaptador pg
        const pool = new Pool({ connectionString: dbUrl });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        const count = await prisma.booking.count();
        await prisma.$disconnect();
        await pool.end();

        return NextResponse.json({
            success: true,
            message: 'Conexión a Supabase exitosa',
            bookingsCount: count,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack?.substring(0, 500),
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
