
'use client';

import { useState } from 'react';
import styles from './WorkshopForm.module.css';

export default function WorkshopForm({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        institution: '',
        topic: '',
        details: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const message = `Hola Ps. Gustavo, me gustaría cotizar una capacitación/taller:
- Nombre: ${formData.name}
- Institución: ${formData.institution}
- Temática: ${formData.topic}
- Detalles: ${formData.details}`;

        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/56936319102?text=${encoded}`, '_blank');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                <h2 className={styles.title}>Cotizar Capacitación o Taller</h2>
                <p className={styles.desc}>Orientado a Psicología Educacional y Clínica para instituciones o grupos.</p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Nombre completo / Contacto"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Institución (Colegio, Empresa, etc.)"
                        value={formData.institution}
                        onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    />
                    <select
                        required
                        value={formData.topic}
                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    >
                        <option value="">Selecciona una temática</option>
                        <option value="Convivencia Escolar">Convivencia Escolar y Clima</option>
                        <option value="Salud Mental Docente">Salud Mental Docente (Autocuidado)</option>
                        <option value="TDAH en el Aula">TDAH y Neurodiversidad en el Aula</option>
                        <option value="Ansiedad y Stress">Manejo de Ansiedad y Stress</option>
                        <option value="Habilidades Parentales">Habilidades Parentales (Taller para familias)</option>
                        <option value="Otro">Otro (Especificar en detalles)</option>
                    </select>
                    <textarea
                        placeholder="Detalles adicionales, número de personas, fechas probables..."
                        rows={4}
                        value={formData.details}
                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                    ></textarea>
                    <button type="submit" className={styles.submitBtn}>
                        Enviar solicitud por WhatsApp
                    </button>
                </form>
            </div>
        </div>
    );
}
