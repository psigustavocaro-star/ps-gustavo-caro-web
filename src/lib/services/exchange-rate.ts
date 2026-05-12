// Tipo de cambio CLP→USD obtenido del Banco Central de Chile vía mindicador.cl.
// Cachea en memoria por 6h para evitar pegarle a la API en cada request.
// Si la API falla, cae a NEXT_PUBLIC_USD_RATE o a 950.

const FALLBACK_RATE = 950;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

type CacheEntry = { value: number; fetchedAt: number };
let cache: CacheEntry | null = null;

function envFallback(): number {
    const fromEnv = Number(process.env.NEXT_PUBLIC_USD_RATE || process.env.PAYPAL_CLP_PER_UNIT);
    if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
    return FALLBACK_RATE;
}

export async function getCurrentClpPerUsd(): Promise<number> {
    const now = Date.now();
    if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.value;
    }

    try {
        const res = await fetch('https://mindicador.cl/api/dolar', {
            // Permite que Next/edge cachee también
            next: { revalidate: 21600 },
        });
        if (!res.ok) throw new Error(`mindicador.cl HTTP ${res.status}`);
        const data = await res.json();
        const valor = Number(data?.serie?.[0]?.valor);
        if (!Number.isFinite(valor) || valor <= 0) throw new Error('valor inválido de mindicador.cl');

        cache = { value: valor, fetchedAt: now };
        return valor;
    } catch (err) {
        console.error('exchange-rate fetch error:', err);
        const fallback = envFallback();
        // Cachea el fallback también para no martillar la API ante fallos repetidos.
        cache = { value: fallback, fetchedAt: now };
        return fallback;
    }
}

export function getCachedClpPerUsdSync(): number {
    return cache?.value ?? envFallback();
}
