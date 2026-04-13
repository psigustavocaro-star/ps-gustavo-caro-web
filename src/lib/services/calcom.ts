
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
        console.log(`CALCOM: Creando reserva v2 para ${params.email} en tipo ${params.eventTypeId}`);

        // Cal.com API v2 Create Booking
        const response = await fetch(`https://api.cal.com/v2/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'cal-api-version': '2024-06-11' // Versión recomendada por Cal.com
            },
            body: JSON.stringify({
                eventTypeId: params.eventTypeId,
                start: params.start,
                attendee: {
                    name: params.name,
                    email: params.email,
                    timeZone: 'America/Santiago'
                },
                guests: [],
                meetingNotes: params.notes || '',
                language: 'es'
            })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            const bookingId = data.data.id;
            console.log(`CALCOM: Booking v2 creado exitosamente. ID: ${bookingId}`);
            return { success: true, bookingId };
        } else {
            console.error('CALCOM: Error al crear booking v2:', data);
            return { success: false, error: data.message || data.error?.message || 'Error cal.com v2' };
        }
    } catch (error: any) {
        console.error('CALCOM: Error crítico de red v2:', error.message);
        return { success: false, error: error.message };
    }
}

export async function confirmCalBooking(bookingId: string) {
    // En Cal.com v2, las reservas se pueden crear confirmadas por defecto si el tipo de evento lo permite.
    // Dejamos el placeholder por si se necesita confirmar manualmente vía PATCH.
    return { success: true };
}
