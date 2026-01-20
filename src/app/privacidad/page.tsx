import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "../legal.module.css";

export default function Privacidad() {
    return (
        <main>
            <Navbar />
            <div className={styles.legalPage}>
                <div className="container">
                    <div className={styles.content}>
                        <h1 className={styles.title}>Política de Privacidad</h1>

                        <section className={styles.section}>
                            <h2>1. Protección de Datos</h2>
                            <p>
                                Ps. Gustavo Caro se compromete a proteger la privacidad de los usuarios. Los datos personales recolectados a través de formularios
                                (agendamiento y anamnesis) son tratados con la más estricta confidencialidad bajo el secreto profesional.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>2. Finalidad de los Datos</h2>
                            <p>
                                Los datos se recolectan con el único fin de:
                            </p>
                            <ul>
                                <li>Gestionar las citas y agendamientos.</li>
                                <li>Prestar servicios de psicoterapia adecuadamente.</li>
                                <li>Emitir boletas de honorarios electrónicas.</li>
                                <li>Contactar al paciente para asuntos relativos a su tratamiento.</li>
                            </ul>
                        </section>

                        <section className={styles.section}>
                            <h2>3. Almacenamiento Seguro</h2>
                            <p>
                                Contamos con medidas técnicas y organizativas para evitar la pérdida o uso no autorizado de su información.
                                La ficha clínica (anamnesis) es especialmente sensible y solo es accesible por el profesional a cargo.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>4. Sus Derechos</h2>
                            <p>
                                Usted puede solicitar en cualquier momento el acceso, rectificación o eliminación de sus datos personales
                                enviando un correo a contacto@psgustavocaro.cl.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
