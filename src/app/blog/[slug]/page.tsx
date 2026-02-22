import { blogPosts } from "@/lib/data/blog";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import styles from "./post.module.css";
import BlogResources from "@/components/Blog/BlogResources";
import BlogCTA from "@/components/Blog/BlogCTA";

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Artículo no encontrado',
        };
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            images: [
                {
                    url: post.image,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [post.image],
        },
    };
}

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

                        {post.resources && <BlogResources resources={post.resources} />}

                        <BlogCTA />

                        <footer className={styles.postFooter}>
                            <div className={styles.author}>
                                <div className={styles.authorInfo}>
                                    <span>Escrito por</span>
                                    <strong>{post.author}</strong>
                                </div>
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

