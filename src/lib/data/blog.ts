import { clinicalResources, type ClinicalResource } from './resources';

export type BlogResource = ClinicalResource;

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    category: 'Salud Mental' | 'Neurodiversidad' | 'Ansiedad' | 'Opinión' | 'Recursos';
    image: string;
    keywords?: string[];
    resources?: BlogResource[];
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'ansiedad-social-metro-santiago',
        title: 'Sobrevivir a la hora punta: Ansiedad social en el Metro de Santiago',
        excerpt: 'Cómo el hacinamiento y el ruido del transporte público afectan nuestro sistema nervioso y qué técnicas basadas en la ciencia usar para regularnos.',
        date: '2024-04-10',
        author: 'Ps. Gustavo Caro',
        category: 'Ansiedad',
        image: '/blog_ansiedad_santiago_1776137206965.png',
        content: `
            <p>Para cientos de miles de santiaguinos, el verdadero desafío del día no comienza en sus puestos de trabajo, sino en el andén de Baquedano, Tobalaba o Los Héroes. El Metro de Santiago, si bien es una maravilla de ingeniería urbana, representa uno de los mayores desencadenantes diarios para quienes lidian con ansiedad social, agorafobia o hipersensibilidad sensorial, activando respuestas de lucha o huida de manera constante.</p>
            
            <h3>La Neurobiología del Hacinamiento</h3>
            <p>Cuando nos encontramos rodeados de desconocidos en un espacio reducido durante la hora punta, nuestro sistema nervioso simpático interpreta la falta de distancia interpersonal como una amenaza inminente. El contacto físico involuntario, los ruidos por encima de los 80 decibeles y la restricción de movimiento disparan la segregación de cortisol y adrenalina. Esto no es debilidad mental; es neurobiología evolutiva pura.</p>
            
            <blockquote>"La ansiedad es como una mecedora: te da algo que hacer, pero no te lleva a ninguna parte." — Albert Ellis, padre de la Terapia Racional Emotiva Conductual (TREC).</blockquote>
            
            <h3>Técnicas de Intervención en Tránsito</h3>
            <p>La evasión perpetua del transporte público no es una solución realista ni terapéutica, pues fomenta conductas de evitación. En cambio, recomiendo herramientas estructuradas de Terapia Cognitivo-Conductual (TCC) adaptadas al entorno urbano:</p>
            <ul>
                <li><strong>Desensibilización Sistemática:</strong> Comienza utilizando el metro un par de estaciones en horas valle antes de forzarte a enfrentar la hora punta.</li>
                <li><strong>El Enraizamiento 5-4-3-2-1:</strong> Para desactivar un ataque de pánico incipiente, obliga a tu corteza prefrontal a trabajar: nombra mentalmente 5 objetos visibles (una manilla, un cartel), 4 cosas palpables (tu bolso, el asiento), 3 sonidos (rieles, voces), 2 olores y 1 sabor.</li>
                <li><strong>Regulación por Supresión Auditiva:</strong> El uso de audífonos con cancelación activa de ruido es una de las "prótesis psicológicas" más eficientes documentadas para la integración sensorial en neurodivergentes.</li>
            </ul>
        `
    },
    {
        slug: 'tdah-adulto-oficinas-santiago',
        title: 'TDAH Adulto: El desafío invisible en Sanhattan',
        excerpt: 'Trabajar en los centros financieros exige una atención lineal que el cerebro neurodivergente no posee. Cómo transformar tu TDAH en una ventaja corporativa.',
        date: '2024-04-08',
        author: 'Ps. Gustavo Caro',
        category: 'Neurodiversidad',
        image: '/blog_tdah_oficina_1776137223131.png',
        content: `
            <p>El Trastorno por Déficit de Atención e Hiperactividad (TDAH) en adultos a menudo es malinterpretado como "falta de compromiso" o "deficiencia de voluntad". En realidad, representa una divergencia profunda en la arquitectura química del cerebro, específicamente en la recaptación de dopamina y norepinefrina. En barrios de alta presión como El Golf o Nueva Las Condes —el corazón de Sanhattan— las expectativas de productividad mantienen un sesgo hacia la linealidad que asfixia al talento neurodivergente.</p>
            
            <blockquote>"El TDAH no se trata de no poder prestar atención; se trata de prestar atención a todo y no tener la capacidad de filtrar lo irrelevante." — Dr. Edward Hallowell, psiquiatra y experto mundial.</blockquote>
            
            <h3>El Enemigo del Open Space</h3>
            <p>La cultura arquitectónica moderna ha priorizado las oficinas de plano abierto sin considerar sus ramificaciones cognitivas. Para un profesional con TDAH, un entorno sin barreras acústicas ni visuales drena su 'reserva ejecutiva' antes del mediodía. El esfuerzo requerido para suprimir los estímulos periféricos inhibe la capacidad directa de generar trabajo profundo (Deep Work).</p>
            
            <h3>Estrategias de Regulación Cerebral</h3>
            <p>Si operas bajo el espectro del TDAH en el mundo financiero, la adaptación de tu entorno es un acto médico:</p>
            <ul>
                <li><strong>Ingeniería del Entorno:</strong> Instituye "horas silenciosas" protegidas bloqueadas en tu calendario donde la respuesta a correos queda suspendida.</li>
                <li><strong>Ciclismo Dopaminérgico:</strong> Tu cerebro responde al interés, no a la importancia. Desglosa tareas masivas en micro-hitos de no más de 20 minutos e introdúceles un sistema de recompensas inmediatas.</li>
                <li><strong>Reestructuración del Escritorio:</strong> Adopta políticas estrictas de minimalismo físico. Menos objetos visuales se traduce en menos "pestañas abiertas" en tu cerebro.</li>
            </ul>
        `
    },
    {
        slug: 'estigma-salud-mental-familias-chilenas',
        title: 'El "No Sea Llorón": Rompiendo el estigma en la familia chilena',
        excerpt: 'Por qué a las estructuras conservadoras locales les cuesta entender que la depresión no es debilidad de carácter, sino una psicopatología letal.',
        date: '2024-04-05',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: '/blog_familias_estigma_1776138828568.png',
        content: `
            <p>Históricamente, en Chile hemos esculpido una cultura de "ponerle el hombro", fomentada por nuestra recurrencia a desastres naturales y crisis sociales. Si bien esto nos ha convertido en una sociedad resiliente frente a los terremotos telúricos, nos ha vuelto peligrosamente insensibles y hasta crueles frente a los "terremotos internos" ajenos y propios. Y no, la salud mental no se arregla trabajando más.</p>
            
            <blockquote>"La curiosa paradoja es que cuando me acepto tal cual soy, entonces, y solo entonces, puedo cambiar." — Carl Rogers, pionero del enfoque humanista.</blockquote>
            
            <h3>La Violencia de la Invalidación</h3>
            <p>Escuchar a un adolescente o a una pareja confesar que no desea vivir más, y responder con frases como <em>"pero si tienes todo, sal a caminar, no seas malagradecido"</em>, es una forma encubierta de violencia emocional. Estas sentencias trivializan condiciones clínicas graves, aumentando el aislamiento del individuo que sufre, elevando estadísticamente el riesgo autolítico (suicida).</p>
            
            <h3>Psicoeducación Familiar: El Verdadero Cambio</h3>
            <p>Es imperativo establecer en los hogares chilenos una premisa innegociable: la mente enferma como enferma un riñón o un pulmón. Nadie le exigiría a un familiar con fractura de fémur que corra una maratón únicamente basado en la "fuerza de voluntad". La neurobiología de un cerebro deprimido muestra atrofia del hipocampo y agotamiento de neurotransmisores. Necesitamos cambiar el juicio moral por la compasión clínica.</p>
        `
    },
    {
        slug: 'ritmo-frenetico-santiago-cortisol',
        title: 'Vivir a Mil: El impacto del ritmo santiaguino en tu cortisol',
        excerpt: 'La ciudad se mueve rápido, y nuestras glándulas suprarrenales pagan el precio. La anatomía del estrés crónico urbano.',
        date: '2024-03-28',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: '/blog_ritmo_estres_santiago_1776138845888.png',
        content: `
            <p>Santiago es una metrópolis que idolatra la productividad sobre la recuperación. Nuestros traslados eternos, el costo de vida hiperinflado y la presión por mantener estatus nos han introducido en lo que en psicología clínica denominamos <em>"Estado de Alerta Perenne"</em>. El estrés dejó de ser un episodio transitorio para convertirse en la textura invisible de la existencia ciudadana.</p>
            
            <blockquote>"La carga alostática es el desgaste que sufre el cuerpo como resultado del estrés crónico, pavimentando el camino a la enfermedad mental y física." — Bruce McEwen, neuroendocrinólogo.</blockquote>
            
            <h3>Endocrinología de la Rutina Capitalina</h3>
            <p>Cuando corres para no perder la micro o te enfrentas a una reunión hostil, tus glándulas suprarrenales bombean cortisol y adrenalina. Este diseño evolutivo nos permitía escapar de depredadores. El problema surge cuando este sistema no se apaga durante 15 horas al día. El cortisol persistentemente alto genera resistencia a la insulina, suprime el sistema inmunológico, destruye la arquitectura de nuestro sueño y facilita el despliegue del Trastorno de Ansiedad Generalizada.</p>
            
            <h3>Estrategias de Descompresión</h3>
            <p>No podemos cambiar las autopistas ni los precios de la ciudad, pero podemos modificar nuestra re-calibración biológica. Integrar pausas intencionales donde el cuerpo reciba la señal biológica de seguridad es fundamental. El uso de la termoterapia (baños calientes), la exposición a la luz solar temprano y los "días de dopamina basal" (desconexión total de pantallas) son hoy un tratamiento de primera línea no farmacológico.</p>
        `
    },
    {
        slug: 'invierno-gris-santiago-depresion',
        title: 'El invierno gris de Santiago: Trastorno Afectivo Estacional',
        excerpt: 'La falta de luz solar en los crudos meses de invierno en la capital chilena tiene un efecto devastador en la producción de serotonina.',
        date: '2024-04-01',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: '/blog_minimal_winter.png',
        content: `
            <p>Durante mayo y agosto, Santiago se cubre de lo que los meteorólogos llaman capa de inversión térmica, encerrando la ciudad no solo en contaminación, sino en un manto gris impenetrable. Esta falta sostenida de lux luminosa genera un impacto bioquímico muy específico que suele precipitar lo que la Asociación Americana de Psiquiatría denomina TAE: Trastorno Afectivo Estacional.</p>
            
            <blockquote>"No es solo tristeza por el frío; es el cerebro respondiendo biológicamente a una reducción de luz, alterando el reloj circadiano maestro." — Instituto Nacional de Salud Mental (NIMH).</blockquote>
            
            <h3>La Depresión Fotodependiente</h3>
            <p>El TAE ocurre porque nuestros ojos mandan señales reducidas al hipotálamo durante el invierno. Consecuentemente, el cerebro deprime la producción de serotonina (el químico del bienestar y la motivación) y sobreproduce melatonina (la hormona del sueño), dejándonos letárgicos y profundamente apáticos. El síntoma clásico es una necesidad biológica abrumadora por aislarse y consumir carbohidratos refinados agresivamente para forzar picos bioquímicos de placer.</p>
            
            <h3>Abordajes Clínicos para el TAE</h3>
            <p>A mis pacientes invernales no les recomiendo "pensar positivo", les recomiendo intervenir su biología:</p>
            <ul>
                <li><strong>Fototerapia Artificial:</strong> El uso de cajas de luz terapéuticas (Lámparas de 10.000 lux) durante 30 minutos al despertar reprograma el ritmo circadiano.</li>
                <li><strong>Suplementación Dirigida:</strong> Bajo supervisión médica, la revisión de los niveles de Vitamina D3 es un mandato preventivo en otoño.</li>
                <li><strong>Activación Conductual TCC:</strong> Obligar a la maquinaria corporal a generar movimiento en horas de luz (ej. caminatas o almuerzos al exterior) combate químicamente la inercia letárgica estacional.</li>
            </ul>
        `
    },
    {
        slug: 'higiene-sueno-ciudad-luces',
        title: 'Dormir en la ciudad que nunca se apaga',
        excerpt: 'Cómo la contaminación lumínica, los teléfonos y el ruido urbano fragmentan tu arquitectura del sueño y dañan tu corteza cerebral.',
        date: '2024-03-25',
        author: 'Ps. Gustavo Caro',
        category: 'Recursos',
        image: '/blog_minimal_hands.png',
        content: `
            <p>El sueño ha sido despojado de su carácter biológico fundamental por la cultura del "Hustle" y ha pasado a ser visto como una pérdida de tiempo. Sin embargo, en el ámbito de la psicología y la neurología clínica, el sueño es innegociable: es el taller de reparación neuroquímica. Vivir en núcleos metropolitanos fuertemente iluminados ha quebrado este ecosistema íntimo.</p>
            
            <blockquote>"El sueño es la mejor medicina que la evolución nos ha otorgado, la madre naturaleza operando para resetear nuestra salud cerebral." — Matthew Walker, neurocientífico y experto mundial en sueño.</blockquote>
            
            <h3>La Trampa de la Luz Azul</h3>
            <p>Mirar TikTok, Instagram o trabajar en el laptop una hora antes de dormir lanza luz enriquecida de espectro azul directo a tu retina. Tu glándula pineal interpreta esto de manera literal: "es de día, deten el flujo de melatonina". El resultado es que tu cuerpo entra a la cama sin el sedante natural más poderoso del planeta. Te acuestas físicamente, pero mentalmente sigues operando.</p>
            
            <h3>El Protocolo de Higiene Profunda</h3>
            <p>Para pacientes con ideación ansiosa nocturna, la estructura de apagado es más importante que la medicación de rescate:</p>
            <ul>
                <li><strong>Toque de Queda Digital:</strong> 60 a 90 minutos antes de dormir, toda pantalla queda fuera del dormitorio. Intercambia estimulación fotónica por lectura analógica.</li>
                <li><strong>Oscuridad Ancestral y Termorregulación:</strong> Asegura "Blackouts" reales en las ventanas y propicia una temperatura ambiental más fría (entre 18 y 20°C). El cuerpo necesita enfriarse para que el sueño profundo prolifere.</li>
                <li><strong>Regla de los 20 Minutos TCC:</strong> Si llevas 20 minutos rodando en la cama con ansiedad, debes levantarte, salir a un ambiente tenue, leer un texto denso hasta bostezar y solo entonces volver. La cama no debe asociarse cognitivamente a la frustración.</li>
            </ul>
        `
    },
    {
        slug: 'resiliencia-aprender-de-las-crisis',
        title: 'Más que sobrevivir: La Resiliencia frente al trauma estructurado',
        excerpt: 'Los chilenos somos expertos en levantarnos tras desastres colosales. Pero, ¿somos realmente resilientes o estamos perpetuamente traumatizados?',
        date: '2024-03-20',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: '/blog_santiago_mountain_resilience_premium_1776139093323.png',
        content: `
            <p>En nuestro paradigma nacional, estar expuestos a catástrofes recurrentes nos ha forjado una reputación. Internacionalmente somos conocidos como una nación que se reconstruye rápidamente, pero desde el observatorio de la salud mental, gran parte de esta autodenominada "resiliencia" esconde un mecanismo psicológico de negación y trauma acumulativo que pagamos a futuro.</p>
            
            <blockquote>"El trauma no es lo que te sucede a ti, es lo que sucede dentro de ti como resultado de lo que te sucede." — Dr. Gabor Maté.</blockquote>
            
            <h3>El Mito de la "Superación Inmediata"</h3>
            <p>Nuestra idiosincrasia exige la recuperación relámpago. Perder un embarazo, sufrir un despido o vivir un asalto violento son eventos que, socialmente, no gozan del permiso pertinente para procesarse. Exigimos a los individuos que "no dejen de producir". La verdadera resiliencia psicológica no significa obviar el dolor ni actuar como si nada hubiese pasado, sino tener la capacidad de navegar entre el sufrimiento y el funcionamiento sin disociarnos de nuestra realidad.</p>
            
            <h3>Hacia una Resiliencia Integradora</h3>
            <p>Si verdaderamente planeamos crecer a partir de la crisis, debemos instituir primero un duelo validado. Experimentar frustración agónica, llorar sin límites de tiempo sociales impuestos, y buscar psicoterapia informada en trauma constituyen la única defensa a largo plazo para que el estrés post-traumático no gane control sistémico sobre la personalidad y la biología cardiovascular del sujeto.</p>
        `
    },
    {
        slug: 'neurodivergencia-sistema-escolar-chileno',
        title: 'Encasillados: La neurodivergencia en el sistema escolar chileno',
        excerpt: 'Opinión científica sobre por qué nuestras escuelas necesitan urgentemente abandonar el modelo industrial y adaptarse a distintas estructuras cerebrales.',
        date: '2024-03-15',
        author: 'Ps. Gustavo Caro',
        category: 'Neurodiversidad',
        image: '/blog_school_classroom_inclusion_1776139110804.png',
        content: `
            <p>El sistema escolar estandarizado en Chile, al igual que en gran parte de occidente, es un remanente innegable de la revolución industrial. Está diseñado para un cerebro "promedio", capacitado para obedecer, mantener postura rígida en una sola silla por jornadas de ocho horas y memorizar de manera auditiva/visual. Cuando introducimos redes neuronales con TDAH, Autismo de nivel 1 u otras neurodivergencias, la tragedia institucional es evidente.</p>
            
            <blockquote>"Todos somos genios. Pero si juzgas a un pez por su habilidad para trepar árboles, vivirá toda su vida pensando que es un estúpido." — Atribuido a Albert Einstein (Reflexión Educativa).</blockquote>
            
            <h3>Patologizando Diferencias Naturales</h3>
            <p>Es común observar a equipos docentes prescribiendo tácitamente intervenciones de paidopsiquiatría para alumnos cuyo único "delito diagnostico" es requerir movimiento corporal para procesar nueva información espacial, o que encuentran el ruido desorganizado del aula sensorialmente lesivo. El gran riesgo es que convertimos formas funcionales y ricas pero variadas de pensar, en "enfermedades a curar" con metilfenidato masivo.</p>
            
            <h3>Por una Pedagogía Neuro-Inclusiva</h3>
            <p>Nuestra infraestructura educativa no requiere parches; necesita ser refundada desde el modelo de la "Discapacidad Creada por el Entorno". Las adaptaciones medioambientales como el diseño universal para el aprendizaje (DUA), los tiempos de escape sensorial y el rechazo a la segregación como castigo son urgentes, permitiendo a la mente divergente explorar su profunda creatividad y fijación apasionada, en lugar de ser constantemente reprendida por lo que no puede fingir ser.</p>
        `
    },
    {
        slug: 'como-elegir-psicologo-chile',
        title: 'No Todos Son Para Ti: Cómo elegir un buen psicólogo',
        excerpt: 'Una guía clínica para encontrar un profesional de la salud que realmente se ajuste a tus necesidades y posea competencias éticas.',
        date: '2024-03-10',
        author: 'Ps. Gustavo Caro',
        category: 'Recursos',
        image: '/blog_minimal_therapy.png',
        content: `
            <p>La oferta de profesionales de la salud psíquica en Chile es amplia, sin embargo, embarcarse en un proceso terapéutico asumiendo ciegamente que "cualquier profesional titulado servirá", es un error riesgoso. Existe abundante evidencia teórica en primera línea clínica advirtiendo que un mal emparejamiento entre profesional y consultante no solo falla en curar, sino que puede inducir traumatización secundaria e iatrogenia (daño clínico derivado de la terapia).</p>
            
            <blockquote>"Docenas de metaanálisis robustos certifican que el 30% al 40% del éxito en el resultado terapéutico se predice estructuralmente por la calidad de la Alianza Terapéutica." — Wampold, The Great Psychotherapy Debate.</blockquote>
            
            <h3>¿Qué buscar en los primeros encuentros?</h3>
            <p>Como paciente en búsqueda activa, la primera entrevista deberías tratarla tú hacia el terapeuta tanto o más como él a ti. Un profesional ético de alta gama jamás se ofenderá frente a un escrutinio asertivo. Debes preguntar por cosas medibles.</p>
            <ul>
                <li><strong>El Enfoque Teórico Claro:</strong> Tu psicólogo debe ser capaz de explicarte en lenguaje no-académico desde qué prisma trabajarán (Cognitivo-Conductual, Sistémico, Psicoanálisis) y por qué hay evidencia de que dicho enfoque funciona para tu constelación sintomática.</li>
                <li><strong>Feedback Sensible:</strong> Si el terapeuta juzga explícitamente tus decisiones, monopoliza el diálogo con monólogos autorreferentes, o minimiza dolencias de manera pasivo-agresiva ("a todos les pasa eso, no es para tanto"), huye. La validación radical es el piso mínimo del espacio de salud.</li>
                <li><strong>Fijación de Objetivos:</strong> Evita a profesionales que visualicen la terapia como un abismo sin fin ni metas. La terapia de alta resolución psicológica evalúa el avance cada sesión y trabaja bajo la meta central de la independencia y dada de alta del individuo.</li>
            </ul>
        `
    },
    {
        slug: 'mitos-terapia-conductual-cognitiva',
        title: 'Mitos y Realidades de la Terapia Cognitivo-Conductual (TCC)',
        excerpt: 'Desmitificando con ciencia dura al enfoque de vanguardia mundial. ¿Es verdaderamente solo para atacar síntomas superficiales?',
        date: '2024-03-05',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: '/blog_minimal_cbt.png',
        content: `
            <p>Frecuentemente eludida por círculos más dogmáticos en la psicología sudamericana catalogándola como "fría" o enfocada solo en el "síntoma como máquina conductual", la Terapia Cognitivo-Conductual (TCC) se yergue sin embargo como el paradigma de psicoterapia respaldado empíricamente a la fecha con más solidez matemática y éxito psiquiátrico registrado institucionalmente en la historia.</p>
            
            <blockquote>"Los hombres no se perturban por las cosas, sino por la visión que tienen de ellas." — Epicteto, pilar filosófico de la base del trabajo cognitivista.</blockquote>
            
            <h3>Refutando el Enfoque "Superficial"</h3>
            <p>El mayor mito alrededor del trabajo terapéutico de la TCC es la asunción de que trata los "síntomas y no la raíz". La TCC postula que la manera en la que aprendimos a procesar la realidad crea redes cognitivas profundas —esquemas nucleares formados usualmente en la matriz familiar infantil—. Nuestro abordaje consiste en penetrar esos esquemas identificando las Distorsiones Cognitivas (como la Inferencia Arbitraria o la Sobregeneralización) que alimentan la patología en tiempo real.</p>
            
            <h3>La Estructura y Empoderamiento del Paciente</h3>
            <p>La TCC devuelve agencia de manera brutal al marginado clínico. A diferencia de las terapias retrospectivas infinitas donde eres espectador pasivo de una interpretación analítica foránea, aquí el rol del paciente es activo 24/7. Evaluamos mediante experimentos conductuales que te obligan a poner a prueba en el mundo real las hipótesis catastróficas que impone la depresión y los trastornos ansiosos, para derribarlos con datos.</p>
        `
    },
    {
        slug: 'ansiedad-redes-sociales-adolescentes',
        title: 'Generación Ansiedad: Depresión Algorítmica y Redes Sociales',
        excerpt: 'La anatomía de cómo el cyberbullying omnipresente y los algoritmos manipulativos despedazan el lóbulo frontal de nuestros jóvenes.',
        date: '2024-03-01',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: '/blog_social_media_anxiety_conceptual_1776139176516.png',
        content: `
            <p>Nuestra juventud carga cicatrices únicas de esta década; conforman la primera generación que no posee ningún refugio biológico real al retirarse del colegio hacia el hogar. Las aflicciones escolares pasadas cesaban al salir por la puerta del campo de educación, pero el patio de recreo digital contemporáneo y el cyberbullying se proyectan invasivamente 24/7 de forma retroiluminada a través de las pantallas en las camas, infiltrándose en las almohadas e impidiendo la desconexión del sistema límbico juvenil.</p>
            
            <blockquote>"Hay solo dos industrias que le llaman a sus usuarios 'usuarios': la industria de las drogas y la industria del Software." — Edward Tufte, The Social Dilemma.</blockquote>
            
            <h3>El Diseño Hostil de los Algoritmos</h3>
            <p>Los cerebros adolescentes, que según neurociencia básica atraviesan la época de menor control de "frenos ejecutivos" y mayor avidez por recompensa social, son presas dóciles frente al diseño hostil y milimétricamente calculado del *scroll* infinito en TikTok y el perfeccionismo narcisista dictado en Instagram. Todo este entramado algorítmico secuestra circuitos y empuja patológicamente a la Comparación Evolutiva a Niveles Globales. Es innegable presenciar un colapso del bienestar anímico ligado umbilicalmente a la adicción a las notificaciones.</p>
            
            <h3>¿Limitar o Formar a la Generación Alfa?</h3>
            <p>Cercenar completamente la vida digital adolescente es utópico y ostracizante. La Terapia requiere hoy alfabetizar el uso conductual de plataformas digitales. Promovemos auditorías digitales periódicas y entrenamos destrezas metacognitivas potentes, enseñando a los jóvenes y padres a visualizar que el teléfono y sus aplicaciones funcionan como tragamonedas mentales de Las Vegas, construyendo fronteras protectoras e invulnerabilidad crítica.</p>
        `
    },
    {
        slug: 'sindrome-impostor-emprendedores',
        title: 'El Síndrome del Impostor Invocado en Sanhattan',
        excerpt: 'Comprendiendo y erradicando esa sombría voz patológica que nos asegura, pese a nuestros éxitos innegables, que todo es un gran fraude.',
        date: '2024-02-25',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: '/blog_impostor_syndrome_reflection_1776139190697.png',
        content: `
            <p>Murales enteros de reconocimientos y maestrías parecen invisibilizarse cognitivamente cuando este destructivo síndrome ataca. En los entornos de alto rendimiento corporativo o el emprendimiento acelerado del país —casi siempre envueltos en expectativas inalcanzables—, subyace un sufrimiento epidémico transversal a ambos géneros: la paralizante convicción psíquica de que serás expuesto y "desenmascarado" irrevocablemente como un farsante intelectual en la próxima reunión.</p>
            
            <blockquote>"El problema con el mundo no es que las personas inteligentes duden de sí mismas, sino que las personas ignorantes están llenas de certezas aplastantes." — Charles Bukowski.</blockquote>
            
            <h3>La Distorsión de la "Minimización Externa"</h3>
            <p>Quienes atraviesan la tormenta del Impostor padecen un sesgo cognitivo brutal (Filtro Mental Negativo); despojan sus méritos personales de toda agencia para transferírselos eternamente a factores abstractos foráneos. "Lo logré porque caíle en gracia al jefe", "solo fue suerte y estar en el momento idóneo". Se configura un escenario trágico donde se rechaza de cuajo metabolizar y poseer sus triunfos como producto orgánico y evidente de sus horas enclaustradas de estudio o destreza clínica/profesional legítima.</p>
            
            <h3>Restaurar y Atacar el Pensamiento Basado en Evidencias</h3>
            <p>La superación no se consigue con simples decretos motivacionales en el espejo. Dentro de los espacios terapéuticos forjamos "Registros de Valía". Exijo a mis pacientes objetivizar brutal y materialmente sus conquistas usando métricas. Al separar contablemente los "Sentimientos Abstractos" de los "Hechos Obvios y Fácticos", conseguimos que el cerebro ansioso choque irrevocablemente con el muro indestructible de una realidad positiva aplastante, aplacando la disonancia impostora.</p>
        `
    },
    {
        slug: 'autocuidado-psicologos-chilenos',
        title: '¿Quién Cuida al que Cura?: La Crisis de Autocuidado Psicológico',
        excerpt: 'La ética oculta tras el burnout o agotamiento sistemático compasivo entre quienes dedican vida a procesar dolores ajenos sin pausas funcionales.',
        date: '2024-02-20',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: '/blog_self_care_psychology_therapeutic_1776139205529.png',
        content: `
            <p>Practicar la psicología clínica en Chile en ámbitos ya sean estatales deficitarios o independientes sobre-competitivos conforma uno de los terrenos vocacionales más pantanosos en la salud holística. Nuestra maquinaria primordial de operación resulta imperceptible en las ecografías: laboramos con pura resonancia humana instrumental, recibiendo en nuestra bandeja sináptica las peores atrocidades traumáticas o las penas suicidas paralizantes expuestas bajo cuatro muros de un box de consultas.</p>
            
            <blockquote>"La fatiga por compasión es el impuesto irrefutable e innegociable que debemos pagar todos aquellos que abrimos el pecho para oír sin enjuiciar el verdadero dolor de otra criatura." — Charles Figley, experto en Trauma Psicológico.</blockquote>
            
            <h3>El Fantasma del Burnout Ético</h3>
            <p>Operar con una mente saturada o agotada como terapeuta traspasa dramáticamente la delgada frontera de lo perjudicial de cara al paciente y constituye mala praxis, al nivel de un cirujano durmiéndose en pleno pabellón. Las estadísticas denotan que incontables colegas sacrifican fines de semanas, lidian con proyecciones ansiosas por pacientes amenazantes, e incuban síntomas físicos sub-clínicos innegables ante tanta carga y transferencia masificada de material emocional tóxico ambiental ineludible.</p>
            
            <h3>El Autocuidado Clínicamente Basado no es un 'Día de Spa'</h3>
            <p>Contrario a la pseudo-psicología de marketing estético banal donde el autocuidado significa sumergirse pasivamente bajo sales aromáticas u obligarse a meditar en un cojín asiático; un legítimo arsenal profiláctico de un analista implica supervisión técnica disciplinada mensual, el mantenimiento estricto y hasta beligerante de un encuadre financiero/organizativo protector, psicoterapia cruzada e integrativa propia continua, y la capacidad invaluable y asertiva para negarse rotundamente a abordar perfiles clínicos desequilibrantes cuando de antemano vislumbre una sobrecarga basal imperante inmedible.</p>
        `
    },
    {
        slug: 'salud-mental-no-es-lujo',
        title: 'Por Qué Reestructurar Mentes no debería Ser un Bien Suntuario',
        excerpt: 'Examinando el carácter profundamente estratificado y elitista respecto a quién realmente logra poseer libertad psíquica frente a depresiones masivas en nuestro actual modelo país.',
        date: '2024-02-15',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: '/blog_minimal_door.png',
        content: `
            <p>Enarbolar proclamas de resiliencia y campañas abstractas mediáticas invitando a la población a "conversar e integrar lo triste" colisiona agresiva e irónicamente de frentón contra barreras financieras reales imperturbables. Costear una psicoterapia semanal a un honorario medio particular requiere destinar una fracción usurera respecto al mermado salario mínimo local en Chile, configurando tristemente que obtener curación neuronal certificada opere tácitamente como adquisición suntuaria.</p>
            
            <blockquote>"La pobreza actúa como el acelerante masivo incendiario en las enfermedades psiquiátricas debido a la alta imprevisibilidad caótica ambiental cotidiana interconectada intrínsecamente a nivel endócrino." — Robert Sapolsky.</blockquote>
            
            <h3>El Desamparo de Pólizas Públicas en Salud Psíquica</h3>
            <p>El déficit asistencial es abismante cuando logramos atisbar bajo lupa la respuesta institucional nacional. El presupuesto total en la esfera de psiquiatrizacion/psicología colinda un lánguido y subdesarrollado estándar respecto al producto interno bruto, generando un cuello de botella aterrador de listas con miles de individuos congelados y dilatados en tiempos infinitos a los que la desesperanza arrincona impunemente ante el inminente cuadro clínico degenerativo irremediable de un trastorno mal tratado históricamente.</p>
            
            <h3>Nuevos Ecosistemas Privados Accesos Solidarios</h3>
            <p>Desde el baluarte de las trincheras privadas estamos ética, vocacional y existencialmente convocados a subsanar grietas que una arquitectura estatal decrépita nos ha heredado. Integraciones robustas como brindar escalabilidad terapéutica (modelos híbridos de tele-atención e imposiciones reducidas según evaluación socio-histórica contextual), promover psicosofia y entregar bibliotecas y directrices clínicas TCC liberadas como recursos *open-source*, pueden resultar la diferencia literal entre la preservación o erradicación biológica fatal en casos críticos olvidados e invisibles de nuestra sociedad urbana fracturada.</p>
        `
    },
    {
        slug: 'herramientas-tcc-manejo-panico',
        title: 'Kit Clínico de Choque Inmediato: Interrumpiendo el Pánico Severo',
        excerpt: 'Poderosas armas TCC paramétricas detalladas para desenredar crisis agudas ansiosas salvaguardando a nuestro colapsado sistema circulatorio en minutos reales de terror visceral.',
        date: '2024-02-10',
        author: 'Ps. Gustavo Caro',
        category: 'Recursos',
        image: '/blog_minimal_hands.png',
        content: `
            <p>Sufrir de cerca la desquiciadora maquinaria biológica subyacente tras un inminente ataque de pánico genuino resulta en una devastación física y emocional imborrable. Durante un asalto agudo el organismo se traiciona a sí mismo en un bucle; tu corazón acelera un asfixiante galope, provocando ahogo ficticio donde el cerebro lee la taquicardia idiopática engañosamente diagnosticándola errónea y falazmente como un paro cardiorrespiratorio absoluto o demencia súbita a puertas cerradas, potenciando el nivel de pavor hormonal original a niveles trágicos insospechados.</p>
            
            <blockquote>"La ansiedad engendra su propio monstruo, y huyendo apresurada e irrevocablemente de lo que febrilmente imaginamos terrible, solo concretamos ciegamente su inminente encarnación fatal." — Seneca.</blockquote>
            
            <h3>La Trama Psicofisiológica Ocultada del Desastre</h3>
            <p>Reeducar es el eslabón clínico de control ineludible e imperativo basal frente al Trastorno de Pánico endogámico. Para apagar las falsas alarmas orgánicas, la premisa TCC elemental en la que ahondamos exhaustivamente establece y tatúa cognitiva y conductualmente en la psiquis la verdad más liberadora respecto a los pánicos: resultan horrendamente incómodos debido al derrame caótico natural de adrenalínica supervivencia en la sangre, pero son médicamente *inofensivos*. Jamás culminarán en infartos directos vinculantes biológicamente corroborados desde el manual estadístico diagnóstico en curso moderno universal.</p>
            
            <h3>El Arsenal Conductual Aplicado In Siti</h3>
            <p>Los algoritmos en plena embestida para mitigar o subyugar síntomas deben estar ya protocolizados y tatuados previamente y entrenados mental y musculo-corpóreamente con un buen instructor:</p>
            <ul>
                <li><strong>Protocolo Inmersivo de Choque Térmico (Reflejo del Mamífero Acuático):</strong> Sumergir vertiginosamente o restregar un pack criogénico gélido (hielo bruto o agua bajo ceros) bajo los nervios y canales faciales del rostro fuerza violentamente al metabolismo circadiano al ralentí cardiaco compensatorio automático inmediato e instantáneo (bradicardia parasimpática comprobada fisiológicamente).</li>
                <li><strong>Saturación de Glóbulos Táctil Analítica:</strong> Tocar texturas extremadamente aberrantes y afiladas forzando la mente descriptiva prefrontal y logica narrativa matemática con minucia obsesiva al tacto inmediato, cancela y bloquea la irrigación química límbica y visceral desbordante.</li>
                <li><strong>Ventilación Abdominal Restrictiva Retenedora Cuadriculada (Técnica de 4 tiempos):</strong> Romper radical y decididamente el ciclo espiral insostenible e intoxicante nocivo crónico y errático de pura hiperventilación mediante la ingesta y expurgación sistemática guiada y ruda del flujo carbónico orgánico visceral en tiempos cuadriculados pautados estricta y rígidamente contados. No hay pensamiento negativo que la privación y saturación sistemática de aire controlado no subyugue imperativamente tarde a temprano.</li>
            </ul>
        `,
        resources: [
            {
                id: 'guia-respiracion',
                title: 'Manual Directo Interactivo de la Hiperventilación Desesperada Estabilizada',
                description: 'PDF de Choque estructurado conteniendo maniobras y atajos respiratorios de retención comprobados para derribar y dominar instantáneamente cascadas de pánico general agudas extremas desproporcionadas en progreso veloz.',
                content: 'La respiración diafragmática o exhalación regulada intermitente representa sin titubeos nuestra anestesia parasimpática basal gratuita para desintoxicar rauda e intervenidamente nuestro colapsado cerebro neuroquímico ante la embestida límbica mortal figurativa aparente. \n\nAlgoritmos Clínicos en Tormentas: \n1 - Apoyate frontalmente contra piso frío y denso en caso de parálisis y fijate severamente en la firmeza sólida absoluta que imposibilita la caída fatal esperada mentalmente. \n2 - Interroga cada sensación pavorosa con crudeza narrativa: ¿He muerto realmente en los cien ataques previos idénticos idílicos? No, sigues sobreviviendo, la crisis siempre merma. Observa su clímax de 10 minutos biológicos limitados naturales. \n3 - Inhala oxígeno concentrándote unívocamente expansivamente arrastrado al ombligo abdominal en cuatro tiempos sostenidos estrictos y obligatorios inobjetables... Manténlo en apnea ahogada auto-impuesta tres tiempos largos, expele violenta pero frímidamente y pausada ese oxígeno durante unos seis y siete tiempos medidos larguísimamente y repetidos de base.'
            }
        ]
    }
];

const scheduledTopics: Array<Omit<BlogPost, 'author' | 'content'> & { focus: string; sections: [[string, string], [string, string], [string, string]] }> = [
    {
        slug: 'cuando-retomar-terapia-despues-de-pausar',
        title: '¿Cuando retomar terapia si dejaste el proceso en pausa?',
        excerpt: 'Senales claras para saber si es momento de volver a terapia, incluso si no estas en crisis.',
        date: '2026-07-27',
        category: 'Recursos',
        image: '/blog_minimal_therapy.png',
        keywords: ['retomar terapia', 'psicologo online Chile', 'terapia cognitivo conductual', 'salud mental'],
        focus: 'retomar terapia, continuidad terapeutica y prevencion de recaidas',
        sections: [
            ['No necesitas tocar fondo para volver', 'Muchas personas esperan sentirse al limite para pedir una nueva hora. Sin embargo, retomar terapia tambien puede ser una decision preventiva: revisar avances, ordenar lo que quedo pendiente y actualizar herramientas para el momento vital actual.'],
            ['Senales de que conviene pedir una hora', 'Si notas mas irritabilidad, ansiedad, problemas de sueno, aislamiento, dificultad para decidir o retorno de patrones que ya habias trabajado, puede ser buen momento para volver. La terapia no tiene que empezar desde cero; muchas veces basta con reconectar el mapa.'],
            ['Como usar una sesion de retorno', 'Una buena sesion de retorno puede enfocarse en tres preguntas: que cambio desde la ultima vez, que tema necesita prioridad y que estrategia concreta puedes practicar esta semana. Ese encuadre transforma la consulta en un espacio claro y util.']
        ],
    },
    {
        slug: 'ansiedad-domingo-en-la-noche',
        title: 'Ansiedad del domingo en la noche: por que aparece y que hacer',
        excerpt: 'La ansiedad anticipatoria antes de comenzar la semana es frecuente. Estas herramientas TCC pueden ayudarte a regularla.',
        date: '2026-08-03',
        category: 'Ansiedad',
        image: '/blog/anxiety-tcc.png',
        keywords: ['ansiedad domingo', 'ansiedad anticipatoria', 'terapia TCC ansiedad', 'psicologo ansiedad Chile'],
        focus: 'ansiedad anticipatoria y rutina semanal',
        sections: [
            ['La mente se adelanta para intentar protegerte', 'El domingo por la noche muchas personas sienten presion, rumiacion o una sensacion de amenaza difusa. No siempre se debe a que la semana sera terrible; a veces el cerebro intenta controlar lo incierto adelantandose demasiado.'],
            ['Separar planificacion de preocupacion', 'Planificar implica decidir acciones concretas. Preocuparse en bucle implica repetir escenarios sin resolverlos. Una pauta util es escribir tres pendientes reales y una primera accion pequena para cada uno.'],
            ['Cuando pedir ayuda', 'Si la ansiedad anticipatoria afecta tu descanso, digestion, animo o vida familiar todos los domingos, puede ser una senal de que necesitas herramientas mas especificas y un plan terapeutico.']
        ],
    },
    {
        slug: 'tdah-adulto-senales-en-la-vida-diaria',
        title: 'TDAH adulto: senales cotidianas que suelen pasar desapercibidas',
        excerpt: 'No todo TDAH adulto se ve como hiperactividad. A veces aparece como desorden, agotamiento mental o dificultad para iniciar tareas.',
        date: '2026-08-10',
        category: 'Neurodiversidad',
        image: '/blog/tdah-adulto.png',
        keywords: ['TDAH adulto Chile', 'evaluacion TDAH adulto', 'psicologo TDAH', 'funciones ejecutivas'],
        focus: 'TDAH adulto, evaluacion y estrategias clinicas',
        sections: [
            ['No es solo distraerse', 'En adultos, el TDAH puede aparecer como dificultad para iniciar tareas, perder objetos, olvidar compromisos, procrastinar hasta el limite o vivir con una sensacion constante de esfuerzo mental.'],
            ['La culpa no organiza el cerebro', 'Muchas personas intentan resolver el TDAH con mas reto interno. Pero la culpa rara vez mejora la funcion ejecutiva. Lo que ayuda es disenar entornos, recordatorios, bloques de trabajo y metas visibles.'],
            ['Evaluar para comprender', 'Una evaluacion no busca etiquetar por etiquetar. Busca entender como funciona tu atencion, que areas estan afectadas y que apoyos pueden hacer tu vida mas llevadera.']
        ],
    },
    {
        slug: 'insomnio-y-rumiacion-mental',
        title: 'Insomnio y rumiacion: cuando la cama se vuelve una sala de reuniones',
        excerpt: 'Si tu mente se activa justo al acostarte, estas estrategias pueden ayudarte a cortar el ciclo de rumiacion nocturna.',
        date: '2026-08-17',
        category: 'Recursos',
        image: '/blog_sleep_urban_night_lights_1776139123834.png',
        keywords: ['insomnio ansiedad', 'rumiacion nocturna', 'higiene del sueno', 'terapia cognitivo conductual'],
        focus: 'insomnio, ansiedad nocturna e higiene del sueno',
        sections: [
            ['La cama no deberia ser oficina emocional', 'Cuando llevas pendientes, conversaciones inconclusas o preocupaciones acumuladas, la mente puede elegir el silencio de la noche para intentar resolverlo todo. El resultado suele ser mas activacion, no mas claridad.'],
            ['Externalizar antes de dormir', 'Una tecnica simple es escribir preocupaciones y pendientes al menos 90 minutos antes de acostarte. No se trata de resolverlos todos, sino de senalarle al cerebro que no necesita sostenerlos en bucle.'],
            ['Si se repite, conviene intervenir', 'Dormir mal de forma persistente afecta animo, memoria, paciencia y ansiedad. Si el insomnio se mantiene, la terapia puede ayudarte a ordenar rutinas y pensamientos que sostienen el problema.']
        ],
    },
    {
        slug: 'limites-sanos-sin-culpa',
        title: 'Limites sanos: como decir que no sin sentir que fallaste',
        excerpt: 'Poner limites no es alejarse de todos. Es cuidar el modo en que te vinculas contigo y con los demas.',
        date: '2026-08-24',
        category: 'Salud Mental',
        image: '/blog/healthy-relationships.png',
        keywords: ['limites sanos', 'dependencia emocional', 'relaciones sanas', 'psicoterapia online Chile'],
        focus: 'limites, culpa y relaciones',
        sections: [
            ['El limite no es castigo', 'Un limite sano no busca herir ni controlar a otra persona. Busca expresar que necesitas para relacionarte sin pasar por encima de ti mismo.'],
            ['La culpa puede aparecer aunque el limite sea correcto', 'Sentir culpa no siempre significa que hiciste algo malo. A veces solo indica que estas haciendo algo nuevo, especialmente si aprendiste a complacer para evitar conflicto.'],
            ['Practicar frases concretas', 'Una frase util combina respeto y claridad: ahora no puedo comprometerme con eso, necesito revisarlo, prefiero no hablar de ese tema. La claridad suele proteger mas que la explicacion excesiva.']
        ],
    },
    {
        slug: 'burnout-en-chile-senales-tempranas',
        title: 'Burnout en Chile: senales tempranas que no conviene normalizar',
        excerpt: 'El agotamiento no aparece de un dia para otro. Aprende a reconocerlo antes de que te pase la cuenta.',
        date: '2026-08-31',
        category: 'Salud Mental',
        image: '/blog/burnout-chile.png',
        keywords: ['burnout Chile', 'estres laboral', 'agotamiento emocional', 'psicologo online'],
        focus: 'burnout, estres laboral y autocuidado realista',
        sections: [
            ['El cansancio cronico no es medalla', 'En culturas laborales exigentes se suele premiar estar siempre disponible. Pero vivir agotado, irritable y desconectado no es productividad: es una senal de desgaste.'],
            ['Sintomas que merecen atencion', 'Dificultad para descansar, cinismo, baja motivacion, errores frecuentes, dolores fisicos y sensacion de no llegar nunca pueden indicar burnout. No hay que esperar el colapso para intervenir.'],
            ['Recuperar margen', 'El trabajo terapeutico puede ayudarte a revisar limites, autoexigencia, prioridades y formas de descanso que realmente reparen, no solo que distraigan por un rato.']
        ],
    },
    {
        slug: 'terapia-online-chile-como-aprovecharla',
        title: 'Terapia online en Chile: como aprovechar mejor tus sesiones',
        excerpt: 'La terapia online puede ser cercana, seria y efectiva si se cuida el encuadre y la participacion activa.',
        date: '2026-09-07',
        category: 'Recursos',
        image: '/blog_minimal_door.png',
        keywords: ['terapia online Chile', 'psicologo online Chile', 'TCC online', 'psicoterapia online'],
        focus: 'terapia online, encuadre y continuidad',
        sections: [
            ['Online no significa informal', 'Una sesion online requiere privacidad, puntualidad, conexion estable y un espacio donde puedas hablar sin estar actuando para otros. Ese encuadre ayuda a que la terapia funcione.'],
            ['Preparar la sesion mejora el resultado', 'Llegar con una idea de lo que quieres revisar, aunque sea breve, permite usar mejor el tiempo. Puedes anotar situaciones, emociones o preguntas de la semana.'],
            ['Lo importante es la continuidad', 'La terapia online puede facilitar constancia porque reduce traslados y tiempos muertos. Esa continuidad suele ser clave para transformar herramientas en habitos reales.']
        ],
    },
    {
        slug: 'ansiedad-en-fiestas-patrias',
        title: 'Ansiedad en Fiestas Patrias: reuniones, excesos y comparaciones',
        excerpt: 'Septiembre puede ser alegre y tambien exigente. Algunas claves para cuidar tu salud mental en fechas sociales.',
        date: '2026-09-14',
        category: 'Ansiedad',
        image: '/blog_ansiedad_santiago_1776137206965.png',
        keywords: ['ansiedad fiestas patrias', 'salud mental septiembre', 'ansiedad social Chile', 'psicologo ansiedad'],
        focus: 'ansiedad social, familia y autocuidado en celebraciones',
        sections: [
            ['No todas las celebraciones se viven igual', 'Para algunas personas las reuniones familiares o sociales generan tension, comparacion, preguntas incomodas o cansancio. Validar eso permite cuidarte mejor.'],
            ['Anticipar limites concretos', 'Antes de asistir, define cuanto tiempo quieres quedarte, que temas no quieres conversar y que salida puedes usar si necesitas retirarte. Preparar no es exagerar; es autocuidado.'],
            ['Volver al cuerpo', 'Comer, dormir y moverte con cierta regularidad ayuda a que el sistema nervioso no quede completamente desregulado despues de varios dias de intensidad social.']
        ],
    },
    {
        slug: 'autismo-adulto-diagnostico-tardio',
        title: 'Autismo adulto y diagnostico tardio: entenderse despues de anos',
        excerpt: 'Muchas personas adultas descubren tarde que su forma de sentir, socializar o regularse tenia una explicacion.',
        date: '2026-09-21',
        category: 'Neurodiversidad',
        image: '/blog/tea-adulthood.png',
        keywords: ['autismo adulto Chile', 'evaluacion TEA adulto', 'ADOS-2 Chile', 'neurodiversidad adulto'],
        focus: 'autismo adulto, evaluacion TEA y diagnostico tardio',
        sections: [
            ['El alivio de encontrar una explicacion', 'Un diagnostico tardio puede remover dolor, pero tambien traer alivio. Muchas experiencias que parecian fallas personales pueden comprenderse como diferencias de procesamiento.'],
            ['No se trata de encasillar', 'Evaluar TEA en adultos requiere historia de desarrollo, funcionamiento actual, sensibilidad sensorial, comunicacion social e instrumentos adecuados. El objetivo es orientar apoyos.'],
            ['Despues del diagnostico viene la integracion', 'Comprenderse permite ajustar expectativas, relaciones, rutinas y formas de autocuidado. El diagnostico es una puerta, no el final del proceso.']
        ],
    },
    {
        slug: 'panic-attack-que-hacer-en-crisis',
        title: 'Ataque de panico: que hacer durante los primeros minutos',
        excerpt: 'Una guia clara para reconocer una crisis de panico y bajar la intensidad sin alimentar el miedo.',
        date: '2026-09-28',
        category: 'Ansiedad',
        image: '/blog_minimal_hands.png',
        keywords: ['ataque de panico', 'crisis de panico', 'ansiedad Chile', 'herramientas TCC panico'],
        focus: 'panico, psicoeducacion y regulacion fisiologica',
        sections: [
            ['El panico se siente peligroso, pero no siempre lo es', 'Una crisis de panico puede sentirse como perdida de control, ahogo o amenaza fisica. Comprender la respuesta de adrenalina ayuda a no interpretarla como catastrofe inmediata.'],
            ['No pelear con la ola', 'Intentar eliminar la sensacion a la fuerza suele aumentarla. Puede ayudar decir: esto es panico, es intenso, va a pasar. Nombrar el proceso baja el miedo secundario.'],
            ['Entrenar antes de la crisis', 'Respiracion, anclaje sensorial y exposicion interoceptiva funcionan mejor cuando se practican fuera de la crisis. La terapia permite entrenarlas de forma gradual y segura.']
        ],
    },
    {
        slug: 'autoexigencia-y-perfeccionismo',
        title: 'Autoexigencia y perfeccionismo: cuando hacerlo bien nunca alcanza',
        excerpt: 'La autoexigencia puede impulsar, pero tambien desgastar. Aprende a distinguir esfuerzo sano de castigo interno.',
        date: '2026-10-05',
        category: 'Salud Mental',
        image: '/blog_impostor_syndrome_reflection_1776139190697.png',
        keywords: ['perfeccionismo', 'autoexigencia', 'sindrome del impostor', 'terapia TCC'],
        focus: 'perfeccionismo, autoexigencia y TCC',
        sections: [
            ['El problema no es querer hacer las cosas bien', 'El perfeccionismo se vuelve problematico cuando nada parece suficiente, el error se vive como amenaza y descansar se siente como culpa.'],
            ['La vara movil', 'Muchas personas perfeccionistas cumplen una meta y de inmediato suben la exigencia. Asi el logro nunca se registra; solo aparece el siguiente deber.'],
            ['Trabajar con criterios realistas', 'La TCC ayuda a definir estandares claros, revisar pensamientos extremos y practicar conductas donde lo suficientemente bueno tambien sea aceptable.']
        ],
    },
    {
        slug: 'duelo-no-lineal',
        title: 'El duelo no es lineal: por que algunos dias vuelven a doler',
        excerpt: 'El duelo puede avanzar y retroceder. Comprenderlo ayuda a vivirlo con menos culpa.',
        date: '2026-10-12',
        category: 'Salud Mental',
        image: '/blog_minimal_winter.png',
        keywords: ['duelo', 'terapia duelo', 'salud mental Chile', 'psicologo online'],
        focus: 'duelo, fechas sensibles y acompanamiento terapeutico',
        sections: [
            ['No se supera como una lista de tareas', 'El duelo suele moverse en oleadas. Puedes estar mejor y luego sentir que algo se reactiva por una fecha, una cancion, una conversacion o un recuerdo inesperado.'],
            ['La culpa suele confundirse con amor', 'Muchas personas sienten que dejar de sufrir seria traicionar lo perdido. Trabajar el duelo permite construir una relacion distinta con el recuerdo, no borrarlo.'],
            ['Acompanarse importa', 'Cuando el duelo se vuelve aislamiento, culpa persistente o imposibilidad de funcionar, la terapia puede ofrecer un espacio seguro para procesarlo sin apurar ni congelar.']
        ],
    },
    {
        slug: 'evaluacion-tdah-adulto-que-incluye',
        title: 'Evaluacion TDAH adulto: que incluye y cuando conviene hacerla',
        excerpt: 'Una evaluacion bien hecha ayuda a diferenciar TDAH de ansiedad, depresion, estres o problemas de sueno.',
        date: '2026-10-19',
        category: 'Neurodiversidad',
        image: '/blog/late-diagnosis.png',
        keywords: ['evaluacion TDAH adulto Chile', 'diagnostico TDAH', 'psicologo TDAH Santiago', 'TDAH adulto'],
        focus: 'evaluacion TDAH adulto y diagnostico diferencial',
        sections: [
            ['No todo problema de concentracion es TDAH', 'La atencion puede verse afectada por ansiedad, depresion, trauma, estres, insomnio o sobrecarga digital. Por eso una evaluacion seria mira historia, sintomas y contexto.'],
            ['Que se busca observar', 'Se revisan dificultades de atencion, impulsividad, organizacion, regulacion emocional, inicio de tareas e impacto funcional desde etapas tempranas hasta la vida adulta.'],
            ['La utilidad del informe', 'Un informe puede orientar tratamiento, adaptaciones, derivaciones y estrategias concretas. La meta no es solo nombrar, sino ayudar a vivir mejor.']
        ],
    },
    {
        slug: 'salud-mental-hombres-consulta',
        title: 'Salud mental en hombres: por que cuesta tanto pedir ayuda',
        excerpt: 'Muchos hombres llegan a terapia cuando ya estan al limite. Hablar antes tambien es una forma de responsabilidad.',
        date: '2026-10-26',
        category: 'Opinión',
        image: '/blog_minimal_cbt.png',
        keywords: ['salud mental hombres', 'psicologo hombres Chile', 'terapia online hombres', 'depresion masculina'],
        focus: 'salud mental masculina y barreras para pedir ayuda',
        sections: [
            ['La fortaleza mal entendida', 'A muchos hombres se les ensena a aguantar, resolver solos y no mostrar vulnerabilidad. Ese aprendizaje puede dificultar reconocer tristeza, miedo o agotamiento.'],
            ['Sintomas que se disfrazan', 'La depresion o ansiedad en hombres a veces aparece como irritabilidad, aislamiento, consumo, trabajo excesivo o desconexion afectiva, no necesariamente como llanto visible.'],
            ['Pedir ayuda tambien cuida a otros', 'Terapia no es dejar de ser fuerte. Es aprender a responder mejor ante lo que duele, antes de que el malestar se exprese de formas que danen la vida cotidiana.']
        ],
    },
    {
        slug: 'evaluacion-autismo-ados2-adultos',
        title: 'Evaluacion de autismo con ADOS-2: que debes saber',
        excerpt: 'El ADOS-2 puede ser parte de una evaluacion TEA, pero el diagnostico requiere mirar la historia completa de la persona.',
        date: '2026-11-02',
        category: 'Neurodiversidad',
        image: '/blog/neuro-chile.png',
        keywords: ['ADOS-2 Chile', 'evaluacion autismo adulto', 'evaluacion TEA', 'psicologo autismo Chile'],
        focus: 'evaluacion TEA, ADOS-2 y neurodiversidad',
        sections: [
            ['El instrumento no reemplaza el criterio clinico', 'El ADOS-2 aporta informacion valiosa, pero debe integrarse con entrevistas, historia de desarrollo, funcionamiento actual y otras fuentes relevantes.'],
            ['Por que muchas personas consultan en adultez', 'Algunas personas llegan despues de anos de enmascaramiento, agotamiento social o sensacion de no encajar. La evaluacion puede ayudar a entender patrones que venian de antes.'],
            ['Despues de evaluar', 'El objetivo es orientar apoyos, ajustes y autocomprension. Un diagnostico responsable deberia abrir caminos practicos, no quedarse solo en una etiqueta.']
        ],
    },
    {
        slug: 'cierre-de-ano-salud-mental',
        title: 'Cierre de ano y salud mental: como hacer un balance sin castigarte',
        excerpt: 'Noviembre y diciembre pueden activar comparaciones y exigencias. Un balance amable tambien puede ser honesto.',
        date: '2026-11-09',
        category: 'Recursos',
        image: '/blog_santiago_mountain_resilience_premium_1776139093323.png',
        keywords: ['cierre de ano salud mental', 'ansiedad fin de ano', 'terapia fin de ano', 'psicologo Chile'],
        focus: 'cierre de ano, balance personal y autocuidado',
        sections: [
            ['Balance no es juicio final', 'Revisar el ano no deberia convertirse en una lista de fracasos. Tambien puedes mirar lo que sostuviste, aprendiste, soltaste o empezaste a reconocer.'],
            ['Cuidado con las comparaciones', 'Diciembre suele aumentar comparaciones laborales, familiares y personales. Recordar que cada historia tiene contexto ayuda a bajar la dureza interna.'],
            ['Una revision terapeutica puede ordenar', 'Una sesion de cierre puede ayudarte a identificar avances, pendientes y necesidades reales para iniciar el proximo ano con mas claridad.']
        ],
    },
    {
        slug: 'ansiedad-por-dinero-fin-de-ano',
        title: 'Ansiedad por dinero a fin de ano: cuando las cuentas tambien pesan emocionalmente',
        excerpt: 'Gastos, regalos, deudas y expectativas pueden aumentar la ansiedad. Algunas estrategias para ordenar sin paralizarte.',
        date: '2026-11-16',
        category: 'Ansiedad',
        image: '/blog_ritmo_estres_santiago_1776138845888.png',
        keywords: ['ansiedad por dinero', 'estres financiero Chile', 'ansiedad fin de ano', 'terapia ansiedad'],
        focus: 'estres financiero, ansiedad y fin de ano',
        sections: [
            ['El dinero tambien activa amenaza', 'Cuando las cuentas se acumulan, el sistema nervioso puede interpretar la situacion como peligro constante. No es solo un tema numerico; tambien es emocional.'],
            ['Ordenar reduce incertidumbre', 'Hacer una lista realista de gastos, prioridades y limites puede bajar la ansiedad. Evitar mirar el problema suele hacerlo crecer en la mente.'],
            ['Conversarlo sin verguenza', 'La ansiedad financiera puede traer culpa o aislamiento. En terapia se puede trabajar la relacion con control, miedo, decisiones y autocuidado en contextos exigentes.']
        ],
    },
    {
        slug: 'soledad-digital-y-vinculos',
        title: 'Soledad digital: estar conectado no siempre es sentirse acompanado',
        excerpt: 'Las redes pueden acercar, pero tambien intensificar comparacion, desconexion y sensacion de soledad.',
        date: '2026-11-23',
        category: 'Salud Mental',
        image: '/blog/soledad-digital.png',
        keywords: ['soledad digital', 'redes sociales ansiedad', 'salud mental y tecnologia', 'psicoterapia online'],
        focus: 'soledad, redes sociales y vinculos',
        sections: [
            ['Mas contacto no siempre significa mas intimidad', 'Podemos hablar con muchas personas y aun asi sentirnos poco vistos. La conexion digital rapida no siempre reemplaza conversaciones seguras y profundas.'],
            ['La comparacion agota', 'Mirar vidas editadas durante horas puede aumentar la sensacion de atraso o insuficiencia. Conviene observar que contenido te regula y cual te deja peor.'],
            ['Volver a vinculos nutritivos', 'Una meta realista puede ser fortalecer una o dos relaciones seguras, no exponerte mas en todas partes. La salud mental tambien se cuida eligiendo entornos.']
        ],
    },
    {
        slug: 'como-preparar-primera-sesion-psicologica',
        title: 'Como preparar tu primera sesion psicologica',
        excerpt: 'Si nunca has ido a terapia, estas orientaciones pueden ayudarte a llegar con menos ansiedad y mas claridad.',
        date: '2026-11-30',
        category: 'Recursos',
        image: '/blog_minimal_therapy.png',
        keywords: ['primera sesion psicologica', 'psicologo online Chile', 'como empezar terapia', 'terapia TCC'],
        focus: 'primera sesion, expectativas y alianza terapeutica',
        sections: [
            ['No tienes que llevar todo ordenado', 'Muchas personas creen que deben explicar perfecto lo que les pasa. No es necesario. Parte del trabajo terapeutico es ayudarte a ordenar la historia.'],
            ['Que puede servir anotar', 'Puedes llevar tres elementos: que te preocupa, desde cuando ocurre y que impacto tiene en tu vida. Eso basta para empezar una conversacion clinica util.'],
            ['La primera sesion tambien evalua ajuste', 'Es valido observar si te sientes escuchado, si el enfoque te hace sentido y si aparecen objetivos claros. La alianza terapeutica importa.']
        ],
    },
    {
        slug: 'navidad-duelo-y-familia',
        title: 'Navidad, duelo y familia: cuando diciembre no se siente feliz',
        excerpt: 'Las fiestas pueden remover ausencias, conflictos o cansancio emocional. No tienes que vivirlas de una sola manera.',
        date: '2026-12-07',
        category: 'Salud Mental',
        image: '/blog_minimal_winter.png',
        keywords: ['navidad duelo', 'salud mental diciembre', 'ansiedad fiestas', 'terapia duelo'],
        focus: 'duelo, familia y fechas sensibles',
        sections: [
            ['La alegria obligatoria pesa', 'Diciembre suele instalar la idea de que todos deberian estar felices. Para quienes atraviesan duelo, distancia familiar o cansancio, esa expectativa puede doler mas.'],
            ['Permisos emocionales', 'Puedes participar menos, retirarte antes, crear un ritual propio o elegir con quien compartir. Cuidarte no arruina la fecha; la vuelve mas habitable.'],
            ['Pedir apoyo en fechas dificiles', 'Si estas fechas reactivan tristeza intensa, ansiedad o sensacion de soledad, una sesion puede ayudarte a preparar recursos concretos.']
        ],
    },
    {
        slug: 'propositos-de-ano-nuevo-salud-mental',
        title: 'Propositos de ano nuevo: cambiar sin partir desde la culpa',
        excerpt: 'Los cambios sostenibles nacen mejor desde claridad y cuidado, no desde castigo personal.',
        date: '2026-12-14',
        category: 'Recursos',
        image: '/blog_self_care_psychology_therapeutic_1776139205529.png',
        keywords: ['propositos ano nuevo', 'habitos salud mental', 'terapia cognitivo conductual', 'cambio de habitos'],
        focus: 'habitos, metas y cambio conductual',
        sections: [
            ['La culpa motiva poco y dura menos', 'Muchas metas de enero nacen desde rechazo hacia uno mismo. Ese punto de partida suele producir planes rigidos, abandono rapido y mas frustracion.'],
            ['Metas pequenas, contexto real', 'Un buen objetivo necesita ser concreto, medible y compatible con tu vida actual. No necesitas prometer una transformacion completa para empezar a moverte.'],
            ['Acompanamiento para sostener cambios', 'La terapia puede ayudarte a convertir deseos amplios en pasos observables, revisar obstaculos y ajustar expectativas sin caer en todo o nada.']
        ],
    },
    {
        slug: 'terapia-cognitivo-conductual-en-ansiedad',
        title: 'Terapia cognitivo conductual para ansiedad: que se trabaja en sesion',
        excerpt: 'La TCC para ansiedad combina psicoeducacion, identificacion de pensamientos, exposicion gradual y cambios conductuales.',
        date: '2026-12-21',
        category: 'Ansiedad',
        image: '/blog_minimal_cbt.png',
        keywords: ['terapia cognitivo conductual ansiedad', 'TCC Chile', 'psicologo ansiedad Santiago', 'ansiedad tratamiento'],
        focus: 'TCC, ansiedad y proceso terapeutico',
        sections: [
            ['Entender el circuito de ansiedad', 'Primero se identifica como se conectan situacion, pensamiento, sensacion fisica y conducta. Ese mapa permite intervenir con mas precision.'],
            ['Reducir evitacion', 'Muchas conductas alivian a corto plazo pero mantienen la ansiedad a largo plazo. La exposicion gradual busca recuperar libertad, no forzar sufrimiento innecesario.'],
            ['Medir avances', 'La TCC suele trabajar con objetivos y tareas entre sesiones. Esto ayuda a ver progreso, ajustar estrategias y mantener un proceso activo.']
        ],
    },
    {
        slug: 'iniciar-terapia-en-enero',
        title: 'Iniciar terapia en enero: una forma concreta de cuidar el nuevo ano',
        excerpt: 'Enero puede ser un buen momento para ordenar prioridades emocionales y comenzar un proceso con objetivos claros.',
        date: '2026-12-28',
        category: 'Recursos',
        image: '/blog_minimal_door.png',
        keywords: ['iniciar terapia enero', 'psicologo online Chile', 'agendar psicologo', 'terapia online'],
        focus: 'inicio de terapia, objetivos y plan anual',
        sections: [
            ['No necesitas esperar a que el ano se complique', 'Comenzar terapia al inicio del ano puede ayudarte a definir prioridades, revisar patrones y construir herramientas antes de que la rutina vuelva con toda su carga.'],
            ['Un plan emocional posible', 'La primera etapa puede enfocarse en objetivos concretos: ansiedad, autoestima, limites, organizacion, duelo, evaluacion o continuidad de un proceso anterior.'],
            ['Dar el primer paso', 'Agendar una primera sesion no te compromete a tener todo resuelto. Solo abre un espacio para entender que necesitas y como trabajar en ello.']
        ],
    },
];

function renderScheduledPost(topic: (typeof scheduledTopics)[number]) {
    const [first, second, third] = topic.sections;
    return `
        <p>Este articulo forma parte de una serie semanal pensada para acompanar el cierre de ano con herramientas de Terapia Cognitivo Conductual, psicoeducacion y orientaciones practicas para la vida cotidiana en Chile.</p>
        <h3>${first[0]}</h3>
        <p>${first[1]}</p>
        <h3>${second[0]}</h3>
        <p>${second[1]}</p>
        <h3>${third[0]}</h3>
        <p>${third[1]}</p>
        <blockquote>Una pregunta util para esta semana: si este tema fuera un poco mas facil de manejar, que cambio pequeno notaria primero?</blockquote>
        <h3>Cuando consultar</h3>
        <p>Si este tema se repite, afecta tu descanso, tus vinculos, tu trabajo o tu sensacion de bienestar, puede ser buen momento para pedir apoyo profesional. La terapia no busca juzgar lo que te pasa: busca entenderlo y construir herramientas realistas para abordarlo.</p>
        <p>Si necesitas acompanamiento, puedes agendar una sesion online con enfoque TCC y revisar juntos un plan de trabajo segun tu situacion.</p>
    `;
}

const detailedClinicalPosts: BlogPost[] = [
    {
        slug: 'tdah-adulto-senales-en-la-vida-diaria',
        title: 'TDAH en adultos: señales cotidianas, evaluación y apoyos posibles',
        excerpt: 'Dificultad para iniciar tareas, olvidar plazos o vivir apagando incendios no confirma un diagnóstico, pero puede ser una buena razón para consultar.',
        date: '2026-08-10',
        author: 'Ps. Gustavo Caro',
        category: 'Neurodiversidad',
        image: '/blog/tdah-adulto.png',
        keywords: ['TDAH adulto Chile', 'señales TDAH adultos', 'evaluación TDAH adulto', 'funciones ejecutivas'],
        resources: clinicalResources.filter((resource) => resource.id === 'organizacion-tdah'),
        content: `
            <p>Muchas personas adultas llegan a consulta diciendo que siempre han sido “desordenadas”, que necesitan una presión enorme para empezar o que logran rendir, pero a un costo que nadie ve. El TDAH puede ser una explicación relevante en algunos casos, aunque una lista de dificultades cotidianas por sí sola no basta para diagnosticarlo.</p>
            <p>Una evaluación responsable mira el patrón completo: desde cuándo están presentes las dificultades, en qué contextos aparecen, cuánto afectan el funcionamiento y qué otras variables pueden estar influyendo. Ansiedad, depresión, falta de sueño, sobrecarga, consumo de sustancias o un contexto muy exigente también pueden afectar atención y organización.</p>
            <h3>Señales que vale la pena observar</h3>
            <p>En la adultez, el TDAH no siempre se presenta como hiperactividad visible. Puede aparecer como dificultad para estimar tiempos, olvidos frecuentes, problemas para sostener rutinas, cambios constantes de foco, postergación, impulsividad al tomar decisiones o una sensación persistente de estar llegando tarde a todo.</p>
            <p>También es común la compensación: personas muy responsables que usan listas, alarmas, largas jornadas o perfeccionismo para no olvidar nada. Estas estrategias pueden funcionar durante años, pero a veces se vuelven insuficientes al aumentar las demandas laborales, familiares o académicas.</p>
            <h3>Diagnóstico no es etiqueta rápida</h3>
            <p>Una evaluación clínica integra entrevista, antecedentes de infancia, instrumentos estandarizados cuando corresponde e impacto funcional. El objetivo no es encontrar una explicación única a toda la historia, sino aclarar qué está pasando y qué apoyos serían útiles.</p>
            <p>Si existe TDAH, comprenderlo puede reducir mucha culpa. No porque todo quede resuelto por un nombre, sino porque permite diseñar estrategias más realistas: ajustar el entorno, dividir tareas, externalizar recordatorios y decidir si se requiere coordinación con otros profesionales.</p>
            <h3>Una herramienta para el día a día</h3>
            <p>Cuando iniciar una tarea cuesta, reducir el tamaño del primer paso suele ser más efectivo que aumentar la presión. “Abrir el archivo y escribir el título” es una meta más útil que “terminar el informe”. Un temporizador breve y un entorno con menos distractores ayudan a que el inicio no dependa de encontrar motivación perfecta.</p>
            <h3>Cuando consultar</h3>
            <p>Conviene pedir orientación si estas dificultades se repiten en más de un área de la vida, generan consecuencias relevantes o te obligan a hacer un esfuerzo desproporcionado para sostener lo cotidiano. Una entrevista inicial permite evaluar si corresponde un proceso de psicoterapia, una evaluación de TDAH u otra alternativa clínica.</p>
        `,
    },
    {
        slug: 'insomnio-y-rumiacion-mental',
        title: 'Insomnio y rumiación mental: cómo cortar el ciclo sin pelear con el sueño',
        excerpt: 'Cuando el cuerpo se acuesta pero la mente sigue resolviendo pendientes, el problema no suele ser falta de disciplina. Estas pautas pueden ayudar a entender el ciclo.',
        date: '2026-08-17',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: '/blog_sleep_urban_night_lights_1776139123834.png',
        keywords: ['insomnio ansiedad', 'rumiación nocturna', 'higiene del sueño TCC', 'psicólogo sueño Chile'],
        resources: clinicalResources.filter((resource) => resource.id === 'plan-de-pausa'),
        content: `
            <p>Hay noches en que el cansancio está, pero dormir no ocurre. Aparecen conversaciones que se repiten, correos que no respondiste, decisiones pendientes o escenarios que la mente intenta resolver a las dos de la mañana. No es raro que esto se viva como una batalla: mientras más urgente parece dormir, más alerta se siente el cuerpo.</p>
            <p>El insomnio puede tener múltiples causas médicas, emocionales y conductuales. Por eso, si es persistente, intenso o afecta de forma importante tu funcionamiento, es recomendable evaluarlo con un profesional de salud. Las pautas de este artículo no reemplazan esa consulta.</p>
            <h3>Por qué la cama se vuelve un lugar de alerta</h3>
            <p>Cuando pasamos mucho tiempo en la cama preocupándonos, revisando el teléfono o calculando cuántas horas quedan para levantarse, el cerebro empieza a asociar ese espacio con esfuerzo y vigilancia. El sueño no responde bien a la presión: es un proceso que aparece con mayor facilidad cuando baja la activación.</p>
            <p>La rumiación tiene una promesa engañosa: si sigo pensando, quizá encontraré una solución. Sin embargo, de noche la mente suele repetir el problema sin generar acciones nuevas. Distinguir planificación de rumiación es un primer paso útil.</p>
            <h3>Una descarga antes de acostarte</h3>
            <p>Reserva diez minutos, idealmente antes de entrar a la cama, para escribir pendientes y preocupaciones. Junto a cada pendiente anota una próxima acción concreta o una fecha para revisarlo. El objetivo no es solucionar todo: es demostrarle a tu mente que no necesita sostenerlo en memoria durante la noche.</p>
            <h3>Qué hacer si el sueño no llega</h3>
            <p>Si llevas un rato largo despierto y notas que estás cada vez más frustrado, puede ser mejor levantarte y hacer una actividad tranquila con luz tenue hasta que reaparezca somnolencia. Evita convertir el teléfono o el trabajo en compañía nocturna: activan más de lo que calman.</p>
            <h3>Un criterio de cuidado</h3>
            <p>El objetivo no es alcanzar una rutina perfecta. Es observar patrones y crear señales de cierre que sean sostenibles. Si hay ronquidos intensos, pausas respiratorias, uso frecuente de medicamentos para dormir, ánimo muy bajo o ansiedad persistente, consulta para revisar el cuadro completo.</p>
        `,
    },
    {
        slug: 'limites-sanos-sin-culpa',
        title: 'Poner límites sin culpa: una habilidad que se practica en relaciones reales',
        excerpt: 'Decir que no no tiene que ser agresivo ni justificarse hasta el agotamiento. Una guía para comenzar a poner límites claros y respetuosos.',
        date: '2026-08-24',
        author: 'Ps. Gustavo Caro',
        category: 'Recursos',
        image: '/blog/healthy-relationships.png',
        keywords: ['poner límites sin culpa', 'límites sanos', 'asertividad terapia', 'psicólogo relaciones Chile'],
        resources: clinicalResources.filter((resource) => resource.id === 'plan-de-pausa'),
        content: `
            <p>Para muchas personas, poner un límite se siente como una amenaza para el vínculo. Aparece el temor a decepcionar, a ser visto como egoísta o a iniciar un conflicto. Por eso es común decir que sí cuando se quiere decir que no y luego sentir resentimiento, agotamiento o culpa.</p>
            <p>Un límite no es una forma de controlar a los demás. Es una manera de comunicar qué puedes hacer, qué no estás disponible para sostener y qué necesitas para cuidarte dentro de una relación. Puede generar incomodidad, pero la incomodidad no es una señal automática de que estás haciendo algo mal.</p>
            <h3>La diferencia entre explicar y pedir permiso</h3>
            <p>Dar un contexto breve puede ser considerado; dar explicaciones interminables suele ocurrir cuando buscamos que la otra persona valide una decisión que ya tomamos. Prueba con frases simples: “Hoy no puedo”, “prefiero hablar de esto en otro momento” o “puedo ayudarte hasta cierta hora”.</p>
            <h3>Esperar alguna reacción</h3>
            <p>La respuesta de la otra persona no siempre será cómoda. Puede haber sorpresa, frustración o desacuerdo. El límite no necesita convencer a todos para ser válido. Lo importante es que sea claro, proporcional y coherente con lo que después puedes sostener.</p>
            <h3>Practicar en situaciones pequeñas</h3>
            <p>Es más fácil empezar con límites de bajo riesgo: responder un mensaje cuando tengas tiempo, decir que no a un favor puntual o pedir que no te llamen durante una reunión. La práctica permite observar que muchos vínculos toleran mejor la claridad de lo que la ansiedad anticipa.</p>
            <h3>Cuando la culpa es muy intensa</h3>
            <p>Si cada intento de poner límites activa miedo, culpa extrema o dinámicas de manipulación, puede ser útil explorarlo en terapia. A veces el problema no es encontrar la frase correcta, sino entender la historia relacional que vuelve tan difícil priorizarse.</p>
        `,
    },
    {
        slug: 'burnout-en-chile-senales-tempranas',
        title: 'Burnout y estrés laboral: señales tempranas antes de normalizar el agotamiento',
        excerpt: 'El cansancio sostenido no siempre se resuelve con un fin de semana libre. Cómo identificar señales de sobrecarga y recuperar margen de acción.',
        date: '2026-08-31',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: '/blog/burnout-chile.png',
        keywords: ['burnout Chile', 'estrés laboral', 'agotamiento laboral', 'psicólogo burnout'],
        resources: clinicalResources.filter((resource) => resource.id === 'plan-de-pausa'),
        content: `
            <p>En contextos de alta demanda, es fácil convertir el agotamiento en una medalla: seguir respondiendo fuera de horario, dormir poco y prometer que la próxima semana habrá tiempo para recuperarse. El problema es que, cuando esto se mantiene, el cuerpo y la mente empiezan a cobrar una cuenta que no se resuelve solo con voluntad.</p>
            <p>El burnout no es sinónimo de cualquier día difícil. Suele describir un desgaste vinculado al trabajo que combina cansancio intenso, distancia o cinismo frente a las tareas y sensación de menor eficacia. Cada situación necesita evaluarse en su contexto; no corresponde autodiagnosticarse con una publicación.</p>
            <h3>Señales que conviene tomar en serio</h3>
            <p>Problemas de sueño, irritabilidad, dolores tensionales, dificultad para concentrarse, aislamiento, errores poco habituales o una sensación constante de estar atrasado pueden ser señales de sobrecarga. También importa observar si el descanso dejó de recuperar o si todo empieza a sentirse como una obligación.</p>
            <h3>Lo individual no explica todo</h3>
            <p>Organizar una agenda o aprender a decir que no puede ayudar, pero no convierte condiciones laborales excesivas en algo aceptable. Una mirada clínica responsable considera horario, rol, estabilidad, apoyo, exigencias de cuidado y recursos reales de cada persona.</p>
            <h3>Recuperar una zona de decisión</h3>
            <p>Cuando todo parece urgente, busca una acción que devuelva algo de margen: definir una hora de cierre, negociar prioridades, pedir apoyo, tomar una pausa breve antes de responder o consultar por opciones formales dentro de tu trabajo. No resuelve todo, pero puede interrumpir la inercia.</p>
            <h3>Consultar no es rendirse</h3>
            <p>La terapia puede ser un espacio para ordenar el impacto emocional, revisar límites y decidir próximos pasos sin reducir un problema complejo a “gestionar mejor el estrés”. Si hay síntomas físicos importantes o ánimo muy bajo, también puede requerirse evaluación médica.</p>
        `,
    },
];

const scheduledBlogPosts: BlogPost[] = scheduledTopics
    .filter((topic) => !detailedClinicalPosts.some((post) => post.slug === topic.slug))
    .map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    excerpt: topic.excerpt,
    date: topic.date,
    author: 'Ps. Gustavo Caro',
    category: topic.category,
    image: topic.image,
    keywords: topic.keywords,
    content: renderScheduledPost(topic),
}));

blogPosts.push(...detailedClinicalPosts, ...scheduledBlogPosts);

export function isBlogPostPublished(post: BlogPost, referenceDate = new Date()) {
    const publishDate = new Date(`${post.date}T00:00:00-04:00`);
    return publishDate.getTime() <= referenceDate.getTime();
}

export function getPublishedBlogPosts(referenceDate = new Date()) {
    return blogPosts
        .filter((post) => isBlogPostPublished(post, referenceDate))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
