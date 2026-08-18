// Genera y valida tokens firmados (HMAC-SHA256) para dar de baja del newsletter
// sin exigir login. El token es determinístico por email, así que no se
// almacena en BD — se puede regenerar con el mismo secreto y verificar.

function toBase64Url(bytes: Uint8Array): string {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return toBase64Url(new Uint8Array(sig));
}

function getSecret(): string {
    const s = process.env.UNSUBSCRIBE_SECRET || process.env.ADMIN_SESSION_SECRET;
    if (!s || s.length < 16) {
        throw new Error('UNSUBSCRIBE_SECRET (o ADMIN_SESSION_SECRET) no configurado');
    }
    return s;
}

export async function createUnsubscribeToken(email: string): Promise<string> {
    const normalized = email.trim().toLowerCase();
    return await hmacSha256Hex(getSecret(), normalized);
}

export async function verifyUnsubscribeToken(email: string, token: string): Promise<boolean> {
    if (!email || !token) return false;
    const expected = await createUnsubscribeToken(email);
    if (expected.length !== token.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
    }
    return diff === 0;
}

export function unsubscribeUrl(baseUrl: string, email: string, token: string): string {
    const params = new URLSearchParams({ email, t: token });
    return `${baseUrl}/newsletter/baja?${params.toString()}`;
}
