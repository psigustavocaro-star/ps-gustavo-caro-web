import Link from 'next/link';
import { clinicalResources } from '@/lib/data/resources';
import BlogResources from '@/components/Blog/BlogResources';
import styles from './ResourcesLibrary.module.css';

type ResourcesLibraryProps = {
    compact?: boolean;
};

export default function ResourcesLibrary({ compact = false }: ResourcesLibraryProps) {
    const resources = compact ? clinicalResources.slice(0, 3) : clinicalResources;

    return (
        <section className={styles.section} id="recursos">
            <div className="container">
                <div className={styles.heading}>
                    <p className={styles.eyebrow}>Recursos gratuitos</p>
                    <h2>Herramientas para empezar con algo concreto</h2>
                    <p>Guías breves basadas en principios de TCC. No reemplazan un proceso terapéutico, pero pueden ayudarte a ordenar una situación y dar un primer paso.</p>
                </div>
                <BlogResources resources={resources} />
                {compact && (
                    <Link href="/recursos" className={styles.moreLink}>Ver todos los recursos</Link>
                )}
            </div>
        </section>
    );
}
