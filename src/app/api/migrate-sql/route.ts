import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export async function GET(request: NextRequest) {
    // Usar DIRECT_URL para migraciones SQL crudas para saltar el pooler
    const pool = new Pool({ connectionString: process.env.DIRECT_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('MIGRATION: Adding calBookingId column using direct client...');

        // Agregar la columna calBookingId a la tabla Booking
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calBookingId" TEXT;
        `);

        return NextResponse.json({
            success: true,
            message: 'Columna calBookingId agregada correctamente (o ya existía).'
        });
    } catch (error: any) {
        console.error('MIGRATION ERROR:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
