import Link from 'next/link';
import Image from 'next/image';
import styles from './BlogSection.module.css';
import { blogPosts } from '@/lib/data/blog';

export default function BlogSection() {
    // Tomar los últimos 3 posts
    const latestPosts = blogPosts.slice(0, 3);

    return (
        <section className={styles.blog} id="blog">
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>Blog y Recursos</h2>
                    <p className={styles.subtitle}>
                        Reflexiones y herramientas para tu bienestar emocional y crecimiento personal.
                    </p>
                </div>

                <div className={styles.grid}>
                    {latestPosts.map((post) => (
                        <article key={post.slug} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className={styles.image}
                                />
                                <span className={styles.category}>{post.category}</span>
                            </div>
                            <div className={styles.content}>
                                <span className={styles.date}>{new Date(post.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <h3 className={styles.postTitle}>{post.title}</h3>
                                <p className={styles.excerpt}>{post.excerpt}</p>
                                <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                                    Leer artículo <span>→</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <div className={styles.footer}>
                    <Link href="/blog" className="btn-outline">
                        Ver todos los artículos
                    </Link>
                </div>
            </div>
        </section>
    );
}
