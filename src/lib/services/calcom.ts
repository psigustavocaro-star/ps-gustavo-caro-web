
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
        console.log(`CALCOM: Creando reserva para ${params.email} en tipo ${params.eventTypeId}`);

        // Cal.com API v1 Create Booking
        const response = await fetch(`https://api.cal.com/v1/bookings?apiKey=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventTypeId: params.eventTypeId,
                start: params.start,
                responses: {
                    name: params.name,
                    email: params.email,
                    notes: params.notes || ''
                },
                metadata: {},
                timeZone: 'America/Santiago',
                language: 'es'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`CALCOM: Booking creado exitosamente. ID: ${data.booking.id}`);
            return { success: true, bookingId: data.booking.id };
        } else {
            console.error('CALCOM: Error al crear booking:', data);
            return { success: false, error: data.message || 'Error cal.com' };
        }
    } catch (error: any) {
        console.error('CALCOM: Error crítico de red:', error.message);
        return { success: false, error: error.message };
    }
}

export async function confirmCalBooking(bookingId: string) {
    const apiKey = process.env.CALCOM_API_KEY;

    if (!apiKey) {
        console.error('CALCOM: Error - API Key no configurada');
        return { success: false, error: 'API Key missing' };
    }

    try {
        console.log(`CALCOM: Intentando confirmar booking ${bookingId}`);

        const response = await fetch(`https://api.cal.com/v1/bookings/${bookingId}/confirm?apiKey=${apiKey}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`CALCOM: Booking ${bookingId} confirmado exitosamente`);
            return { success: true, data };
        } else {
            console.error('CALCOM: Error al confirmar booking:', data);
            return { success: false, error: data.message || 'Error cal.com' };
        }
    } catch (error: any) {
        console.error('CALCOM: Error crítico de red:', error.message);
        return { success: false, error: error.message };
    }
}
