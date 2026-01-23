import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import BlogSection from "@/components/Blog/BlogSection";
import styles from "./blog.module.css";

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
