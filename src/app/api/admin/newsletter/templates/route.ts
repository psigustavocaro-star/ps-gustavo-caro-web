import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { title, content, id } = await request.json();

        if (typeof title !== 'string' || typeof content !== 'string' || !title.trim() || !content.trim()) {
            return NextResponse.json({ success: false, error: 'Título y contenido requeridos' }, { status: 400 });
        }
        const safeTitle = title.slice(0, 200);
        const safeContent = content.slice(0, 50000);

        if (id) {
            const template = await prisma.emailTemplate.update({
                where: { id },
                data: { title: safeTitle, content: safeContent }
            });
            return NextResponse.json({ success: true, template });
        } else {
            const template = await prisma.emailTemplate.create({
                data: { title: safeTitle, content: safeContent }
            });
            return NextResponse.json({ success: true, template });
        }
    } catch (error) {
        console.error('Newsletter template error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
        }

        await prisma.emailTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter template delete error:', error);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}
