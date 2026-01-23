import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }

        const { default: prisma } = await import('@/lib/db');

        await prisma.newsletter.upsert({
            where: { email },
            update: { active: true, name: name || undefined },
            create: { email, name: name || undefined }
        });

        return NextResponse.json({ success: true, message: 'Suscripción exitosa' });
    } catch (error: any) {
        console.error('Newsletter error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
