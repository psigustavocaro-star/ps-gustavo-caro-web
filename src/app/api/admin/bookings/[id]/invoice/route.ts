import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { invoiceUrl } = body;

        if (!invoiceUrl) {
            return NextResponse.json({ error: 'URL o Base64 de la boleta es requerido' }, { status: 400 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { invoiceUrl }
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error: any) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
