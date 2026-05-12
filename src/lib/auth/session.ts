const SESSION_COOKIE = 'psg_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h

function b64urlEncode(bytes: Uint8Array): string {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array {
    const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function hmac(secret: string, data: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return b64urlEncode(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export async function sha256Hex(input: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const bytes = new Uint8Array(buf);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(email: string): Promise<string> {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error('ADMIN_SESSION_SECRET no configurado correctamente');
    }
    const payload = { email, exp: Date.now() + SESSION_TTL_MS };
    const payloadStr = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
    const sig = await hmac(secret, payloadStr);
    return `${payloadStr}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<{ email: string } | null> {
    if (!token) return null;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadStr, sig] = parts;
    const expected = await hmac(secret, payloadStr);
    if (!timingSafeEqual(sig, expected)) return null;
    try {
        const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadStr)));
        if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
        if (typeof payload.email !== 'string') return null;
        return { email: payload.email };
    } catch {
        return null;
    }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;
