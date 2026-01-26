
export async function confirmCalBooking(bookingId: string) {
    const apiKey = process.env.CALCOM_API_KEY;

    if (!apiKey || apiKey === 'tu_api_key_calcom_aqui') {
        console.error('CALCOM: Error - API Key no configurada correctamente');
        return { success: false, error: 'API Key missing' };
    }

    try {
        console.log(`CALCOM: Intentando confirmar booking ${bookingId}`);

        // Cal.com API v1 confirmation endpoint
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
