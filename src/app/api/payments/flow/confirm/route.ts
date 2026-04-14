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
        console.log(`API Flow: Procesando orden ${paymentStatus.commerceOrder} (Status: ${paymentStatus.status})`);

        // Status 2 = Pagado exitosamente
        if (paymentStatus.status === 2) {
            const orderId = paymentStatus.commerceOrder;
            const auditData: any = { orderId, steps: {} };
            
            try {
                // 1. Base de Datos
                const { default: prisma } = await import('@/lib/db');
                const booking = await prisma.booking.findUnique({ where: { orderId } });

                if (!booking) {
                    console.error(`Flow Webhook: Orden ${orderId} no existe en DB`);
                    return NextResponse.json({ received: true });
                }
                auditData.steps.database = 'OK';

                const clientEmail = booking.email;
                const clientName = booking.name;
                const amount = paymentStatus.amount;

                // 2. SII / SimpleAPI
                try {
                    const invoice = await generateInvoice({
                        clientEmail,
                        clientName,
                        clientRut: booking.rut || undefined,
                        clientAddress: booking.address || undefined,
                        clientCommune: booking.commune || undefined,
                        amount,
                        description: 'ATENCION PSICOLOGICA ONLINE Y PRESENCIAL',
                        paymentMethod: paymentStatus.paymentData?.media || 'Webpay',
                        commerceOrder: orderId,
                    });

                    if (invoice.success && invoice.invoiceUrl) {
                        await sendInvoiceEmail(clientEmail, invoice.invoiceUrl, invoice.invoiceNumber || orderId, clientName);
                        auditData.steps.invoice = `OK (${invoice.invoiceNumber})`;
                    } else {
                        auditData.steps.invoice = `AUTOMÁTICA FALLÓ: ${invoice.error || 'Desconocido'}. Generando aviso manual...`;
                        const { generateManualInvoice } = await import('@/lib/services/invoice');
                        await generateManualInvoice({
                            clientEmail, clientName, amount, commerceOrder: orderId,
                            description: 'ATENCION PSICOLOGICA',
                            paymentMethod: paymentStatus.paymentData?.media || 'Webpay'
                        });
                    }
                } catch (invoiceErr: any) {
                    console.error('Invoice logic crashed:', invoiceErr.message);
                    auditData.steps.invoice = `CRASH: ${invoiceErr.message}`;
                }

                // 3. Marcar como Pagado
                try {
                    await prisma.booking.update({
                        where: { orderId },
                        data: { status: 'PAID' }
                    });
                    auditData.steps.db_update = 'OK';
                } catch (e: any) {
                    auditData.steps.db_update = `ERROR: ${e.message}`;
                }

                // 4. Cal.com
                if (booking.calEventTypeId && booking.appointmentDate) {
                    try {
                        const { createCalBooking } = await import('@/lib/services/calcom');
                        const calResult = await createCalBooking({
                            eventTypeId: Number(booking.calEventTypeId),
                            start: booking.appointmentDate,
                            name: clientName,
                            email: clientEmail,
                        });
                        auditData.steps.calcom = calResult.success ? `OK (${calResult.bookingId})` : `FALLÓ (${calResult.error})`;
                    } catch (calErr: any) {
                        auditData.steps.calcom = `CRASH: ${calErr.message}`;
                    }
                }

                // 5. Email de Confirmación Final (Resend)
                try {
                    const { sendBookingConfirmation } = await import('@/lib/services/mail');
                    await sendBookingConfirmation({
                        name: clientName,
                        email: clientEmail,
                        phone: booking.phone || '',
                        reason: booking.reason || '',
                        details: booking.details || '',
                        amount,
                        orderId,
                    });
                    auditData.steps.resend = 'OK';
                } catch (mailErr: any) {
                    auditData.steps.resend = `ERROR: ${mailErr.message}`;
                }

                // 6. ENVIAR AUDITORÍA AL PROFESIONAL (Debug)
                try {
                    const { Resend } = await import('resend');
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    await resend.emails.send({
                        from: 'Web Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                        to: 'psi.gustavocaro@gmail.com',
                        subject: `📊 Auditoría Pago: ${orderId}`,
                        html: `<pre>${JSON.stringify(auditData, null, 2)}</pre>`
                    });
                } catch (e) {}

                console.log(`✅ Webhook finalizado con auditoría para ${orderId}`);
            } catch (blockError: any) {
                console.error('Master confirmation block failed:', blockError.message);
            }
        } else if (paymentStatus.status === 3 || paymentStatus.status === 4) {
            // ... (resto igual)
            const orderId = paymentStatus.commerceOrder;
            try {
                const { default: prisma } = await import('@/lib/db');
                await prisma.booking.update({
                    where: { orderId: orderId },
                    data: { status: 'FAILED' }
                });
            } catch (e) {}
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Flow confirmation TOP LEVEL error:', error.message);
        return NextResponse.json({ received: true });
    }
}
