
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
        console.log(`CALCOM: Creando reserva v1 para ${params.email} en tipo ${params.eventTypeId}`);

        const cleanStart = params.start.split('.')[0] + 'Z'; 

        const body = {
            eventTypeId: params.eventTypeId,
            start: cleanStart,
            responses: {
                name: params.name,
                email: params.email
            },
            timeZone: 'America/Santiago',
            language: 'es'
        };

        const response = await fetch(`https://api.cal.com/v1/bookings?apiKey=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            const bookingId = data.id || data.booking?.id;
            console.log(`CALCOM: Booking v1 creado exitosamente. ID: ${bookingId}`);
            return { success: true, bookingId, sentBody: body };
        } else {
            console.error('CALCOM: Error al crear booking v1:', data);
            const errorDetail = JSON.stringify(data);
            return { success: false, error: `Cal.com v1 Error: ${response.status} - ${errorDetail}`, sentBody: body };
        }
    } catch (error: any) {
        console.error('CALCOM: Error crítico de red v1:', error.message);
        return { success: false, error: error.message };
    }
}

export async function confirmCalBooking(bookingId: string) {
    // En Cal.com v2, las reservas se pueden crear confirmadas por defecto si el tipo de evento lo permite.
    // Dejamos el placeholder por si se necesita confirmar manualmente vía PATCH.
    return { success: true };
}
