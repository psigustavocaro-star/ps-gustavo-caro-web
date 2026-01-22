import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Verificar si DATABASE_URL existe
    const dbUrl = process.env.DATABASE_URL;
    const hasDbUrl = !!dbUrl && dbUrl.length > 10;

    if (!hasDbUrl) {
        return NextResponse.json({
            success: false,
            error: 'DATABASE_URL no está configurada en Vercel',
            hint: 'Ve a Vercel → Settings → Environment Variables y agrega DATABASE_URL',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }

    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        // Probar conexión contando registros
        const count = await prisma.booking.count();
        await prisma.$disconnect();

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
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
