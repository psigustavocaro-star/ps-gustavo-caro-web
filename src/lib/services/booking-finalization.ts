type PaymentFinalizationOptions = {
    orderId: string;
    amount?: number;
    paymentMethod: string;
    auditLabel?: string;
    rawPaymentData?: unknown;
};

export async function finalizePaidBooking({
    orderId,
    amount,
    paymentMethod,
    auditLabel = 'PAGO',
    rawPaymentData,
}: PaymentFinalizationOptions) {
    const auditData: any = { orderId, paymentMethod, steps: {} };
    const { default: prisma } = await import('@/lib/db');
    const booking = await prisma.booking.findUnique({ where: { orderId } });

    if (!booking) {
        auditData.steps.database = 'BOOKING_NOT_FOUND';
        return { success: false, auditData, reason: 'booking_not_found' };
    }

    auditData.steps.database = 'OK';
    if (rawPaymentData) auditData.payment = rawPaymentData;

    const clientEmail = booking.email;
    const clientName = booking.name || 'Paciente';
    const paidAmount = amount ?? booking.amount;

    if (booking.status !== 'PAID') {
        try {
            const { generateManualInvoice } = await import('@/lib/services/invoice');
            await generateManualInvoice({
                clientEmail,
                clientName,
                amount: paidAmount,
                commerceOrder: orderId,
                description: 'ATENCION PSICOLOGICA',
                paymentMethod,
            });
            auditData.steps.invoice = 'MANUAL (Notificado)';
        } catch (invoiceErr: any) {
            auditData.steps.invoice = `ERROR NOTIFICACION: ${invoiceErr.message}`;
        }
    } else {
        auditData.steps.invoice = 'SKIPPED_ALREADY_PAID';
    }

    try {
        await prisma.booking.update({
            where: { orderId },
            data: { status: 'PAID' },
        });
        auditData.steps.db_update = 'OK';

        await prisma.newsletter.upsert({
            where: { email: clientEmail },
            update: { name: clientName, active: true },
            create: { email: clientEmail, name: clientName, active: true },
        });
        auditData.steps.newsletter_sync = 'OK';
    } catch (e: any) {
        auditData.steps.db_update = `ERROR: ${e.message}`;
    }

    if (booking.calEventTypeId && booking.appointmentDate && !booking.calBookingId) {
        try {
            const { createCalBooking } = await import('@/lib/services/calcom');
            const calResult = await createCalBooking({
                eventTypeId: Number(booking.calEventTypeId),
                start: booking.appointmentDate,
                name: clientName,
                email: clientEmail,
                notes: `Orden ${orderId} pagada con ${paymentMethod}`,
            });
            auditData.steps.calcom = calResult.success ? `OK (${calResult.bookingId})` : `FALLÓ (${calResult.error})`;
            if (calResult.success && calResult.bookingId) {
                await prisma.booking.update({
                    where: { orderId },
                    data: { calBookingId: String(calResult.bookingId) },
                });
            }
        } catch (calErr: any) {
            auditData.steps.calcom = `CRASH: ${calErr.message}`;
        }
    } else if (booking.calBookingId) {
        auditData.steps.calcom = `SKIPPED_ALREADY_CREATED (${booking.calBookingId})`;
    } else {
        auditData.steps.calcom = 'SKIPPED_NO_DATE_OR_EVENT';
    }

    if (booking.status !== 'PAID') {
        try {
            const { sendBookingConfirmation } = await import('@/lib/services/mail');
            await sendBookingConfirmation({
                name: clientName,
                email: clientEmail,
                phone: booking.phone || '',
                reason: booking.reason || '',
                details: booking.details || '',
                amount: paidAmount,
                orderId,
            });
            auditData.steps.resend = 'OK';
        } catch (mailErr: any) {
            auditData.steps.resend = `ERROR: ${mailErr.message}`;
        }
    } else {
        auditData.steps.resend = 'SKIPPED_ALREADY_PAID';
    }

    try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: 'Web Ps. Gustavo Caro <notificaciones@psgustavocaro.cl>',
            to: 'psi.gustavocaro@gmail.com',
            subject: `📊 Auditoría [${auditLabel}]: ${orderId}`,
            html: `<pre>${JSON.stringify(auditData, null, 2)}</pre>`,
        });
    } catch (e) {}

    return { success: true, auditData, booking };
}
