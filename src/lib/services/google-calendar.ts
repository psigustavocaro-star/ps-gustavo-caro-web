import { createPrivateKey, createSign } from 'crypto';

type CalendarCredentials = { client_email: string; private_key: string; calendar_id?: string };
type CalendarResult = { success: true; eventId: string } | { success: false; error: string };

function credentials(): CalendarCredentials | null {
    const raw = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON;
    if (raw) {
        try {
            const value = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
            const parsed = JSON.parse(value) as CalendarCredentials;
            if (parsed.client_email && parsed.private_key) return parsed;
        } catch { /* La ruta mostrará un mensaje seguro de configuración incompleta. */ }
    }
    const clientEmail = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    return clientEmail && privateKey ? { client_email: clientEmail, private_key: privateKey } : null;
}

function calendarId(data: CalendarCredentials) { return process.env.GOOGLE_CALENDAR_ID || data.calendar_id || ''; }
function base64url(value: string) { return Buffer.from(value).toString('base64url'); }

async function accessToken(data: CalendarCredentials): Promise<string | null> {
    const now = Math.floor(Date.now() / 1000);
    const body = base64url(JSON.stringify({ iss: data.client_email, scope: 'https://www.googleapis.com/auth/calendar.events', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const unsigned = `${header}.${body}`;
    const signer = createSign('RSA-SHA256'); signer.update(unsigned); signer.end();
    const assertion = `${unsigned}.${signer.sign(createPrivateKey(data.private_key), 'base64url')}`;
    const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
    const result = await response.json().catch(() => ({}));
    return response.ok && typeof result.access_token === 'string' ? result.access_token : null;
}

async function request(path: string, init: RequestInit): Promise<Response | null> {
    const data = credentials(); const targetCalendar = data && calendarId(data);
    if (!data || !targetCalendar) return null;
    const token = await accessToken(data); if (!token) return null;
    return fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(targetCalendar)}/events${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers } });
}

function eventBody(input: { name: string; email: string; start: string; bookingId: string }) {
    const end = new Date(new Date(input.start).getTime() + 60 * 60 * 1000).toISOString();
    return { summary: `Sobrecupo · ${input.name || 'Paciente'}`, description: 'Sesión excepcional registrada desde el panel administrativo de Ps. Gustavo Caro.', start: { dateTime: input.start, timeZone: 'America/Santiago' }, end: { dateTime: end, timeZone: 'America/Santiago' }, attendees: [{ email: input.email }], extendedProperties: { private: { source: 'ps-gustavo-caro-manual-overbook', bookingId: input.bookingId } } };
}

export async function createGoogleCalendarOverbook(input: { name: string; email: string; start: string; bookingId: string }): Promise<CalendarResult> {
    try {
        const response = await request('?sendUpdates=all', { method: 'POST', body: JSON.stringify(eventBody(input)) });
        if (!response) return { success: false, error: 'Google Calendar no está conectado para registrar sobrecupos.' };
        const result = await response.json().catch(() => ({}));
        return response.ok && typeof result.id === 'string' ? { success: true, eventId: result.id } : { success: false, error: 'No fue posible crear el evento de sobrecupo en Google Calendar.' };
    } catch { return { success: false, error: 'No fue posible conectar con Google Calendar.' }; }
}

export async function updateGoogleCalendarOverbook(eventId: string, input: { name: string; email: string; start: string; bookingId: string }) {
    try { return Boolean((await request(`/${encodeURIComponent(eventId)}?sendUpdates=all`, { method: 'PATCH', body: JSON.stringify(eventBody(input)) }))?.ok); } catch { return false; }
}

export async function deleteGoogleCalendarOverbook(eventId: string) {
    try { await request(`/${encodeURIComponent(eventId)}?sendUpdates=all`, { method: 'DELETE' }); } catch { /* Acción compensatoria; no ocultar el error principal. */ }
}
