import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from './SEOLanding.module.css';

type FAQItem = {
    question: string;
    answer: string;
};

type SEOLandingProps = {
    eyebrow: string;
    title: string;
    description: string;
    service: string;
    benefits: string[];
    process: string[];
    faqs: FAQItem[];
};

export default function SEOLanding({ eyebrow, title, description, service, benefits, process, faqs }: SEOLandingProps) {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <main className={styles.page}>
            <Navbar />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <section className={styles.hero}>
                <div className="container">
                    <p className={styles.eyebrow}>{eyebrow}</p>
                    <h1>{title}</h1>
                    <p className={styles.description}>{description}</p>
                    <div className={styles.actions}>
                        <Link href="/agendar" className={styles.primaryAction}>Agendar hora</Link>
                        <Link href="/blog" className={styles.secondaryAction}>Leer recursos</Link>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className="container">
                    <div className={styles.grid}>
                        <div>
                            <span className={styles.kicker}>Servicio</span>
                            <h2>{service}</h2>
                            <p>
                                Un espacio profesional para comprender lo que estas viviendo, ordenar objetivos y trabajar con herramientas clinicas claras, desde un trato cercano y respetuoso.
                            </p>
                        </div>
                        <div className={styles.panel}>
                            <h3>Puede ayudarte si buscas</h3>
                            <ul>
                                {benefits.map((benefit) => (
                                    <li key={benefit}>{benefit}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.band}>
                <div className="container">
                    <span className={styles.kicker}>Proceso</span>
                    <h2>Como trabajamos</h2>
                    <div className={styles.steps}>
                        {process.map((item, index) => (
                            <article key={item}>
                                <strong>{index + 1}</strong>
                                <p>{item}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className="container">
                    <span className={styles.kicker}>Preguntas frecuentes</span>
                    <h2>Dudas habituales antes de agendar</h2>
                    <div className={styles.faqs}>
                        {faqs.map((faq) => (
                            <article key={faq.question}>
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                    <div className={styles.finalCta}>
                        <p>Si quieres revisar horarios disponibles, puedes agendar directamente desde el sitio.</p>
                        <Link href="/agendar" className={styles.primaryAction}>Ver disponibilidad</Link>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
