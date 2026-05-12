import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { rateLimit, ipFromHeaders } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

// Ventana de tiempo en la que se permite agendar la fecha tras crear la orden.
// Pasado ese tiempo, la fecha solo se cambia desde el admin.
const SCHEDULE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`schedule:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const { orderId } = await params;
        if (!/^[A-Z]+-\d+-[A-Za-z0-9-]+$/.test(orderId)) {
            return NextResponse.json({ error: 'Order id inválido' }, { status: 400 });
        }

        const body = await request.json();
        const appointmentDate = typeof body?.appointmentDate === 'string' ? body.appointmentDate : '';
        if (!appointmentDate || isNaN(Date.parse(appointmentDate))) {
            return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });
        }
        if (Date.parse(appointmentDate) <= Date.now()) {
            return NextResponse.json({ error: 'La fecha debe ser futura' }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({ where: { orderId } });
        if (!booking) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        // Solo permitimos agendar dentro de las primeras 24h tras crear la orden
        // y solo si todavía no tiene appointmentDate establecida.
        if (Date.now() - booking.createdAt.getTime() > SCHEDULE_WINDOW_MS) {
            return NextResponse.json(
                { error: 'Ventana de agendamiento vencida. Contacta al profesional.' },
                { status: 403 }
            );
        }
        if (booking.appointmentDate) {
            return NextResponse.json(
                { error: 'Esta reserva ya tiene una cita agendada' },
                { status: 409 }
            );
        }

        const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: { appointmentDate },
        });

        return NextResponse.json({
            success: true,
            booking: {
                id: updated.id,
                appointmentDate: updated.appointmentDate,
                status: updated.status,
            }
        });
    } catch (error) {
        console.error('schedule error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
