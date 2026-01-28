import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const body = await request.json();
        const { appointmentDate } = body;

        if (!appointmentDate) {
            return NextResponse.json(
                { error: 'La fecha de la cita es requerida' },
                { status: 400 }
            );
        }

        // Buscar la reserva por orderId (flowOrderNumber)
        const booking = await prisma.booking.findFirst({
            where: { flowOrderNumber: orderId }
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Reserva no encontrada' },
                { status: 404 }
            );
        }

        // Actualizar la fecha de la cita
        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                appointmentDate: new Date(appointmentDate),
                status: 'scheduled'
            }
        });

        // TODO: Enviar email de confirmación con los detalles de la cita
        // TODO: Crear evento en Google Calendar si está configurado

        return NextResponse.json({
            success: true,
            message: 'Cita agendada exitosamente',
            booking: {
                id: updatedBooking.id,
                appointmentDate: updatedBooking.appointmentDate,
                status: updatedBooking.status
            }
        });

    } catch (error) {
        console.error('Error scheduling appointment:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
