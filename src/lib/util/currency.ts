// Conversor CLP → USD para mostrar precios referenciales en la UI.
// El tipo de cambio se configura en NEXT_PUBLIC_USD_RATE (CLP por 1 USD).
// Fallback razonable: 950 CLP por USD. Ajustar según mercado.

export const CLP_PER_USD = (() => {
    const fromEnv = Number(process.env.NEXT_PUBLIC_USD_RATE);
    if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
    return 950;
})();

export function clpToUsd(amountClp: number): number {
    if (!Number.isFinite(amountClp) || amountClp <= 0) return 0;
    // Redondeo hacia arriba al entero más cercano (PayPal cobra al menos eso).
    return Math.ceil(amountClp / CLP_PER_USD);
}

export function formatClp(amountClp: number): string {
    return `$${amountClp.toLocaleString('es-CL')} CLP`;
}

export function formatUsd(amountClp: number): string {
    const usd = clpToUsd(amountClp);
    return `~ USD $${usd}`;
}
