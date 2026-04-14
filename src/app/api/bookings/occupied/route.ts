import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                status: 'PAID',
                appointmentDate: {
                    not: null,
                    gte: new Date().toISOString() // Solo futuras
                }
            },
            select: {
                appointmentDate: true
            }
        });

        const formatInSantiago = (dateStr: string | Date) => {
            const date = new Date(dateStr);
            // Formatear a YYYY-MM-DD HH:mm en America/Santiago
            const santiagoDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Santiago',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
            
            // santiagoDate viene como "YYYY-MM-DD, HH:mm"
            return santiagoDate.replace(',', '');
        };

        const occupiedFromDB = bookings.map(b => {
            if (!b.appointmentDate) return null;
            return formatInSantiago(b.appointmentDate);
        }).filter((slot): slot is string => slot !== null);

        // Fetch from Cal.com if API key exists
        let occupiedFromCal: string[] = [];
        const calKey = process.env.CALCOM_API_KEY;
        if (calKey) {
            try {
                const calRes = await fetch('https://api.cal.com/v2/bookings', {
                    headers: {
                        'Authorization': `Bearer ${calKey}`,
                        'cal-api-version': '2024-08-13'
                    }
                });
                const calData = await calRes.json();
                
                if (calRes.ok && calData.status === 'success') {
                    occupiedFromCal = (calData.data || []).map((b: any) => {
                        return formatInSantiago(b.start);
                    });
                }
            } catch (err) {
                console.error('Error fetching from Cal.com:', err);
            }
        }

        // Combinar y eliminar duplicados
        const occupiedSlots = Array.from(new Set([...occupiedFromDB, ...occupiedFromCal]));

        return NextResponse.json({ success: true, occupiedSlots });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch occupied slots' }, { status: 500 });
    }
}
