'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './CookieBanner.module.css';

const STORAGE_KEY = 'psg_cookie_consent_v1';

type ConsentState = 'accepted' | 'rejected' | null;

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) as ConsentState;
            if (!saved) {
                // Pequeño delay para no aparecer instantáneo y competir con LCP
                const t = setTimeout(() => setVisible(true), 600);
                return () => clearTimeout(t);
            }
        } catch {
            // Si localStorage no está disponible, no mostramos banner
        }
    }, []);

    const save = (state: 'accepted' | 'rejected') => {
        try {
            localStorage.setItem(STORAGE_KEY, state);
        } catch {}
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Aviso de cookies">
            <div className={styles.inner}>
                <p className={styles.text}>
                    Este sitio usa cookies estrictamente necesarias para su funcionamiento
                    (sesión, preferencias). No usamos cookies publicitarias ni de perfilamiento.
                    Consulta la <Link href="/cookies">Política de Cookies</Link>.
                </p>
                <div className={styles.buttons}>
                    <button
                        type="button"
                        onClick={() => save('rejected')}
                        className={styles.btnGhost}
                    >
                        Solo esenciales
                    </button>
                    <button
                        type="button"
                        onClick={() => save('accepted')}
                        className={styles.btnPrimary}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
