import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./legal.module.css";

export const metadata = {
    title: 'Política de Cookies',
    description: 'Información sobre el uso de cookies en el sitio web de Ps. Gustavo Caro.',
};

export default function CookiesPage() {
    return (
        <main className={styles.legalPage}>
            <Navbar />
            <div className="container">
                <article className={styles.content}>
                    <h1>Política de Cookies</h1>
                    <p className={styles.updated}>Última actualización: Febrero 2026</p>

                    <section>
                        <h2>1. ¿Qué son las Cookies?</h2>
                        <p>
                            Las cookies son pequeños archivos de texto que los sitios web almacenan
                            en su dispositivo cuando los visita. Se utilizan ampliamente para hacer
                            que los sitios funcionen de manera más eficiente y para proporcionar
                            información a los propietarios del sitio.
                        </p>
                    </section>

                    <section>
                        <h2>2. Cookies que Utilizamos</h2>

                        <h3>2.1 Cookies Técnicas (Necesarias)</h3>
                        <p>
                            Son esenciales para el funcionamiento del sitio. Sin ellas,
                            ciertas funciones no estarían disponibles.
                        </p>
                        <ul>
                            <li><strong>Sesión de usuario:</strong> Mantiene su sesión activa durante la navegación.</li>
                            <li><strong>Preferencias:</strong> Recuerda sus elecciones (como el tema visual).</li>
                        </ul>

                        <h3>2.2 Cookies de Rendimiento</h3>
                        <p>
                            Nos ayudan a entender cómo los visitantes interactúan con el sitio,
                            recopilando información de forma anónima.
                        </p>
                        <ul>
                            <li><strong>Analíticas:</strong> Páginas visitadas, tiempo de permanencia, fuente de tráfico.</li>
                        </ul>

                        <h3>2.3 Cookies de Terceros</h3>
                        <p>
                            Algunos servicios externos pueden establecer sus propias cookies:
                        </p>
                        <ul>
                            <li><strong>Flow (Pasarela de Pago):</strong> Para procesar pagos de forma segura.</li>
                            <li><strong>Google Fonts:</strong> Para cargar tipografías personalizadas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Gestión de Cookies</h2>
                        <p>
                            Puede controlar y/o eliminar las cookies según desee. La mayoría de
                            los navegadores permiten:
                        </p>
                        <ul>
                            <li>Ver qué cookies están almacenadas y eliminarlas individualmente.</li>
                            <li>Bloquear cookies de terceros.</li>
                            <li>Bloquear cookies de sitios específicos.</li>
                            <li>Bloquear todas las cookies.</li>
                            <li>Eliminar todas las cookies al cerrar el navegador.</li>
                        </ul>
                        <p>
                            <strong>Nota:</strong> Si bloquea las cookies, algunas funcionalidades
                            del sitio (como el agendamiento de citas) pueden no funcionar correctamente.
                        </p>
                    </section>

                    <section>
                        <h2>4. Cómo Desactivar Cookies por Navegador</h2>
                        <ul>
                            <li>
                                <strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies
                            </li>
                            <li>
                                <strong>Mozilla Firefox:</strong> Opciones → Privacidad y seguridad → Cookies
                            </li>
                            <li>
                                <strong>Safari:</strong> Preferencias → Privacidad → Cookies
                            </li>
                            <li>
                                <strong>Microsoft Edge:</strong> Configuración → Cookies y permisos del sitio
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Consentimiento</h2>
                        <p>
                            Al continuar navegando en nuestro sitio web, usted acepta el uso de
                            cookies técnicas necesarias para su funcionamiento. Para cookies
                            analíticas o de marketing, solicitamos su consentimiento explícito.
                        </p>
                    </section>

                    <section>
                        <h2>6. Más Información</h2>
                        <p>
                            Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en:
                        </p>
                        <ul>
                            <li><strong>Email:</strong> psi.gustavocaro@gmail.com</li>
                        </ul>
                    </section>
                </article>
            </div>
            <Footer />
        </main>
    );
}
