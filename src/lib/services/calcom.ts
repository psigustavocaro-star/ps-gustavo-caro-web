
export async function createCalBooking(params: {
    eventTypeId: number;
    start: string;
    name: string;
    email: string;
    notes?: string;
}) {
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
                'cal-api-version': '2024-08-13'
            },
            body: JSON.stringify({
                eventTypeId: params.eventTypeId,
                start: params.start, // params.start ya viene con .000Z de la DB/Frontend
                attendee: {
                    name: params.name,
                    email: params.email,
                    timeZone: 'America/Santiago'
                }
            })
        });

        const data = await response.json();

        if (response.ok && (data.status === 'success' || response.status === 201)) {
            const bookingId = data.data?.id || data.id;
            return { success: true, bookingId };
        } else {
            console.error('Cal.com booking error:', response.status, data?.message || data?.error);
            return { success: false, error: `Cal.com error ${response.status}` };
        }
    } catch (error) {
        console.error('Cal.com network error:', error);
        return { success: false, error: 'Cal.com network error' };
    }
}

export async function confirmCalBooking(bookingId: string) {
    // En Cal.com v2, las reservas se pueden crear confirmadas por defecto si el tipo de evento lo permite.
    // Dejamos el placeholder por si se necesita confirmar manualmente vía PATCH.
    return { success: true };
}

export async function cancelCalBooking(bookingUid: string, reason?: string) {
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
                'cal-api-version': '2024-08-13'
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
