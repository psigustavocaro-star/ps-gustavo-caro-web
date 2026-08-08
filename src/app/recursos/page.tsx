import type { Metadata } from 'next';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ResourcesLibrary from '@/components/Resources/ResourcesLibrary';
import styles from './recursos.module.css';

export const metadata: Metadata = {
    title: 'Recursos gratuitos de psicologia y TCC',
    description: 'Guías gratuitas de psicología y Terapia Cognitivo Conductual para ansiedad, sobrecarga, primera sesión y organización cotidiana.',
    alternates: { canonical: '/recursos' },
    keywords: ['recursos TCC gratuitos', 'herramientas ansiedad', 'guia primera sesion psicologica', 'psicologia Chile'],
};

export default function RecursosPage() {
    return (
        <main className={styles.page}>
            <Navbar />
            <header className={styles.hero}>
                <div className="container">
                    <p>Biblioteca de apoyo</p>
                    <h1>Recursos gratuitos de psicología</h1>
                    <span>Material breve, claro y descargable para acompañar tu día a día.</span>
                </div>
            </header>
            <ResourcesLibrary />
            <Footer />
        </main>
    );
}
