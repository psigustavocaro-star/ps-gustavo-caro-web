type InvoiceSessionBooking = {
    serviceType?: string | null;
    appointmentDate?: string | null;
    appointmentDates?: string[] | null;
    details?: string | null;
};

const INCLUDED_SESSION_COUNTS: Record<string, number> = {
    packSesiones: 4,
    evalAutismo: 4,
    evalInteligencia: 4,
    evalEmocional: 4,
};

const COMPLETED_SESSIONS_MARKER = /\n?\[completed_sessions:(\d+)\]\n?/;

export function getIncludedSessionCount(serviceType?: string | null) {
    return INCLUDED_SESSION_COUNTS[serviceType || ''] || 1;
}

export function getCompletedSessionCount(booking: InvoiceSessionBooking) {
    const value = Number(booking.details?.match(COMPLETED_SESSIONS_MARKER)?.[1] || 0);
    return Math.min(Math.max(Number.isInteger(value) ? value : 0, 0), getIncludedSessionCount(booking.serviceType));
}

export function stampCompletedSessionCount(details: string | null | undefined, count: number) {
    const content = (details || '').replace(COMPLETED_SESSIONS_MARKER, '').trim();
    if (count <= 0) return content;
    return `${content}${content ? '\n' : ''}[completed_sessions:${count}]`;
}

function isValidDate(value: string) {
    return !Number.isNaN(Date.parse(value));
}

export function getInvoiceSessionSlots(booking: InvoiceSessionBooking) {
    const scheduledDates = (booking.appointmentDates?.length
        ? booking.appointmentDates
        : booking.appointmentDate ? [booking.appointmentDate] : [])
        .filter(isValidDate);
    const includedCount = getIncludedSessionCount(booking.serviceType);
    const completedSessions = getCompletedSessionCount(booking);
    const total = Math.max(scheduledDates.length + completedSessions, includedCount);

    return Array.from({ length: total }, (_, index) => {
        const completed = index < completedSessions;
        const scheduledIndex = index - completedSessions;
        return {
            id: `session-${index + 1}`,
            date: completed ? null : scheduledDates[scheduledIndex] || null,
            number: index + 1,
            completed,
            appointmentIndex: completed ? null : scheduledIndex,
        };
    });
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
