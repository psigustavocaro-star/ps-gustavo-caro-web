import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "../legal.module.css";

export default function Cookies() {
    return (
        <main>
            <Navbar />
            <div className={styles.legalPage}>
                <div className="container">
                    <div className={styles.content}>
                        <h1 className={styles.title}>Política de Cookies</h1>

                        <section className={styles.section}>
                            <h2>¿Qué son las Cookies?</h2>
                            <p>
                                Las cookies son pequeños archivos de texto que se descargan en su equipo al acceder a determinadas páginas web.
                                Permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Cookies Usadas en este Sitio</h2>
                            <p>Este sitio utiliza principalmente:</p>
                            <ul>
                                <li><strong>Cookies Técnicas:</strong> Esenciales para el funcionamiento del sistema de agendamiento y pago.</li>
                                <li><strong>Cookies de Análisis:</strong> (Opcional) Para entender cómo los usuarios interactúan con el sitio y mejorar la experiencia.</li>
                            </ul>
                        </section>

                        <section className={styles.section}>
                            <h2>Gestión de las Cookies</h2>
                            <p>
                                Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador
                                instalado en su ordenador. Tenga en cuenta que si bloquea las cookies técnicas, algunas funcionalidades (como el pago) podrían no funcionar.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
