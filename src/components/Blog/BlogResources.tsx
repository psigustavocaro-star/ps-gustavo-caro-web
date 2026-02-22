
'use client';

import { jsPDF } from 'jspdf';
import { BlogResource } from '@/lib/data/blog';
import styles from './BlogResources.module.css';

interface BlogResourcesProps {
    resources: BlogResource[];
}

export default function BlogResources({ resources }: BlogResourcesProps) {
    const handleDownload = (resource: BlogResource) => {
        const doc = new jsPDF();

        // Estilos del PDF
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(8, 145, 178); // Color primario
        doc.text('Ps. Gustavo Caro', 105, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(51, 65, 85);
        doc.text(resource.title, 105, 30, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 35, 190, 35);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);

        // El contenido se divide por líneas
        const lines = doc.splitTextToSize(resource.content, 170);
        doc.text(lines, 20, 45);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Documento generado en www.psgustavocaro.cl', 105, 285, { align: 'center' });

        doc.save(`${resource.id}-ps-gustavo-caro.pdf`);
    };

    if (!resources || resources.length === 0) return null;

    return (
        <div className={styles.resourcesWrapper}>
            <h3 className={styles.resourcesTitle}>Recursos TCC Gratuitos</h3>
            <p className={styles.resourcesDesc}>
                He preparado estas herramientas prácticas para que puedas comenzar a trabajar en tu bienestar hoy mismo.
            </p>
            <div className={styles.grid}>
                {resources.map((resource) => (
                    <div key={resource.id} className={styles.resourceCard}>
                        <div className={styles.icon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <div className={styles.info}>
                            <h4>{resource.title}</h4>
                            <p>{resource.description}</p>
                        </div>
                        <button
                            className={styles.downloadBtn}
                            onClick={() => handleDownload(resource)}
                        >
                            Descargar PDF
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
