import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { sanitizeHtml } from '@/lib/services/html-sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedCategories = new Set(['Salud Mental', 'Neurodiversidad', 'Ansiedad', 'Opinión', 'Recursos']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function authorized(request: NextRequest) {
    return verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export async function POST(request: NextRequest) {
    if (!await authorized(request)) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const slug = String(body.slug || '').trim().toLowerCase();
        const title = String(body.title || '').trim().slice(0, 200);
        const excerpt = String(body.excerpt || '').trim().slice(0, 500);
        const category = String(body.category || 'Salud Mental');
        const image = String(body.image || '').trim().slice(0, 500);
        const content = sanitizeHtml(String(body.content || '')).slice(0, 100_000);
        const status = body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
        const keywords = Array.isArray(body.keywords)
            ? body.keywords.map((keyword: unknown) => String(keyword).trim()).filter(Boolean).slice(0, 20)
            : String(body.keywords || '').split(',').map((keyword) => keyword.trim()).filter(Boolean).slice(0, 20);

        if (!slugPattern.test(slug) || !title || !excerpt || !content || !image.startsWith('/') || !allowedCategories.has(category)) {
            return NextResponse.json({ success: false, error: 'Completa título, enlace, resumen, imagen, categoría y contenido.' }, { status: 400 });
        }

        const existing = await prisma.contentPost.findUnique({ where: { slug } });
        const post = existing
            ? await prisma.contentPost.update({
                where: { slug },
                data: { title, excerpt, content, category, image, keywords, status, publishedAt: status === 'PUBLISHED' ? existing.publishedAt || new Date() : null },
            })
            : await prisma.contentPost.create({
                data: { slug, title, excerpt, content, category, image, keywords, status, publishedAt: status === 'PUBLISHED' ? new Date() : null },
            });

        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error('Content post update error:', error);
        return NextResponse.json({ success: false, error: 'No fue posible guardar el artículo.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!await authorized(request)) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const slug = new URL(request.url).searchParams.get('slug');
    if (!slug) return NextResponse.json({ success: false, error: 'Artículo no indicado.' }, { status: 400 });
    await prisma.contentPost.delete({ where: { slug } }).catch(() => null);
    return NextResponse.json({ success: true });
}
