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
            const orderId = paymentStatus.commerceOrder;
            
            // Obtener la información completa guardada en nuestra DB antes del pago
            const { default: prisma } = await import('@/lib/db');
            const booking = await prisma.booking.findUnique({
                where: { orderId }
            });

            if (!booking) {
                console.error(`ERROR: No se encontró boleta en DB para la orden ${orderId}`);
                return NextResponse.json({ error: 'Order not found in DB' }, { status: 404 });
            }

            const clientEmail = booking.email;
            const clientName = booking.name;
            const amount = paymentStatus.amount;

            // Generar boleta automáticamente con datos de la DB
            const invoice = await generateInvoice({
                clientEmail,
                clientName,
                clientRut: booking.rut || undefined,
                clientAddress: booking.address || undefined,
                clientCommune: booking.commune || undefined,
                amount,
                description: 'ATENCION PSICOLOGICA ONLINE Y PRESENCIAL A ADULTOS Y ADOLESCENTES',
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
            try {
                await prisma.booking.update({
                    where: { orderId: orderId },
                    data: { status: 'PAID' }
                });
            } catch (dbError) {
                console.error('Error updating booking status in DB:', dbError);
            }

            // Crear agendamiento en Cal.com si tenemos los datos en la DB
            if (booking.calEventTypeId && booking.appointmentDate) {
                const { createCalBooking } = await import('@/lib/services/calcom');
                const calResult = await createCalBooking({
                    eventTypeId: Number(booking.calEventTypeId),
                    start: booking.appointmentDate,
                    name: clientName,
                    email: clientEmail,
                    notes: booking.details || ''
                }).catch(err => {
                    console.error('Error creating Cal.com booking during flow callback:', err);
                    return { success: false, bookingId: null }; 
                });

                if (calResult.success && (calResult as any).bookingId) {
                    try {
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
                phone: booking.rut || '', 
                reason: booking.reason || '',
                details: booking.details || '',
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
