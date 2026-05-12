import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const id = typeof body?.id === 'string' ? body.id : undefined;
        const title = typeof body?.title === 'string' ? body.title.slice(0, 200) : '';
        const content = typeof body?.content === 'string' ? body.content.slice(0, 50000) : '';

        if (!title || !content) {
            return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 });
        }

        if (id) {
            const updated = await prisma.emailTemplate.update({ where: { id }, data: { title, content } });
            return NextResponse.json({ success: true, data: updated });
        } else {
            const created = await prisma.emailTemplate.create({ data: { title, content } });
            return NextResponse.json({ success: true, data: created });
        }
    } catch (error) {
        console.error('Template API Error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

        await prisma.emailTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Template delete error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
