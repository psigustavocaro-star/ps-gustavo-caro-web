'use client';

import { useState } from 'react';
import styles from './Newsletter.module.css';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/newsletter/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus('success');
                setMessage('¡Gracias por suscribirte!');
                setEmail('');
            } else {
                throw new Error('Error al suscribirse');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Hubo un error. Inténtalo de nuevo.');
        }
    };

    return (
        <section className={styles.newsletter}>
            <div className="container">
                <div className={styles.card}>
                    <div className={styles.content}>
                        <h2 className={styles.title}>Novedades y Salud Mental</h2>
                        <p className={styles.desc}>
                            Suscríbete para recibir consejos, artículos y novedades directamente en tu email.
                            Sin spam, solo contenido de valor.
                        </p>
                    </div>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={styles.input}
                                disabled={status === 'loading'}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'Enviando...' : 'Suscribirme'}
                            </button>
                        </div>
                        {status === 'success' && <p className={styles.success}>{message}</p>}
                        {status === 'error' && <p className={styles.error}>{message}</p>}
                    </form>
                </div>
            </div>
        </section>
    );
}
