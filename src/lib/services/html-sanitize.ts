// Sanitizador HTML mínimo para contenido de templates de email.
// No reemplaza a DOMPurify, pero quita los vectores comunes (script, on*, javascript:).

const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'hr',
    'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
    a: ['href', 'title', 'target', 'rel'],
    span: ['style'],
    div: ['style'],
    p: ['style'],
    td: ['style', 'colspan', 'rowspan'],
    th: ['style', 'colspan', 'rowspan'],
    table: ['style'],
};

function isSafeUrl(url: string): boolean {
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) return false;
    return true;
}

function sanitizeStyle(style: string): string {
    // Permite reglas simples sin expressions ni urls
    if (/expression\(|javascript:|@import|url\(/i.test(style)) return '';
    return style.replace(/[<>"]/g, '');
}

export function sanitizeHtml(input: string): string {
    if (!input) return '';
    // Quita <script>, <style>, <iframe>, <object>, <embed>, <link>, <meta>
    let html = input.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^<]*(?:(?!<\/\s*\1\s*>)<[^<]*)*<\/\s*\1\s*>/gi, '');
    html = html.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, '');

    // Quita atributos on*
    html = html.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');

    // Bloquea href/src con javascript:
    html = html.replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');

    // Filtra tags no permitidos (deja contenido interior)
    html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
        const t = String(tag).toLowerCase();
        if (!ALLOWED_TAGS.has(t)) return '';
        // Filtra atributos
        return match.replace(/\s+([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(["'])([\s\S]*?)\2/g, (_full, attr, _q, value) => {
            const a = String(attr).toLowerCase();
            const allowed = ALLOWED_ATTRS[t] || [];
            if (!allowed.includes(a)) return '';
            if (a === 'href' || a === 'src') {
                if (!isSafeUrl(value)) return '';
            }
            if (a === 'style') {
                value = sanitizeStyle(value);
            }
            if (a === 'target') {
                value = value === '_blank' ? '_blank' : '_self';
            }
            return ` ${a}="${value.replace(/"/g, '&quot;')}"`;
        });
    });

    return html;
}
