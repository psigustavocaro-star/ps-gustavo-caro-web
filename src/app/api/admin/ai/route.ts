import { NextResponse } from 'next/server';
import { sanitizeHtml } from '@/lib/services/html-sanitize';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        if (typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 1000) {
            return NextResponse.json({ success: false, error: 'Prompt inválido' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'IA no configurada' }, { status: 500 });
        }

        const safePrompt = prompt.replace(/[<>"]/g, '').slice(0, 1000);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Eres un experto psicólogo clínico, especialista de la salud mental y excelente redactor. Se te solicitó escribir un artículo/newsletter sobre el siguiente tema: "${safePrompt}". Escribe un artículo profesional, amigable, empático y bien estructurado. Evita saludos introductorios tuyos, entra directo al contenido. Formatea detalladamente tu respuesta en código HTML limpio (usando etiquetas como <h2>, <p>, <ul>, <li>, <strong>) sin la etiqueta <html> ni el body, solo el contenido interior. No utilices sintaxis markdown, responde únicamente con HTML puro listo para renderizar.`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error details:', errorBody);
            return NextResponse.json({ success: false, error: 'Error del servicio generador' }, { status: 502 });
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const safeContent = sanitizeHtml(rawText);

        return NextResponse.json({
            success: true,
            title: `Sobre: ${safePrompt.slice(0, 30)}...`,
            content: safeContent
        });

    } catch (error) {
        console.error('AI Error:', error);
        return NextResponse.json({ success: false, error: 'Falla al procesar la solicitud' }, { status: 500 });
    }
}
