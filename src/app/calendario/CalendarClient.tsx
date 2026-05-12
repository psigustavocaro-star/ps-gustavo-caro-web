'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CustomCalendar from "@/components/Booking/CustomCalendar";
import styles from "./calendario.module.css";

export default function CalendarClient() {
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/bookings/occupied', { cache: 'no-store' })
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.success) setOccupiedSlots(d.occupiedSlots || []);
            })
            .catch(err => console.error('Error fetching occupied slots:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleViewOnly = () => {
        window.location.href = '/agendar';
    };

    return (
        <main>
            <Navbar />
            <div className={styles.hero}>
                <div className="container">
                    <h1 className={styles.title}>Disponibilidad en Tiempo Real</h1>
                    <p className={styles.subtitle}>
                        Consulta los horarios disponibles. Los slots marcados ya están reservados.
                    </p>
                </div>
            </div>

            <section className={styles.calendarSection}>
                <div className="container">
                    <div className={styles.calendarCard}>
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--foreground-light)' }}>
                                Cargando disponibilidad...
                            </p>
                        ) : (
                            <CustomCalendar
                                onSelectDateTime={handleViewOnly}
                                bookedSlots={occupiedSlots}
                            />
                        )}
                    </div>
                    <div className={styles.info}>
                        <p><strong>Nota:</strong> Este calendario es solo para consulta. Para asegurar tu hora y recibir la boleta electrónica, utiliza el <a href="/agendar">formulario de reserva principal</a>.</p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
