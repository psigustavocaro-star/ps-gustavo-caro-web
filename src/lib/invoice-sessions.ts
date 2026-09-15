type InvoiceSessionBooking = {
    serviceType?: string | null;
    appointmentDate?: string | null;
    appointmentDates?: string[] | null;
    details?: string | null;
    siiReceiptIssued?: boolean | null;
};

const INCLUDED_SESSION_COUNTS: Record<string, number> = {
    packSesiones: 4,
    evalAutismo: 4,
    evalInteligencia: 4,
    evalEmocional: 4,
};

const COMPLETED_SESSIONS_MARKER = /\n?\[completed_sessions:(\d+)\]\n?/;
const COMPLETED_SESSION_NUMBERS_MARKER = /\n?\[completed_session_numbers:([^\]]*)\]\n?/;

export function getIncludedSessionCount(serviceType?: string | null) {
    return INCLUDED_SESSION_COUNTS[serviceType || ''] || 1;
}

export function getCompletedSessionCount(booking: InvoiceSessionBooking) {
    const value = Number(booking.details?.match(COMPLETED_SESSIONS_MARKER)?.[1] || 0);
    return Math.min(Math.max(Number.isInteger(value) ? value : 0, 0), getIncludedSessionCount(booking.serviceType));
}

export function getCompletedSessionNumbers(booking: InvoiceSessionBooking) {
    const includedCount = getIncludedSessionCount(booking.serviceType);
    const explicitMatch = booking.details?.match(COMPLETED_SESSION_NUMBERS_MARKER);

    if (explicitMatch) {
        return Array.from(new Set(
            explicitMatch[1]
                .split(',')
                .map((value) => Number(value.trim()))
                .filter((value) => Number.isInteger(value) && value >= 1 && value <= includedCount),
        )).sort((first, second) => first - second);
    }

    return Array.from({ length: getCompletedSessionCount(booking) }, (_, index) => index + 1);
}

export function stampCompletedSessionCount(details: string | null | undefined, count: number) {
    const content = (details || '')
        .replace(COMPLETED_SESSIONS_MARKER, '')
        .replace(COMPLETED_SESSION_NUMBERS_MARKER, '')
        .trim();
    if (count <= 0) return content;
    return `${content}${content ? '\n' : ''}[completed_sessions:${count}]`;
}

export function stampCompletedSessionNumbers(details: string | null | undefined, sessionNumbers: number[]) {
    const content = (details || '')
        .replace(COMPLETED_SESSIONS_MARKER, '')
        .replace(COMPLETED_SESSION_NUMBERS_MARKER, '')
        .trim();
    const normalized = Array.from(new Set(sessionNumbers))
        .filter((value) => Number.isInteger(value) && value >= 1)
        .sort((first, second) => first - second);

    if (normalized.length === 0) return content;
    return `${content}${content ? '\n' : ''}[completed_session_numbers:${normalized.join(',')}]`;
}

function isValidDate(value: string) {
    return !Number.isNaN(Date.parse(value));
}

export function getSessionAlignedAppointmentDates(booking: InvoiceSessionBooking) {
    return booking.appointmentDates?.length
        ? [...booking.appointmentDates]
        : booking.appointmentDate ? [booking.appointmentDate] : [];
}

export function getInvoiceSessionSlots(booking: InvoiceSessionBooking) {
    const rawScheduledDates = (booking.appointmentDates?.length
        ? booking.appointmentDates
        : booking.appointmentDate ? [booking.appointmentDate] : []);
    const includedCount = getIncludedSessionCount(booking.serviceType);
    const issuedSessionIds = getIssuedInvoiceSessionIds(booking);
    const total = Math.max(rawScheduledDates.length, includedCount);

    return Array.from({ length: total }, (_, index) => {
        const number = index + 1;
        // La boleta emitida es la fuente de verdad: una boleta única cierra
        // todas las sesiones y una boleta por sesión cierra solo esa sesión.
        // La boleta SII es la única fuente de verdad para considerar una
        // sesión realizada. Las marcas históricas internas no cambian estado.
        const completed = Boolean(booking.siiReceiptIssued) || issuedSessionIds.includes(`session-${number}`);
        const directDate = rawScheduledDates[index] || '';
        const hasDirectDate = isValidDate(directDate);

        return {
            id: `session-${number}`,
            date: hasDirectDate ? directDate : null,
            number,
            completed,
            appointmentIndex: hasDirectDate ? index : null,
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
