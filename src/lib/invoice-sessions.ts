type InvoiceSessionBooking = {
    serviceType?: string | null;
    appointmentDate?: string | null;
    appointmentDates?: string[] | null;
};

const INCLUDED_SESSION_COUNTS: Record<string, number> = {
    packSesiones: 4,
    evalAutismo: 4,
    evalInteligencia: 4,
    evalEmocional: 4,
};

function isValidDate(value: string) {
    return !Number.isNaN(Date.parse(value));
}

export function getInvoiceSessionSlots(booking: InvoiceSessionBooking) {
    const scheduledDates = (booking.appointmentDates?.length
        ? booking.appointmentDates
        : booking.appointmentDate ? [booking.appointmentDate] : [])
        .filter(isValidDate);
    const includedCount = INCLUDED_SESSION_COUNTS[booking.serviceType || ''] || 1;
    const total = Math.max(scheduledDates.length, includedCount);

    return Array.from({ length: total }, (_, index) => ({
        id: `session-${index + 1}`,
        date: scheduledDates[index] || null,
        number: index + 1,
    }));
}

const SII_SESSIONS_MARKER = /\n?\[sii_receipt_sessions:([^\]]*)\]\n?/;

export function getIssuedInvoiceSessionIds(booking: { details?: string | null }) {
    const match = booking.details?.match(SII_SESSIONS_MARKER);
    return match?.[1]
        ? match[1].split(',').map((id) => id.trim()).filter(Boolean)
        : [];
}

export function stampIssuedInvoiceSessionIds(details: string | null | undefined, sessionIds: string[]) {
    const content = (details || '').replace(SII_SESSIONS_MARKER, '').trim();
    if (sessionIds.length === 0) return content;
    return `${content}${content ? '\n' : ''}[sii_receipt_sessions:${sessionIds.join(',')}]`;
}
