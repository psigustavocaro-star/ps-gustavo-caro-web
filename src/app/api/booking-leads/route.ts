import { NextRequest, NextResponse } from 'next/server';
import { upsertBookingLead } from '@/lib/services/booking-leads';
import { ipFromHeaders, isEmail, rateLimit } from '@/lib/util/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const ip = ipFromHeaders(request.headers);
    const rl = rateLimit(`booking-lead:${ip}`, 20, 10 * 60 * 1000);
    if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes' }, { status: 429 });

    try {
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

        if (!isEmail(email)) {
            return NextResponse.json({ success: true, captured: false });
        }

        const lead = await upsertBookingLead({
            email,
            name: body?.name,
            firstName: body?.firstName,
            secondName: body?.secondName,
            firstSurname: body?.firstSurname,
            secondSurname: body?.secondSurname,
            phone: body?.phone,
            rut: body?.rut,
            address: body?.address,
            region: body?.region,
            commune: body?.commune,
            serviceType: body?.serviceType,
            reason: body?.motivo || body?.reason,
            details: body?.detalles || body?.details,
            appointmentDate: body?.appointmentDate,
            appointmentDates: body?.appointmentDates,
            attendeeTimeZone: body?.attendeeTimeZone,
            calEventTypeId: body?.calEventTypeId,
        });

        return NextResponse.json({ success: true, captured: true, leadId: lead.id });
    } catch (error) {
        console.error('Booking lead capture error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible guardar el avance' }, { status: 500 });
    }
}
