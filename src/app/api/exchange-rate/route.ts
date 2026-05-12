import { NextResponse } from 'next/server';
import { getCurrentClpPerUsd } from '@/lib/services/exchange-rate';

export const dynamic = 'force-dynamic';

export async function GET() {
    const clpPerUsd = await getCurrentClpPerUsd();
    return NextResponse.json(
        { clpPerUsd, source: 'mindicador.cl', updatedAt: new Date().toISOString() },
        {
            headers: {
                // Browser cachea 1h, CDN cachea 6h y revalida en background
                'Cache-Control': 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400',
            },
        }
    );
}
