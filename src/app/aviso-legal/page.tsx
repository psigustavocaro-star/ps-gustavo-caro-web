import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./legal.module.css";

export const metadata = {
    title: 'Aviso Legal',
    description: 'Aviso legal y términos de uso del sitio web de Ps. Gustavo Caro.',
};

export default function AvisoLegalPage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Aviso Legal</h1>
                    <p className={styles.updated}>Última actualización: Febrero 2026</p>

                    <section>
                        <h2>1. Identificación del Titular</h2>
                        <p>
                            Este sitio web es propiedad de <strong>Gustavo Caro</strong>, Psicólogo Clínico
                            con Especialización en Terapia Cognitivo Conductual por la Universidad de Chile.
                        </p>
                        <ul>
                            <li><strong>Nombre Profesional:</strong> Ps. Gustavo Caro</li>
                            <li><strong>Correo Electrónico:</strong> psi.gustavocaro@gmail.com</li>
                            <li><strong>Ubicación:</strong> Santiago, Chile</li>
                            <li><strong>Modalidad de Atención:</strong> 100% Online</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Objeto y Ámbito de Aplicación</h2>
                        <p>
                            El presente Aviso Legal regula el acceso y uso del sitio web
                            <strong> psgustavocaro.cl</strong> (en adelante, "el Sitio").
                            Al acceder y utilizar este Sitio, usted acepta cumplir con los términos aquí establecidos.
                        </p>
                    </section>

                    <section>
                        <h2>3. Propiedad Intelectual</h2>
                        <p>
                            Todos los contenidos del Sitio, incluyendo textos, imágenes, logotipos,
                            diseños gráficos, recursos descargables y estructuras de navegación,
                            son propiedad exclusiva del titular o se utilizan con la debida autorización.
                            Queda prohibida su reproducción, distribución o modificación sin
                            autorización expresa por escrito.
                        </p>
                    </section>

                    <section>
                        <h2>4. Limitación de Responsabilidad</h2>
                        <p>
                            La información contenida en este Sitio tiene carácter exclusivamente
                            informativo y educativo. <strong>No constituye diagnóstico, tratamiento
                                ni consejo médico o psicológico individualizado.</strong>
                        </p>
                        <p>
                            El titular no se responsabiliza de:
                        </p>
                        <ul>
                            <li>Decisiones tomadas en base a la información general del Sitio.</li>
                            <li>Interrupciones técnicas o errores de acceso.</li>
                            <li>Contenidos de sitios web externos enlazados.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Atención de Emergencias</h2>
                        <p className={styles.warning}>
                            ⚠️ <strong>Este sitio NO atiende emergencias psiquiátricas ni situaciones de crisis.</strong>
                        </p>
                        <p>
                            Si usted o alguien que conoce se encuentra en una situación de crisis
                            o riesgo vital, por favor contacte a:
                        </p>
                        <ul>
                            <li><strong>Fono Salud Responde:</strong> 600 360 7777</li>
                            <li><strong>Línea de Prevención del Suicidio:</strong> *4141</li>
                            <li><strong>Urgencias:</strong> Acuda al servicio de urgencias más cercano.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Legislación Aplicable</h2>
                        <p>
                            Este Aviso Legal se rige por la legislación vigente en la República de Chile.
                            Para cualquier controversia derivada del uso de este Sitio, las partes se
                            someten a los tribunales competentes de Santiago.
                        </p>
                    </section>

                    <section>
                        <h2>7. Modificaciones</h2>
                        <p>
                            El titular se reserva el derecho de modificar este Aviso Legal en cualquier momento.
                            Las modificaciones entrarán en vigor desde su publicación en el Sitio.
                        </p>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    );
}
