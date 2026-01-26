import { NextRequest, NextResponse } from 'next/server';
import { getFlowPaymentStatus, verifyFlowSignature } from '@/lib/services/flow';
import { generateInvoice, sendInvoiceEmail } from '@/lib/services/invoice';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const token = formData.get('token') as string;

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
        }

        // Obtener estado del pago
        const paymentStatus = await getFlowPaymentStatus(token);

        console.log('Flow payment status:', paymentStatus);

        // Status 2 = Pagado exitosamente
        if (paymentStatus.status === 2) {
            // Almacenar el campo opcional si viene en el status
            const clientEmail = paymentStatus.email;
            const amount = paymentStatus.amount;
            const orderId = paymentStatus.commerceOrder;
            const optionalFields = (paymentStatus as any).optional ? JSON.parse((paymentStatus as any).optional) : {};
            const clientName = optionalFields.clientName || 'Paciente';

            // Generar boleta automáticamente
            const invoice = await generateInvoice({
                clientEmail,
                clientName,
                amount,
                description: 'Sesión de Psicoterapia Online - Ps. Gustavo Caro',
                paymentMethod: paymentStatus.paymentData?.media || 'Webpay',
                commerceOrder: orderId,
            });

            if (invoice.success && invoice.invoiceUrl) {
                // Enviar boleta por email
                await sendInvoiceEmail(
                    clientEmail,
                    invoice.invoiceUrl,
                    invoice.invoiceNumber || orderId,
                    clientName
                );
            }

            // Actualizar estado en la base de datos
            const { default: prisma } = await import('@/lib/db');
            try {
                await prisma.booking.update({
                    where: { orderId: orderId },
                    data: { status: 'PAID' }
                });
            } catch (dbError) {
                console.error('Error updating booking status in DB:', dbError);
            }

            // Crear agendamiento en Cal.com si tenemos los datos necesarios
            const calEventTypeId = optionalFields.calEventTypeId;
            const appointmentDate = optionalFields.appointmentDate;

            if (calEventTypeId && appointmentDate) {
                const { createCalBooking } = await import('@/lib/services/calcom');
                const calResult = await createCalBooking({
                    eventTypeId: parseInt(calEventTypeId),
                    start: appointmentDate,
                    name: clientName,
                    email: clientEmail,
                    notes: optionalFields.details || ''
                }).catch(err => {
                    console.error('Error creating Cal.com booking during flow callback:', err);
                    return { success: false, bookingId: null }; // Add null to satisfy types
                });

                if (calResult.success && (calResult as any).bookingId) {
                    // Guardar el ID de la reserva real en la DB
                    try {
                        const { default: prisma } = await import('@/lib/db');
                        await prisma.booking.update({
                            where: { orderId: orderId },
                            data: { calBookingId: (calResult as any).bookingId.toString() }
                        });
                    } catch (e) {
                        console.error('Error updating calBookingId in DB:', e);
                    }
                }
            }

            // Enviar confirmación de cita detallada por email
            const { sendBookingConfirmation } = await import('@/lib/services/mail');
            await sendBookingConfirmation({
                name: clientName,
                email: clientEmail,
                phone: optionalFields.phone,
                reason: optionalFields.motivo,
                details: optionalFields.details,
                amount,
                orderId,
            });

            console.log(`✅ Pago confirmado: ${orderId}, Boleta: ${invoice.invoiceNumber}`);
        } else if (paymentStatus.status === 3 || paymentStatus.status === 4) {
            // Pago rechazado o anulado
            const orderId = paymentStatus.commerceOrder;
            const { default: prisma } = await import('@/lib/db');
            try {
                await prisma.booking.update({
                    where: { orderId: orderId },
                    data: { status: 'FAILED' }
                });
            } catch (dbError) {
                console.error('Error updating failed booking status in DB:', dbError);
            }
            console.log(`❌ Pago no completado: ${paymentStatus.statusMessage}`);
        } else {
            console.log(`⏳ Pago pendiente o en otro estado: ${paymentStatus.status}`);
        }

        // Flow espera un 200 OK
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Flow confirmation error:', error);
        return NextResponse.json({ error: 'Error processing confirmation' }, { status: 500 });
    }
}
