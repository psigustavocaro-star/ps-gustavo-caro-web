import type { Metadata } from 'next';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import UnsubscribeClient from './UnsubscribeClient';
import styles from '../../privacidad/legal.module.css';

export const metadata: Metadata = {
    title: 'Darse de baja del newsletter',
    description: 'Confirma la baja del envío de comunicaciones.',
    robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Darse de baja del newsletter</h1>
                    <UnsubscribeClient />
                </article>
            </div>
            <Footer />
        </main>
    );
}
