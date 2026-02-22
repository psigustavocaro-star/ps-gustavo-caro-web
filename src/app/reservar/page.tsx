import { Metadata } from 'next';
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Booking from "@/components/Booking/Booking";
import styles from "./reservar.module.css";

export const metadata: Metadata = {
    title: 'Agendar Sesión',
    description: 'Reserva tu sesión de psicoterapia online con Ps. Gustavo Caro. Elige el horario que mejor te acomode.',
    openGraph: {
        title: 'Agendar Sesión | Ps. Gustavo Caro',
        description: 'Reserva tu sesión de psicoterapia online. Atención profesional con enfoque TCC.',
    },
};

export default function ReservarPage() {
    return (
        <main className={styles.page}>
            <Navbar />
            <div className={styles.content}>
                <div className="container">
                    <div className={styles.header}>
                        <h1>Agendar tu Sesión</h1>
                        <p>Selecciona el tipo de atención y elige el horario que mejor te acomode.</p>
                    </div>
                </div>
                <Booking />
            </div>
            <Footer />
        </main>
    );
}
