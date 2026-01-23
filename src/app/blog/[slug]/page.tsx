import { blogPosts } from "@/lib/data/blog";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./post.module.css";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <main>
            <Navbar />
            <article className={styles.post}>
                <header className={styles.header}>
                    <div className="container">
                        <Link href="/blog" className={styles.back}>
                            ← Volver al Blog
                        </Link>
                        <div className={styles.meta}>
                            <span className={styles.category}>{post.category}</span>
                            <span className={styles.dot}>•</span>
                            <time className={styles.date}>{new Date(post.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                        </div>
                        <h1 className={styles.title}>{post.title}</h1>
                        <p className={styles.excerpt}>{post.excerpt}</p>
                    </div>
                </header>

                <div className={styles.mainImageWrapper}>
                    <div className="container">
                        <div className={styles.imageContainer}>
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className={styles.image}
                                priority
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.contentWrapper}>
                    <div className="container">
                        <div className={styles.body} dangerouslySetInnerHTML={{ __html: post.content }} />

                        <footer className={styles.postFooter}>
                            <div className={styles.author}>
                                <div className={styles.authorInfo}>
                                    <span>Escrito por</span>
                                    <strong>{post.author}</strong>
                                </div>
                            </div>
                            <div className={styles.cta}>
                                <h3>¿Te gustaría profundizar en este tema?</h3>
                                <p>Agenda una sesión para trabajar en tus objetivos de forma personalizada.</p>
                                <Link href="/#agendar" className="btn-primary">
                                    Agendar una sesión
                                </Link>
                            </div>
                        </footer>
                    </div>
                </div>
            </article>
            <Footer />
        </main>
    );
}

// Generar rutas estáticas para mejor performance
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}
