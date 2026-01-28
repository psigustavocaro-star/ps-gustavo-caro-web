'use client';

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CustomCalendar from "@/components/Booking/CustomCalendar";
import styles from "./calendario.module.css";

export default function CalendarPage() {
    // Solo mostrar disponibilidad sin acción
    const handleViewOnly = (date: Date, time: string) => {
        // Redirigir al formulario de reserva principal
        window.location.href = '/#agendar';
    };

    return (
        <main>
            <Navbar />
            <div className={styles.hero}>
                <div className="container">
                    <h1 className={styles.title}>Disponibilidad en Tiempo Real</h1>
                    <p className={styles.subtitle}>
                        Consulta los horarios disponibles para nuestras sesiones. Selecciona el servicio que necesitas para ver el calendario específico.
                    </p>
                </div>
            </div>

            <section className={styles.calendarSection}>
                <div className="container">
                    <div className={styles.calendarCard}>
                        <CustomCalendar
                            onSelectDateTime={handleViewOnly}
                            bookedSlots={[]}
                        />
                    </div>
                    <div className={styles.info}>
                        <p><strong>Nota:</strong> Este calendario es solo para consulta. Para asegurar tu hora y recibir la boleta electrónica, por favor utiliza el <a href="/#agendar">formulario de reserva principal</a>.</p>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
