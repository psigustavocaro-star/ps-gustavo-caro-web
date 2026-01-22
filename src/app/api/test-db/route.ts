import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { default: prisma } = await import('@/lib/db');

        // Probar conexión contando registros
        const count = await prisma.booking.count();

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
