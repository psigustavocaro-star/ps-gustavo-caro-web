'use client';

import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Credenciales solicitadas por el usuario
        if (email.toLowerCase() === 'psi.gustavocaro@gmail.com' && password === 'gacarom154941') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert('Credenciales incorrectas');
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/data');
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <h1 className={styles.loginTitle}>Panel de Control</h1>
                    <p className={styles.loginDesc}>Ingresa tus credenciales profesionales.</p>
                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                            required
                        />
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className={styles.loginBtn}>Entrar al Sistema</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>Gestión de Pacientes</h1>
                    <p>Visualización de agendamientos y fichas clínicas</p>
                </div>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}>Cerrar Sesión</button>
            </header>

            <main className={styles.main}>
                {isLoading ? (
                    <div className={styles.loading}>Cargando datos maestros...</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Paciente</th>
                                    <th>Servicio</th>
                                    <th>Estado Pago</th>
                                    <th>Motivo</th>
                                    <th>Detalles / Anamnesis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id}>
                                        <td className={styles.dateCell}>
                                            {new Date(b.createdAt).toLocaleDateString('es-CL')}
                                        </td>
                                        <td>
                                            <div className={styles.patientInfo}>
                                                <strong>{b.name}</strong>
                                                <span>{b.email}</span>
                                                {b.phone && <span className={styles.phone}>{b.phone}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.badge}>{b.serviceType}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                                                {b.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                                            </span>
                                        </td>
                                        <td>{b.reason || '-'}</td>
                                        <td className={styles.detailsCell}>
                                            <div className={styles.detailsContent}>
                                                {b.details || 'Sin detalles'}
                                                {b.anamnesis && (
                                                    <div className={styles.anamnesisSection}>
                                                        <hr />
                                                        <strong>Ficha:</strong> {b.anamnesis.age} años - Med: {b.anamnesis.medications}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className={styles.empty}>No hay registros aún en la base de datos.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
