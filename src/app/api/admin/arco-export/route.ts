import { NextRequest, NextResponse } from 'next/server';
import { buildArcoExport } from '@/lib/services/arco-export';

export const dynamic = 'force-dynamic';

// Descarga bajo demanda desde el admin: genera el JSON completo del email
// y lo devuelve como attachment para guardarlo o reenviarlo manualmente.
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = (searchParams.get('email') || '').trim().toLowerCase();
        if (!email) {
            return NextResponse.json({ success: false, error: 'Email requerido' }, { status: 400 });
        }

        const data = await buildArcoExport(email);
        const filename = `datos-personales-${email.split('@')[0]}-${new Date().toISOString().slice(0, 10)}.json`;

        return new NextResponse(JSON.stringify(data, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Admin ARCO export error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
