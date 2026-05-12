// Conversor CLP → USD para mostrar precios referenciales en la UI.
// El tipo de cambio se obtiene en runtime desde /api/exchange-rate (mindicador.cl).
// Para SSR/fallback se usa NEXT_PUBLIC_USD_RATE o 950.

export const FALLBACK_CLP_PER_USD = (() => {
    const fromEnv = Number(process.env.NEXT_PUBLIC_USD_RATE);
    if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
    return 950;
})();

export function clpToUsd(amountClp: number, clpPerUsd: number = FALLBACK_CLP_PER_USD): number {
    if (!Number.isFinite(amountClp) || amountClp <= 0) return 0;
    if (!Number.isFinite(clpPerUsd) || clpPerUsd <= 0) clpPerUsd = FALLBACK_CLP_PER_USD;
    return Math.ceil(amountClp / clpPerUsd);
}

export function formatClp(amountClp: number): string {
    return `$${amountClp.toLocaleString('es-CL')} CLP`;
}

export function formatUsd(amountClp: number, clpPerUsd?: number): string {
    return `~ USD $${clpToUsd(amountClp, clpPerUsd)}`;
}
