import { NextRequest, NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/services/flow';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (token === 'SIMULACION_TEST') {
        return processConfirmation(token);
    }
    return NextResponse.json({ error: 'Manual trigger not allowed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
    try {
        let token = '';
        const rawText = await request.text();
        try {
            const params = new URLSearchParams(rawText);
            if (params.has('token')) token = params.get('token') as string;
        } catch (e) {}
        
        if (!token) {
            try {
                const jsonObj = JSON.parse(rawText);
                if (jsonObj.token) token = jsonObj.token;
            } catch (e) {}
        }

        if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 });

        return processConfirmation(token);
    } catch (error: any) {
        return NextResponse.json({ received: true });
    }
}

async function processConfirmation(token: string) {
    try {
        let paymentStatus;
        if (token === 'SIMULACION_TEST') {
            const { default: prisma } = await import('@/lib/db');
            const lastBooking = await prisma.booking.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            if (!lastBooking) return NextResponse.json({ error: 'No booking found' });
            
            paymentStatus = {
                status: 2,
                commerceOrder: lastBooking.orderId,
                amount: lastBooking.amount || 350,
                paymentData: { media: 'TEST_SIMULATOR' }
            };
        } else {
            paymentStatus = await getFlowPaymentStatus(token);
        }

        if (paymentStatus.status === 2) {
            const orderId = paymentStatus.commerceOrder;
            const auditData: any = { orderId, steps: {} };
            
            try {
                const { default: prisma } = await import('@/lib/db');
                const booking = await prisma.booking.findUnique({ where: { orderId } });

                if (!booking) return NextResponse.json({ received: true });
                auditData.steps.database = 'OK';

                const clientEmail = booking.email;
                const clientName = booking.name;
                const amount = paymentStatus.amount;

                // 1. Notificación de Boleta
                try {
                    const { generateManualInvoice } = await import('@/lib/services/invoice');
                    await generateManualInvoice({
                        clientEmail, clientName, amount, commerceOrder: orderId,
                        description: 'ATENCION PSICOLOGICA',
                        paymentMethod: paymentStatus.paymentData?.media || 'Webpay'
                    });
                    auditData.steps.invoice = 'MANUAL (Notificado)';
                } catch (invoiceErr: any) {
                    auditData.steps.invoice = `ERROR NOTIFICACION: ${invoiceErr.message}`;
                }

                // 2. Actualización DB y Sincronización Newsletter
                try {
                    await prisma.booking.update({
                        where: { orderId },
                        data: { status: 'PAID' }
                    });
                    auditData.steps.db_update = 'OK';

                    // Auto-registrar en Newsletter
                    await prisma.newsletter.upsert({
                        where: { email: clientEmail },
                        update: { name: clientName, active: true },
                        create: { email: clientEmail, name: clientName, active: true }
                    });
                    auditData.steps.newsletter_sync = 'OK';
                } catch (e: any) {
                    auditData.steps.db_update = `ERROR: ${e.message}`;
                }

                // 3. Reserva en Cal.com
                if (booking.calEventTypeId && booking.appointmentDate) {
                    try {
                        const { createCalBooking } = await import('@/lib/services/calcom');
                        const calResult = await (createCalBooking as any)({
                            eventTypeId: Number(booking.calEventTypeId),
                            start: booking.appointmentDate,
                            name: clientName,
                            email: clientEmail,
                        });
                        auditData.steps.calcom = calResult.success ? `OK (${calResult.bookingId})` : `FALLÓ (${calResult.error})`;
                        if (calResult.sentBody) auditData.calcomBody = calResult.sentBody;
                    } catch (calErr: any) {
                        auditData.steps.calcom = `CRASH: ${calErr.message}`;
                    }
                }

                // 4. Email Confirmación al Cliente
                try {
                    const { sendBookingConfirmation } = await import('@/lib/services/mail');
                    await sendBookingConfirmation({
                        name: clientName, email: clientEmail, phone: booking.phone || '',
                        reason: booking.reason || '', details: booking.details || '',
                        amount, orderId
                    });
                    auditData.steps.resend = 'OK';
                } catch (mailErr: any) {
                    auditData.steps.resend = `ERROR: ${mailErr.message}`;
                }

                // 5. Envío de Auditoría
                try {
                    const { Resend } = await import('resend');
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    await resend.emails.send({
                        from: 'Web Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
                        to: 'psi.gustavocaro@gmail.com',
                        subject: `📊 Auditoría [PAGO]: ${orderId}`,
                        html: `<pre>${JSON.stringify(auditData, null, 2)}</pre>`
                    });
                } catch (e) {}

            } catch (blockError: any) {}
        }
        
        return NextResponse.json({ received: true, simulated: token === 'SIMULACION_TEST' });
    } catch (error: any) {
        return NextResponse.json({ received: true });
    }
}
