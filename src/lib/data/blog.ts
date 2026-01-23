export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: string;
    image: string;
    author: string;
}

export const blogPosts: BlogPost[] = [
    {
        slug: '2026-ano-del-cerebro-chile',
        title: '2026: El "Año del Cerebro" en Chile',
        excerpt: 'Chile ha declarado este año para la reflexión nacional sobre la salud mental. Es el momento de hablar sobre neuroplasticidad y cómo nuestros hábitos moldean nuestra mente.',
        content: `
            <h2>Neuroplasticidad: Tu cerebro no es una pieza de hardware fija</h2>
            <p>Estamos en el 2026 y Chile finalmente ha puesto el foco donde corresponde: nuestro órgano central. Hablar del "Año del Cerebro" no es solo un eslogan político; es un llamado a entender que la <strong>neuroplasticidad</strong> —la capacidad de nuestro cerebro para reorganizarse— está ocurriendo ahora mismo, mientras lees esto.</p>

            <h3>Hábitos en Santiago y regiones: El impacto del entorno</h3>
            <p>Vivir en Santiago, con sus niveles de ruido y ritmo vertical, o en regiones con sus propias presiones económicas, moldea nuestra estructura cerebral. La exposición constante al cortisol por el tráfico o la incertidumbre financiera degrada nuestras funciones ejecutivas. Sin embargo, la ciencia es clara: podemos intervenir.</p>

            <h3>Plan de acción para el cuidado cerebral</h3>
            <ul>
                <li><strong>Estimulación Cognitiva Dirigida:</strong> No basta con hacer puzzles; el cerebro necesita novedad y desafío técnico.</li>
                <li><strong>Higiene del Sueño Proactiva:</strong> El cerebro se "limpia" de detritos metabólicos durante el sueño profundo. Si no duermes, tu rendimiento cognitivo baja un 30% al día siguiente.</li>
                <li><strong>Nutrición Neuroprotectora:</strong> Menos procesados, más Omega-3. Pragmatismo nutricional para un cerebro eficiente.</li>
            </ul>

            <p>Este 2026, dejemos de ver la salud mental como algo abstracto. Es biología, es química y es, sobre todo, gestionable.</p>
        `,
        date: '2026-01-22',
        category: 'Neurociencia',
        image: '/blog/neuro-chile.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'ia-en-terapia-aliada-o-amenaza',
        title: 'IA en Terapia: ¿Aliada o Amenaza para el Vínculo?',
        excerpt: 'El auge de los chatbots emocionales plantea un debate ético. ¿Dónde termina la automatización y dónde empieza el juicio clínico?',
        content: `
            <h2>Tecnología y Salud Mental: Una perspectiva pragmática</h2>
            <p>Como alguien que integra la tecnología en su flujo de trabajo, entiendo el valor de la IA. Actualmente, herramientas de inteligencia artificial ayudan en la detección temprana de patrones de riesgo en el lenguaje. Es eficiente, es rápido y escala. Pero, ¿puede reemplazar la alianza terapéutica?</p>

            <h3>El límite del algoritmo</h3>
            <p>La terapia no es solo procesamiento de datos. Es <strong>vínculo humano</strong>. Un chatbot puede entregarte una técnica de respiración (un "entregable" básico), pero carece del juicio clínico para entender el subtexto emocional, el lenguaje no verbal y la historia de vida que se entrelaza en una sesión.</p>

            <h3>La IA como copiloto, no como piloto</h3>
            <p>Mi postura es ejecutiva: usemos la IA para automatizar lo tedioso (registros, recordatorios, análisis de grandes volúmenes de datos clínicos) para que el terapeuta tenga más tiempo para lo esencial: la conexión humana.</p>

            <ul>
                <li><strong>Detección temprana:</strong> Algoritmos que alertan sobre crisis antes de que ocurran.</li>
                <li><strong>Apoyo 24/7:</strong> Herramientas de contención de primer nivel para técnicas de regulación.</li>
                <li><strong>El factor humano:</strong> La ética profesional y el discernimiento clínico siguen siendo patrimonio exclusivo del profesional.</li>
            </ul>
        `,
        date: '2026-01-20',
        category: 'Tecnología',
        image: '/blog/ai-therapy.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'burnout-2026-crisis-laboral-chile',
        title: 'Burnout 2026: La Crisis Estructural en el Trabajo Chileno',
        excerpt: '9 de cada 10 trabajadores presentan síntomas de estrés este año. Estrategias de supervivencia y salud organizacional.',
        content: `
            <h2>La paradoja de la eficiencia</h2>
            <p>Las cifras de este año son alarmantes: el 90% de la fuerza laboral chilena reporta síntomas de agotamiento. No es solo "cansancio"; es <strong>burnout estructural</strong>. En un mercado competitivo, el costo de oportunidad de no cuidar la salud mental de los equipos es el desplome de los márgenes de ganancia por licencias y rotación.</p>

            <h3>Signos de alerta en el contexto local</h3>
            <p>Si sientes que el domingo en la tarde te genera una angustia incontrolable, o si el trato con tus colegas se ha vuelto puramente cínico, estás en la zona de riesgo. En Chile, la cultura del "presentismo" sigue pesando, pero la salud mental no entiende de horarios de oficina.</p>

            <h3>Guía de supervivencia organizacional</h3>
            <ol>
                <li><strong>Desconexión Digital Efectiva:</strong> No responder correos post 19:00 hrs no es falta de compromiso, es gestión de activos biológicos.</li>
                <li><strong>Micro-descansos de Alta Calidad:</strong> 5 minutos de desconexión total cada 90 minutos de trabajo técnico profundo.</li>
                <li><strong>Límites Asertivos:</strong> Aprender a decir "no" a tareas periféricas para enfocarse en el core del negocio personal: tu bienestar.</li>
            </ol>

            <p>Si eres líder de equipo o dueño de una SpA, entiende esto: un trabajador quemado es una pérdida operativa. Invertir en salud mental es pragmatismo puro.</p>
        `,
        date: '2026-01-18',
        category: 'Laboral',
        image: '/blog/burnout-chile.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'ansiedad-inseguridad-ciudad-tecnicas-regulacion',
        title: 'Ansiedad e Inseguridad: Técnicas de Regulación en la Ciudad',
        excerpt: 'La incertidumbre económica y la seguridad pública son los mayores gatillantes de ansiedad hoy. Cómo regularse ante lo incontrolable.',
        content: `
            <h2>El estresor externo: Más allá de la clínica</h2>
            <p>Hoy, el 25% de los adultos chilenos presenta niveles clínicos de ansiedad. No es una cifra al azar; responde a factores externos reales: inseguridad en las calles y volatilidad económica. Como terapeuta, mi enfoque no es ignorar esta realidad, sino darte las herramientas para que tu sistema nervioso no colapse ante ella.</p>

            <h3>Controlar lo controlable</h3>
            <p>La ansiedad se alimenta de la falta de control. El primer paso pragmático es desglosar tus preocupaciones en dos listas: lo que depende de ti y lo que no. Gastar energía cognitiva en lo incontrolable es ineficiente.</p>

            <h3>Técnicas de regulación inmediata</h3>
            <ul>
                <li><strong>Anclaje Sensorial (5-4-3-2-1):</strong> Ante un ataque de pánico en el transporte público, reconecta con tus sentidos para bajar la activación de la amígdala.</li>
                <li><strong>Exposición Informativa Limitada:</strong> El "doomscrolling" de noticias policiales satura tu sistema de alerta. Define ventanas de 10 minutos al día para informarte.</li>
                <li><strong>Entrenamiento en Resiliencia:</strong> No es "aguantar", es desarrollar la flexibilidad para adaptarte a entornos cambiantes sin perder tu centro.</li>
            </ul>
        `,
        date: '2026-01-17',
        category: 'Salud Mental',
        image: '/blog/ansiedad-ciudad.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'epidemia-silenciosa-soledad-digital',
        title: 'La Epidemia Silenciosa: Soledad en Adultos Jóvenes',
        excerpt: 'Hiperconectados pero aislados. Cómo reconstruir vínculos significativos en la era de la soledad digital.',
        content: `
            <h2>La paradoja del smartphone</h2>
            <p>Estamos en Santiago, rodeados de millones, con 5G y fibra óptica, pero más solos que nunca. Para los adultos entre 30 y 40 años, la desconexión afectiva es un problema creciente. El "like" ha reemplazado a la conversación de café, y el costo emocional es el vacío.</p>

            <h3>Vínculos significativos vs. Interacciones digitales</h3>
            <p>Una interacción digital es de baja fidelidad; carece de feromonas, de contacto visual real y de la retroalimentación sutil del lenguaje corporal. La soledad digital no se cura con más seguidores, sino con <strong>vínculos de alta calidad</strong>.</p>

            <h3>Cómo reconstruir tu red social</h3>
            <ol>
                <li><strong>Rituales de Presencialidad:</strong> Al menos un encuentro cara a cara a la semana sin pantallas de por medio.</li>
                <li><strong>Comunidades de Interés:</strong> Busca grupos donde el "entregable" sea una actividad compartida (deporte, hobbies, voluntariado).</li>
                <li><strong>Vulnerabilidad Asertiva:</strong> Aprende a decir "estoy pasando un mal momento" en lugar de subir una foto feliz a Instagram.</li>
            </ol>
        `,
        date: '2026-01-16',
        category: 'Vínculos',
        image: '/blog/soledad-digital.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'neurodiversidad-adultos-diagnostico-tardio',
        title: 'Neurodiversidad en Adultos: El Boom del Diagnóstico Tardío',
        excerpt: 'Mucha gente busca hoy respuestas a comportamientos de toda la vida. El proceso de diagnóstico en adultos y su impacto.',
        content: `
            <h2>¿Por qué ahora?</h2>
            <p>Muchos adultos han pasado décadas sintiéndose "fuera de lugar", operando bajo un <strong>masking</strong> constante para encajar en expectativas neurotípicas. En mi práctica, veo un aumento significativo de personas entre 30 y 50 años que, al ver a sus hijos en procesos PIE o evaluaciones, se reconocen a sí mismos.</p>

            <h3>TEA y TDAH: Más allá de la etiqueta</h3>
            <p>El diagnóstico tardío de TEA o TDAH no es una sentencia; es una <strong>hoja de ruta</strong>. Permite pasar de la culpa ("¿por qué soy tan desordenado?") a la estrategia ("mi cerebro funciona con otros niveles de dopamina").</p>

            <h3>El valor de la evaluación profesional</h3>
            <p>Plataformas de evaluación como las que implementamos permiten un desglose multidimensional del perfil cognitivo. No buscamos solo un nombre para el problema, buscamos entender el sistema operativo del paciente.</p>
        `,
        date: '2026-01-15',
        category: 'Neurodivergencia',
        image: '/blog/late-diagnosis.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'salud-mental-escolar-transicion-media',
        title: 'Salud Mental Escolar: El Punto Crítico de los 12 Años',
        excerpt: 'La transición a la enseñanza media es el momento de mayor riesgo en Chile. Cómo detectar señales de alerta temprana.',
        content: `
            <h2>La brecha del séptimo básico</h2>
            <p>Como profesional inserto en el sistema escolar, sé que los 12 años son el "punto crítico" de la salud mental en Chile. Es el paso de la protección de la básica a la selva de la media. Las exigencias académicas suben y el soporte emocional muchas veces baja.</p>

            <h3>Factores de Riesgo en el Colegio</h3>
            <p>El aumento del ciberacoso y la búsqueda de identidad generan un cóctel de inseguridad. Aquí, el rol de los padres y orientadores debe ser de <strong>monitoreo activo y humano</strong>.</p>

            <h3>Señales de alerta para padres</h3>
            <ul>
                <li><strong>Cambios en el patrón de sueño:</strong> Los indicadores biológicos son los primeros en fallar.</li>
                <li><strong>Deserción Silenciosa:</strong> El niño está en clase, pero sus notas y su interés han desaparecido.</li>
                <li><strong>Aislamiento Extremo:</strong> No salir del cuarto ni para actividades familiares básicas.</li>
            </ul>
        `,
        date: '2026-01-12',
        category: 'Educación',
        image: '/blog/school-mental-health.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'neuroarquitectura-entorno-y-mente',
        title: 'Neuroarquitectura: Tu Entorno y tu Mente',
        excerpt: 'Cómo el diseño de nuestras oficinas y hogares afecta nuestra salud cognitiva. Consejos prácticos para mejorar el bienestar emocional.',
        content: `
            <h2>El espacio como herramienta clínica</h2>
            <p>La neuroarquitectura estudia cómo el entorno físico modifica nuestra química cerebral. No es decoración; es <strong>diseño para el bienestar</strong>. Un espacio mal iluminado o con ruido constante mantiene al cerebro en un estado de alerta perenne (activación simpática), mermando tu productividad y paz mental.</p>

            <h3>Elementos clave para tu oficina u hogar</h3>
            <ul>
                <li><strong>Luz Natural y Ritmos Circadianos:</strong> La luz del sol regula la melatonina y el cortisol. Trabajar a oscuras es pedirle a tu cerebro que colapse.</li>
                <li><strong>Biofilia:</strong> La integración de plantas no es por estética; reduce el estrés percibido y mejora la oxigenación del espacio.</li>
                <li><strong>Acústica Controlada:</strong> El ruido de fondo de Santiago reduce tu capacidad de atención profunda en un 15%.</li>
            </ul>

            <h3>Consejos prácticos hoy</h3>
            <p>Despeja tu campo visual. Un escritorio desordenado es carga cognitiva innecesaria. El orden visual se traduce en orden mental.</p>
        `,
        date: '2026-01-11',
        category: 'Bienestar',
        image: '/blog/neuroarquitectura.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'brecha-acceso-salud-mental-chile',
        title: 'La Brecha de Acceso: Fonasa, Isapres y el "Derecho a Estar Bien"',
        excerpt: 'Por qué la salud mental aún no está plenamente integrada en el sistema chileno. Psicoeducación sobre derechos del paciente.',
        content: `
            <h2>El costo de la salud mental</h2>
            <p>Seamos directos: en Chile, atenderse con un psiquiatra o psicólogo de calidad es caro. La cobertura de Isapres es limitada y las listas de espera en Fonasa son prohibitivas. Esto crea una brecha donde el "derecho a estar bien" parece un privilegio de pocos.</p>

            <h3>Derechos del Paciente y el GES</h3>
            <p>Es fundamental conocer tus beneficios. Patologías como la Depresión y el Trastorno Bipolar están en el GES, pero la cobertura de psicoterapia sigue siendo el eslabón débil del sistema.</p>

            <h3>Hacia un sistema integrado</h3>
            <p>La salud mental debe ser parte del core de la salud pública, no un anexo. Invertir en prevención escolar y laboral ahorraría millones al Estado en licencias médicas y pérdida de productividad.</p>
        `,
        date: '2026-01-10',
        category: 'Opinión',
        image: '/blog/neuro-chile.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'prevencion-adicciones-era-post-pandemia',
        title: 'Prevención de Adicciones en la Era Post-Pandemia',
        excerpt: 'Cómo el consumo de sustancias ha mutado en Chile hacia formas más solitarias y ligadas a la evasión del estrés diario.',
        content: `
            <h2>La mutación del consumo</h2>
            <p>Post-pandemia, hemos visto un cambio en el patrón de consumo en Chile. Ya no es solo el "carrete" social; es el consumo solitario para evadir la ansiedad del día a día. El alcohol y los psicofármacos sin receta se han vuelto los "automedicamentos" de una población estresada.</p>

            <h3>Perspectiva Multidimensional</h3>
            <p>La adicción no es una falta de voluntad; es un problema de <strong>regulación emocional</strong> fallido. Abordar esto requiere entender el contexto laboral, familiar y biológico del paciente.</p>

            <ul>
                <li><strong>Prevención Temprana:</strong> Detectar patrones de evasión antes de que se vuelvan dependencia.</li>
                <li><strong>Tratamiento Integral:</strong> No basta con dejar la sustancia, hay que construir una vida que no necesites evadir.</li>
            </ul>
        `,
        date: '2026-01-08',
        category: 'Adicciones',
        image: '/blog/mindfulness.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'tdah-adulto-estrategia-gestion-dopamina',
        title: 'TDAH en el Mundo Laboral: Gestión de la Dopamina',
        excerpt: 'Cómo transformar un cerebro con TDAH en una ventaja competitiva a través de sistemas y procesos claros.',
        content: `
            <h2>El cerebro buscador de novedades</h2>
            <p>Tener TDAH en el trabajo no es solo "distraerse". Es tener un cerebro que busca dopamina constantemente. Si la tarea es aburrida, tu cerebro simplemente se apaga. Pero si hay interés, puedes entrar en un estado de **hiper-foco** que supera a cualquier profesional neurotípico.</p>

            <h3>Sistemas sobre voluntad</h3>
            <p>No confíes en tu memoria o en tu voluntad; confía en tus <strong>procesos</strong>. La clave ejecutiva para el TDAH adulto es externalizar las funciones ejecutivas.</p>

            <h3>Mis herramientas recomendadas</h3>
            <ul>
                <li><strong>Visualización de Tareas:</strong> Si no lo ves, no existe. Usa pizarras o gestores de tareas digitales con recordatorios agresivos.</li>
                <li><strong>Bloques de Tiempo (Time Blocking):</strong> Protege tu enfoque de las interrupciones externas.</li>
                <li><strong>Acomodaciones Sensoriales:</strong> Un entorno con menos distracciones visuales permite que tu cerebro se concentre en el core del entregable.</li>
            </ul>
        `,
        date: '2026-01-05',
        category: 'Neurodivergencia',
        image: '/blog/tdah-adulto.png',
        author: 'Ps. Gustavo Caro'
    }
];
