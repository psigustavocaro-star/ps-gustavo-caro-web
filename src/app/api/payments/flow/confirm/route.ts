import { NextRequest, NextResponse } from 'next/server';
import { getFlowPaymentStatus, verifyFlowSignature } from '@/lib/services/flow';
import { generateInvoice, sendInvoiceEmail } from '@/lib/services/invoice';

export async function POST(request: NextRequest) {
    try {
        let token = '';

        // Leemos todo como texto plano para evitar crash de 'request.formData()' en NextJS Edge
        const rawText = await request.text();

        // 1. Intentar parsearlo como URLSearchParams (application/x-www-form-urlencoded)
        try {
            const params = new URLSearchParams(rawText);
            if (params.has('token')) {
                token = params.get('token') as string;
            }
        } catch (e) {}

        // 2. Fallback si lo manda como JSON
        if (!token) {
            try {
                const jsonObj = JSON.parse(rawText);
                if (jsonObj.token) token = jsonObj.token;
            } catch (e) {}
        }

        if (!token) {
            console.error('API Flow Confirm: No token found in payload:', rawText);
            return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
        }

        // Obtener estado del pago
        const paymentStatus = await getFlowPaymentStatus(token);

        console.log('Flow payment status:', paymentStatus);

        // Status 2 = Pagado exitosamente
        if (paymentStatus.status === 2) {
            const orderId = paymentStatus.commerceOrder;
            
            try {
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
                try {
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
                        await sendInvoiceEmail(clientEmail, invoice.invoiceUrl, invoice.invoiceNumber || orderId, clientName);
                    }
                    console.log(`Boleta procesada: ${invoice.invoiceNumber}`);
                } catch (invoiceErr) {
                    console.error('Invoice generation critical error:', invoiceErr);
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

                // Crear agendamiento en Cal.com
                if (booking.calEventTypeId && booking.appointmentDate) {
                    try {
                        const { createCalBooking } = await import('@/lib/services/calcom');
                        const calResult = await createCalBooking({
                            eventTypeId: Number(booking.calEventTypeId),
                            start: booking.appointmentDate,
                            name: clientName,
                            email: clientEmail,
                            notes: booking.details || ''
                        });

                        if (calResult.success && (calResult as any).bookingId) {
                            await prisma.booking.update({
                                where: { orderId: orderId },
                                data: { calBookingId: (calResult as any).bookingId.toString() }
                            });
                        }
                    } catch (calErr) {
                        console.error('Error creating Cal.com booking during flow callback:', calErr);
                    }
                }

                // Enviar confirmación de cita detallada por email
                try {
                    const { sendBookingConfirmation } = await import('@/lib/services/mail');
                    await sendBookingConfirmation({
                        name: clientName,
                        email: clientEmail,
                        phone: booking.phone || booking.rut || '', 
                        reason: booking.reason || '',
                        details: booking.details || '',
                        amount,
                        orderId,
                    });
                } catch (mailErr) {
                    console.error('Error sending confirmation email:', mailErr);
                }

                console.log(`✅ Pago confirmado completamente: ${orderId}`);
            } catch (blockError) {
                console.error('CRITICAL CONFIRMATION ERROR:', blockError);
                // Even if internal logic failed, we MUST return 200 OK to flow so it doesn't retry forever or send warning emails
            }
        } else if (paymentStatus.status === 3 || paymentStatus.status === 4) {
            const orderId = paymentStatus.commerceOrder;
            try {
                const { default: prisma } = await import('@/lib/db');
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

    } catch (error: any) {
        console.error('Flow confirmation TOP LEVEL error:', {
            message: error?.message,
            stack: error?.stack
        });
        return NextResponse.json({ received: true }); // Prevent Flow from spamming 500 error emails
    }
}
