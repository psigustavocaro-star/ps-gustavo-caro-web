import { processAbandonedBookingRecovery } from '@/lib/services/abandoned-booking-recovery';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;

    const auth = request.headers.get('authorization') || '';
    const expected = `Bearer ${secret}`;
    let ok = auth.length === expected.length;
    if (ok) {
        let diff = 0;
        for (let i = 0; i < auth.length; i++) diff |= auth.charCodeAt(i) ^ expected.charCodeAt(i);
        ok = diff === 0;
    }
    return ok;
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await processAbandonedBookingRecovery();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Abandoned bookings cron error:', error);
        return NextResponse.json({ success: false, error: 'Recovery failed' }, { status: 500 });
    }
}
