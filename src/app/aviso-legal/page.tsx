import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "../legal.module.css";

export default function AvisoLegal() {
    return (
        <main>
            <Navbar />
            <div className={styles.legalPage}>
                <div className="container">
                    <div className={styles.content}>
                        <h1 className={styles.title}>Aviso Legal</h1>

                        <section className={styles.section}>
                            <h2>1. Información General</h2>
                            <p>
                                En cumplimiento con el deber de información, se facilitan los siguientes datos del titular:
                                El titular del sitio web es Ps. Gustavo Caro, Psicólogo Clínico, con domicilio en Santiago, Chile.
                                Correo electrónico de contacto: contacto@psgustavocaro.cl
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>2. Condiciones de Uso</h2>
                            <p>
                                El acceso y uso de este sitio web atribuye la condición de usuario, aceptando desde dicho momento los presentes términos.
                                El sitio web proporciona acceso a información, servicios y datos relacionados con la salud mental y psicoterapia.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>3. Propiedad Intelectual</h2>
                            <p>
                                Todos los contenidos de este sitio (textos, imágenes, diseño) son propiedad de Ps. Gustavo Caro o de sus licenciantes.
                                Queda prohibida la reproducción total o parcial sin autorización previa.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>4. Limitación de Responsabilidad</h2>
                            <p>
                                La información contenida en este sitio es de carácter informativo. No sustituye la consulta profesional ni debe utilizarse para autodiagnóstico.
                                En caso de emergencia o crisis, el usuario debe acudir a los servicios de urgencia o llamar al *4141.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
