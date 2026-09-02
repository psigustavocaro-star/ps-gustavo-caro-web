
type CalBookingResult = { success: true; bookingId: string } | { success: false; error: string };
type CalActionResult = { success: true } | { success: false; error: string };

export async function createCalBooking(params: {
    eventTypeId: number;
    start: string;
    name: string;
    email: string;
    notes?: string;
    attendeeTimeZone?: string | null;
}): Promise<CalBookingResult> {
    const apiKey = process.env.CALCOM_API_KEY;

    if (!apiKey) {
        console.error('CALCOM: Error - API Key no configurada');
        return { success: false, error: 'API Key missing' };
    }

    try {
        const response = await fetch(`https://api.cal.com/v2/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'cal-api-version': '2026-02-25'
            },
            body: JSON.stringify({
                eventTypeId: params.eventTypeId,
                start: params.start, // params.start ya viene con .000Z de la DB/Frontend
                attendee: {
                    name: params.name,
                    email: params.email,
                    timeZone: params.attendeeTimeZone || 'America/Santiago'
                }
            })
        });

        const data = await response.json();

        if (response.ok && (data.status === 'success' || response.status === 201)) {
            // Los endpoints de cancelar/reprogramar de Cal.com usan `uid`, no el id numérico.
            // Guardamos ese UID en calBookingId/calBookingIds para que las operaciones posteriores
            // afecten exactamente el evento creado en Google Calendar.
            const bookingId = data.data?.uid || data.uid || data.data?.id || data.id;
            if (!bookingId) return { success: false, error: 'Cal.com no devolvió el identificador de la reserva' };
            if (data.data?.status === 'pending' || data.status === 'pending') {
                const confirmed = await confirmCalBooking(String(bookingId));
                if (!confirmed.success) return confirmed;
            }
            return { success: true, bookingId: String(bookingId) };
        } else {
            console.error('Cal.com booking error:', response.status, data?.message || data?.error);
            return { success: false, error: `Cal.com error ${response.status}` };
        }
    } catch (error) {
        console.error('Cal.com network error:', error);
        return { success: false, error: 'Cal.com network error' };
    }
}

export async function confirmCalBooking(bookingUid: string): Promise<CalActionResult> {
    const apiKey = process.env.CALCOM_API_KEY;
    if (!apiKey || !bookingUid) return { success: false, error: 'Datos de confirmación incompletos' };
    try {
        const response = await fetch(`https://api.cal.com/v2/bookings/${bookingUid}/confirm`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'cal-api-version': '2026-02-25' },
        });
        if (response.ok) return { success: true };
        console.error('Cal.com confirm error:', response.status);
        return { success: false, error: 'Cal.com confirm failed' };
    } catch (error) {
        console.error('Cal.com confirm network error:', error);
        return { success: false, error: 'Cal.com confirm network error' };
    }
}

export async function rescheduleCalBooking(params: {
    bookingUid: string;
    start: string;
    rescheduledBy?: string;
    reason?: string;
}): Promise<CalBookingResult> {
    const apiKey = process.env.CALCOM_API_KEY;
    if (!apiKey || !params.bookingUid) return { success: false, error: 'Datos de reprogramación incompletos' };
    try {
        const response = await fetch(`https://api.cal.com/v2/bookings/${params.bookingUid}/reschedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'cal-api-version': '2026-02-25',
            },
            body: JSON.stringify({ start: params.start, rescheduledBy: params.rescheduledBy, reschedulingReason: params.reason || 'Corrección administrativa de fecha.' }),
        });
        const data = await response.json();
        if (!response.ok || data.status === 'error') {
            console.error('Cal.com reschedule error:', response.status, data?.message || data?.error);
            return { success: false, error: 'Cal.com no pudo mover esta cita' };
        }
        const bookingId = data.data?.uid || data.data?.rescheduledToUid || data.uid;
        return bookingId ? { success: true, bookingId: String(bookingId) } : { success: false, error: 'Cal.com no devolvió la nueva cita' };
    } catch (error) {
        console.error('Cal.com reschedule network error:', error);
        return { success: false, error: 'No se pudo conectar con Cal.com' };
    }
}

export async function cancelCalBooking(bookingUid: string, reason?: string): Promise<CalActionResult> {
    const apiKey = process.env.CALCOM_API_KEY;

    if (!apiKey) {
        console.error('CALCOM: Error - API Key no configurada');
        return { success: false, error: 'API Key missing' };
    }

    try {
        const response = await fetch(`https://api.cal.com/v2/bookings/${bookingUid}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'cal-api-version': '2026-02-25'
            },
            body: JSON.stringify({ cancellationReason: reason || 'Cancelado por el administrador desde CRM' })
        });

        if (response.ok) return { success: true };

        // Fallback v1
        const fallbackRes = await fetch(`https://api.cal.com/v1/bookings/${bookingUid}/cancel`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey, reason: reason || 'Cancelado desde CRM' })
        });

        if (fallbackRes.ok) return { success: true };

        console.error('Cal.com cancel error:', response.status, fallbackRes.status);
        return { success: false, error: 'Cal.com cancel failed' };
    } catch (error) {
        console.error('Cal.com cancel network error:', error);
        return { success: false, error: 'Cal.com network error' };
    }
}
