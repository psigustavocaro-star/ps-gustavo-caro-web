import { Metadata } from 'next';
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import BlogSection from "@/components/Blog/BlogSection";
import styles from "./blog.module.css";

export const metadata: Metadata = {
    title: 'Blog y Recursos',
    description: 'Artículos sobre salud mental, ansiedad, depresión, TDAH y más. Recursos descargables y herramientas TCC para tu bienestar.',
    openGraph: {
        title: 'Blog y Recursos | Ps. Gustavo Caro',
        description: 'Artículos sobre salud mental y recursos TCC para tu bienestar emocional.',
    },
};

export default function BlogListPage() {
    return (
        <main>
            <Navbar />
            <div className={styles.hero}>
                <div className="container">
                    <h1 className={styles.title}>Blog y Recursos</h1>
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

