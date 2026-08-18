import type { Metadata } from 'next';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ConfirmClient from './ConfirmClient';
import styles from '../../privacidad/legal.module.css';

export const metadata: Metadata = {
    title: 'Confirmar suscripción',
    description: 'Confirma tu suscripción al newsletter de Ps. Gustavo Caro.',
    robots: { index: false, follow: false },
};

export default function ConfirmPage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Confirmar suscripción</h1>
                    <ConfirmClient />
                </article>
            </div>
            <Footer />
        </main>
    );
}
