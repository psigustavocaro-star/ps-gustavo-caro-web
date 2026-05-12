import { processNewsletterSequence } from '@/lib/services/newsletter-engine';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Vercel Cron envía: Authorization: Bearer <CRON_SECRET>
export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const auth = request.headers.get('authorization') || '';
    const expected = `Bearer ${secret}`;
    let ok = auth.length === expected.length;
    if (ok) {
        let diff = 0;
        for (let i = 0; i < auth.length; i++) diff |= auth.charCodeAt(i) ^ expected.charCodeAt(i);
        ok = diff === 0;
    }
    if (!ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await processNewsletterSequence();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cron newsletter error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
