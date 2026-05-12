type PaymentFinalizationOptions = {
    orderId: string;
    amount?: number;
    paymentMethod: string;
    auditLabel?: string;
    rawPaymentData?: unknown;
};

type AuditData = {
    orderId: string;
    paymentMethod: string;
    paidAmount?: number;
    steps: Record<string, string>;
};

export async function finalizePaidBooking({
    orderId,
    amount,
    paymentMethod,
    auditLabel = 'PAGO',
    // rawPaymentData se ignora en el audit email para no incluir PII del proveedor.
    rawPaymentData: _rawPaymentData,
}: PaymentFinalizationOptions) {
    const auditData: AuditData = { orderId, paymentMethod, steps: {} };
    const { default: prisma } = await import('@/lib/db');
    const booking = await prisma.booking.findUnique({ where: { orderId } });

    if (!booking) {
        auditData.steps.database = 'BOOKING_NOT_FOUND';
        return { success: false, auditData, reason: 'booking_not_found' };
    }

    auditData.steps.database = 'OK';

    const clientEmail = booking.email;
    const clientName = booking.name || 'Paciente';
    const paidAmount = amount ?? booking.amount;
    auditData.paidAmount = paidAmount;

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
            auditData.steps.invoice = 'MANUAL_OK';
        } catch (invoiceErr) {
            console.error('Invoice notification error:', invoiceErr);
            auditData.steps.invoice = 'ERROR';
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
    } catch (e) {
        console.error('Booking finalize DB error:', e);
        auditData.steps.db_update = 'ERROR';
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
            auditData.steps.calcom = calResult.success ? `OK_${calResult.bookingId}` : 'FAILED';
            if (calResult.success && calResult.bookingId) {
                await prisma.booking.update({
                    where: { orderId },
                    data: { calBookingId: String(calResult.bookingId) },
                });
            }
        } catch (calErr) {
            console.error('Cal.com booking crash:', calErr);
            auditData.steps.calcom = 'CRASH';
        }
    } else if (booking.calBookingId) {
        auditData.steps.calcom = `SKIPPED_ALREADY_CREATED`;
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
        } catch (mailErr) {
            console.error('Confirmation mail error:', mailErr);
            auditData.steps.resend = 'ERROR';
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
            html: `<pre style="font-family:monospace;font-size:13px;">${JSON.stringify(auditData, null, 2)}</pre>`,
        });
    } catch {}

    return { success: true, auditData, booking };
}
