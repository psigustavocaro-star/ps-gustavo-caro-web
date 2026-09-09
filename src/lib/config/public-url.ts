const DEFAULT_PUBLIC_URL = 'https://psgustavocaro.cl';

/**
 * URLs included in emails must never inherit a local development address.
 * The public environment variable remains useful for staging, but only when
 * it is an HTTPS URL that is not a loopback host.
 */
export function publicAppUrl() {
    const configured = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');
    if (/^https:\/\//i.test(configured) && !/(^https:\/\/(localhost|127\.0\.0\.1|\[::1\]))/i.test(configured)) {
        return configured;
    }
    return DEFAULT_PUBLIC_URL;
}
