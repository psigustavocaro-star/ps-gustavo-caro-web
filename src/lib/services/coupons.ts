// Validación de cupones server-side. Reglas duras: nunca confiar en el cliente.
// Para una solución a futuro, mover a tabla "Coupon" con expiración, usos y límite por email.

const MIN_FLOW_AMOUNT = 350; // mínimo seguro para pasarela

type CouponResult =
    | { ok: true; amount: number; meta?: Record<string, unknown> }
    | { ok: false; reason: string };

// Whitelist controlada por entorno. Set ADMIN_COUPONS_ENABLED=true para activar test coupons.
function devCouponsEnabled(): boolean {
    return process.env.ADMIN_COUPONS_ENABLED === 'true';
}

export function applyCoupon(rawCoupon: string | undefined, amount: number): CouponResult {
    if (!rawCoupon) return { ok: true, amount };
    const code = rawCoupon.trim().toUpperCase();
    if (code.length === 0) return { ok: true, amount };
    if (code.length > 32) return { ok: false, reason: 'Código inválido' };

    // GUSTAVO10: -10.000 CLP, válido siempre
    if (code === 'GUSTAVO10') {
        const next = Math.max(MIN_FLOW_AMOUNT, amount - 10000);
        return { ok: true, amount: next, meta: { applied: code } };
    }

    // TEST100: solo cuando ADMIN_COUPONS_ENABLED=true (entornos no productivos)
    if (code === 'TEST100') {
        if (!devCouponsEnabled()) {
            return { ok: false, reason: 'Cupón no válido' };
        }
        return { ok: true, amount: MIN_FLOW_AMOUNT, meta: { applied: code, dev: true } };
    }

    return { ok: false, reason: 'Cupón no válido' };
}

export const MIN_PAYMENT_AMOUNT = MIN_FLOW_AMOUNT;
