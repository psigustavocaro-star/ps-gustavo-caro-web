import { Metadata } from 'next';
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import BlogSection from "@/components/Blog/BlogSection";
import styles from "./blog.module.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Blog de Salud Mental, Ansiedad, TDAH y Terapia TCC Online',
    description: 'Artículos de psicología clínica sobre ansiedad, TDAH adulto, autismo, terapia cognitivo conductual, sueño, límites y salud mental en Chile.',
    keywords: ['blog salud mental Chile', 'psicólogo online Chile', 'terapia cognitivo conductual', 'ansiedad', 'TDAH adulto', 'autismo adulto', 'psicoterapia online'],
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'Blog de Salud Mental y Terapia TCC | Ps. Gustavo Caro',
        description: 'Recursos clínicos y psicoeducativos para ansiedad, TDAH, autismo, sueño, relaciones y bienestar emocional.',
        url: '/blog',
    },
};

export default function BlogListPage() {
    return (
        <main>
            <Navbar />
            <div className={styles.hero}>
                <div className="container">
                    <h1 className={styles.title}>Blog <span>& Recursos</span></h1>
                    <p className={styles.subtitle}>
                        Un espacio dedicado a compartir conocimientos, herramientas y reflexiones sobre la salud mental desde un enfoque clínico y humano.
                    </p>
                </div>
            </div>
            <BlogSection />
            <Footer />
        </main>
    );
}

