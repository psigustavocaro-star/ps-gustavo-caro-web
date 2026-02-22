
export interface BlogResource {
    id: string;
    title: string;
    description: string;
    content: string;
}

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: string;
    image: string;
    author: string;
    resources?: BlogResource[];
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'habilidades-parentales-era-hiperconectividad',
        title: 'Criar en un Mundo Digital: El Desafío de Reconectar en la Era de las Pantallas',
        excerpt: 'Una reflexión sobre cómo la tecnología ha mediado el vínculo entre padres e hijos, y cómo recuperar la presencia real en un hogar hiperconectado.',
        content: `
            <p>Muchas veces, en las entrevistas con padres en mi consulta, surge una frase cargada de nostalgia y cansancio: "Antes era más fácil". Y aunque la nostalgia suele ser un filtro engañoso, en este caso hay una verdad biológica. Nunca antes en la historia de la humanidad habíamos competido de forma tan directa con algoritmos diseñados por ingenieros de Silicon Valley para secuestrar la atención de nuestros hijos —y la nuestra.</p>
            
            <p>La parentalidad en 2026 no se trata solo de poner límites; se trata de gestionar la arquitectura del afecto en un entorno digital. He visto cómo la "presencia interrumpida" (ese acto de mirar el celular mientras nuestro hijo nos cuenta su día) genera una herida invisible: la sensación de que no somos lo suficientemente interesantes para competir con una notificación. Como adultos, también somos víctimas de esta dopamina barata, y el primer paso para una crianza consciente es reconocer nuestra propia vulnerabilidad ante la pantalla.</p>

            <h2>El Secuestro de la Atención</h2>
            <p>Cuando un niño se sumerge en horas de contenido de gratificación instantánea, su corteza prefrontal —el área encargada de la paciencia, la planificación y la empatía— entra en un estado de letargo. ¿Por qué esperar a que un árbol crezca o a terminar un puzzle si puedo tener una explosión de colores y sonidos cada tres segundos en TikTok? Estamos entrenando cerebros para la inmediatez, y luego les pedimos que se regulen emocionalmente ante la frustración de la vida real. Es una pelea desigual.</p>

            <p>Desde mi enfoque clínico, propongo que los padres dejen de ser "policías digitales" y pasen a ser **mentores digitales**. No se trata de prohibir (lo que solo genera ocultamiento), sino de mediar. Se trata de crear "oasis de desconexión" donde el silencio y el aburrimiento sean permitidos, porque es en el aburrimiento donde nace la creatividad y el autoconocimiento.</p>

            <h2>Reconstruyendo el Vínculo en el Aquí y el Ahora</h2>
            <p>La tecnología es una excelente herramienta, pero un pésimo refugio emocional. El desafío es volver a la mirada, al juego sin propósito y a la conversación que no busca una solución inmediata, sino solo la compañía. Criar hoy es un acto de resistencia; es decidir que, al menos durante la cena, el mundo entero puede esperar porque lo más importante está sentado frente a ti.</p>

            <p>En mi práctica, trabajamos no solo con el comportamiento del niño, sino con el sistema familiar completo. Porque un hijo que no se siente "visto" buscará esa mirada en el vacío infinito de internet. Mi labor es ayudarte a que vuelvas a ver a tu hijo, y que él aprenda a verse a sí mismo a través de tus ojos, no de una pantalla.</p>

            <h2>Referencias Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Turkle, S. (2015). <em>Alone Together: Why We Expect More from Technology and Less from Each Other</em>. Basic Books.</li>
                <li>Lembke, A. (2021). <em>Dopamine Nation: Finding Balance in the Age of Indulgence</em>. Dutton.</li>
                <li>Haidt, J. (2024). <em>The Anxious Generation: How the Great Rewiring of Childhood Is Causing an Epidemic of Mental Illness</em>. Penguin Press.</li>
            </ul>
        `,
        date: '2026-02-05',
        category: 'Parentalidad',
        image: '/blog/soledad-digital.png',
        author: 'Ps. Gustavo Caro',
        resources: [
            {
                id: 'contrato-digital-familiar',
                title: 'Contrato de Bienestar Digital Familiar',
                description: 'Un acuerdo colaborativo para establecer zonas y tiempos libres de pantallas en el hogar.',
                content: `
                    CONTRATO DE BIENESTAR DIGITAL - SISTEMA FAMILIAR
                    
                    ACUERDOS FUNDAMENTALES:
                    1. ZONAS LIBRES DE TECH: El comedor y los dormitorios son zonas de desconexión.
                    2. TIEMPO DE CALIDAD: Al menos 30 minutos diarios de juego o conversación sin dispositivos presentes.
                    3. EL MODELO: Los adultos nos comprometemos a no usar el celular durante las comidas.
                    4. LA HORA DEL SUEÑO: Los dispositivos se guardan en una "estación de carga" común 1 hora antes de dormir.
                    
                    RECUERDA: Este acuerdo no es un castigo, es un regalo de tiempo para todos.
                    
                    Propiedad de: www.psgustavocaro.cl - Psicología con Evidencia Académica.
                `
            }
        ]
    },
    {
        slug: 'salud-mental-docente-chile-claves',
        title: 'El Peso del Aula: Reflexiones sobre el Agotamiento y la Vocación en Chile',
        excerpt: 'Ser docente en el Chile actual es un acto de equilibrio emocional constante. Una mirada al burnout y cómo construir una resiliencia que sea real.',
        content: `
            <p>Muchas veces, al recibir a un profesor en mi consulta, lo primero que noto no es su cansancio físico, sino un tipo de fatiga más profunda: la fatiga por compasión. En Chile, la labor docente ha transitado desde la admiración social hacia una presión sistémica que parece no tener fin. El profesor hoy no solo enseña matemáticas o historia; contiene crisis emocionales, media en conflictos familiares y navega una burocracia que consume su tiempo más valioso: el tiempo con sus alumnos.</p>
            
            <p>El *Burnout* docente no es una falla individual de resiliencia; es la respuesta lógica de un sistema nervioso que se siente constantemente amenazado por el exceso de demanda y la falta de recursos. Es el síntoma de una vocación que está siendo erosionada por el estrés crónico.</p>

            <h2>De la Sobrevivencia a la Estrategia</h2>
            <p>En nuestra práctica, trabajamos para que el docente recupere su "centro". A menudo, el profesor se olvida de que para cuidar a otros, primero debe ser un territorio seguro para sí mismo. Aplicamos estrategias de la **Terapia Cognitivo Conductual** para desmantelar la creencia de que "un buen profesor lo da todo hasta quedar vacío". Esa es una falacia peligrosa.</p>

            <p>Aprender a poner límites no es ser menos vocacional; es ser más profesional. Es entender que tu salud mental es el recurso pedagógico más importante de tu sala de clases. Si tú no estás bien, tu capacidad de impactar positivamente en tus alumnos se reduce drásticamente.</p>

            <h2>Hacia un Autocuidado con Sentido</h2>
            <p>El autocuidado no es solo tomar un té o ir al spa. Es, fundamentalmente, la capacidad de decir "no" a las demandas que exceden nuestra salud. Es construir una comunidad con otros docentes donde el bienestar sea un objetivo compartido. Mi labor es acompañarte a redescubrir por qué elegiste este camino, pero esta vez, con las herramientas necesarias para recorrerlo sin perderte en el intento.</p>

            <h2>Referencias Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Maslach, C., & Leiter, M. P. (2016). <em>Understanding the burnout experience: Recent research and its implications for psychiatry</em>. World Psychiatry.</li>
                <li>Jennings, P. A. (2015). <em>Mindfulness for Teachers: A Guide for Peace and Productivity in the Classroom</em>. Norton.</li>
                <li>Ministerio de Educación Chile (2024). Estrategia Nacional de Salud Mental Docente.</li>
            </ul>
        `,
        date: '2026-01-15',
        category: 'Educación',
        image: '/blog/school-mental-health.png',
        author: 'Ps. Gustavo Caro',
        resources: [
            {
                id: 'guia-autocuidado-docente',
                title: 'Guía de Micro-Descansos Cognitivos para el Aula',
                description: 'Ejercicios de 3 minutos para regular el sistema nervioso entre bloques de clase.',
                content: `
                    GUÍA DE REGULACIÓN DOCENTE - PS. GUSTAVO CARO
                    
                    ESTRATEGIA 3-3-3 EN EL AULA:
                    1. PAUSA: Durante el cambio de bloque, cierra los ojos 30 segundos.
                    2. RESPIRACIÓN: Inhala en 4, mantén en 4, exhala en 8 (3 veces).
                    3. REENFOQUE: Nombra mentalmente 3 cosas que lograste hoy, por pequeñas que sean.
                    
                    Propiedad de: www.psgustavocaro.cl
                `
            }
        ]
    },
    {
        slug: 'mindfulness-compasion-terapia-cognitiva',
        title: 'La Revolución de la Amabilidad: Mindfulness y Compasión en la Clínica Moderna',
        excerpt: '¿Por qué somos nuestros jueces más severos? Descubre cómo la autocompasión basada en evidencia transforma el diálogo interno de castigo en uno de apoyo.',
        content: `
            <p>Vivimos en una cultura que rinde culto a la auto-exigencia. Se nos ha enseñado que el látigo interno nos hará mejores, más rápidos, más exitosos. Sin embargo, en mi consulta veo el costo de este sistema: personas agotadas por un crítico interno que nunca está satisfecho. Aquí es donde el **Mindfulness** y la **Compasión** dejan de ser conceptos "espirituales" para convertirse en herramientas clínicas de primer orden.</p>
            
            <p>El Mindfulness no es dejar la mente en blanco —algo imposible para nuestro cerebro biológico—, sino aprender a observar el flujo de pensamientos sin ser arrastrados por ellos. Es pasar de "Soy un fracaso" a "Estoy teniendo el pensamiento de que soy un fracaso". Esa pequeña distancia es donde ocurre la sanación.</p>

            <h2>La Ciencia de la Autocompasión</h2>
            <p>La autocompasión no es lástima por uno mismo ni benevolencia ciega. Es un sistema de regulación emocional que activa el sistema de calma y seguridad del cerebro, reduciendo el cortisol y aumentando la oxitocina. Es tratarse a uno mismo con la misma sabiduría y cuidado con la que tratarías a un buen amigo que está sufriendo.</p>

            <p>Integramos estas prácticas en la **Terapia Cognitivo Conductual** de tercera generación porque sabemos que el cambio real no ocurre a través del odio hacia uno mismo, sino a través de la aceptación radical de nuestra humanidad compartida. Todos sufrimos, todos fallamos, y todos merecemos un espacio de paz interna.</p>

            <h2>Referencias Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Neff, K. D. (2011). <em>Self-Compassion: The Proven Power of Being Kind to Yourself</em>. William Morrow.</li>
                <li>Germer, C. K. (2009). <em>The Mindful Path to Self-Compassion</em>. Guilford Press.</li>
                <li>Gilbert, P. (2010). <em>The Compassionate Mind</em>. Constable.</li>
            </ul>
        `,
        date: '2026-02-02',
        category: 'Bienestar',
        image: '/blog/mindfulness.png',
        author: 'Ps. Gustavo Caro',
        resources: [
            {
                id: 'guia-mindfulness-diario',
                title: 'Bitácora de Atención Plena y Autocompasión',
                description: 'Prácticas diarias para cultivar la presencia y suavizar el diálogo interno crítico.',
                content: `
                    BITÁCORA DE COMPASIÓN - PS. GUSTAVO CARO
                    
                    EJERCICIO: El Amigo Sabio.
                    Ante un error o momento difícil, escribe:
                    1. ¿Qué me estoy diciendo ahora mismo?
                    2. Si un amigo estuviera en esta misma situación, ¿qué le diría yo?
                    3. ¿Por qué me es difícil decirme esas mismas palabras a mí?
                    
                    Propiedad de: www.psgustavocaro.cl
                `
            }
        ]
    },
    {
        slug: 'estres-financiero-salud-mental-estrategias',
        title: 'El Dinero en la Mente: Navegando el Estrés Financiero desde la Psicología',
        excerpt: 'La deuda y la incertidumbre económica no solo afectan tu bolsillo, sino tu sistema nervioso central. Estrategias psicológicas para recuperar el control.',
        content: `
            <p>El dinero es, quizás, el último gran tabú en la consulta psicológica. Hablamos de sexo, de traumas de infancia y de miedos profundos, pero nos cuesta admitir cuánto nos duele la cuenta bancaria. Sin embargo, el estrés financiero es uno de los predictores más fuertes de ansiedad y depresión en la población adulta joven en Chile.</p>
            
            <p>Cuando vivimos bajo la presión de la deuda o la inestabilidad, nuestro cerebro entra en un estado de "visión de túnel". La capacidad de tomar decisiones a largo plazo se reduce, y quedamos atrapados en una reactividad constante. No es falta de educación financiera; es un cerebro bajo asedio.</p>

            <h2>Psicología del Gasto y del Ahorro</h2>
            <p>En terapia, exploramos nuestra relación emocional con el dinero. ¿Qué representa para ti? ¿Seguridad? ¿Estatus? ¿Libertad? ¿Identidad? A menudo, el gasto compulsivo es una forma ineficaz de regular una emoción dolorosa, un intento de llenar con un objeto un vacío que es puramente interno.</p>

            <p>Aplicamos técnicas de TCC para identificar estos gatillantes emocionales. Aprendemos a tolerar la incomodidad de no comprar y a construir una sensación de seguridad que no dependa exclusivamente del saldo bancario, aunque reconozcamos la realidad material de nuestras vidas.</p>

            <h2>Recuperando la Soberanía Personal</h2>
            <p>Sanar la relación con el dinero es un acto de soberanía. Es dejar de ser esclavos del miedo al futuro y empezar a habitar un presente donde el valor personal no se mide en pesos. Mi objetivo es ayudarte a que el dinero sea un recurso para tu vida, y no el dueño de tu paz mental.</p>

            <h2>Referencias Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Klontz, B., & Klontz, T. (2011). <em>Mind Over Money: Overcoming the Money Disorders that Threaten Our Financial Health</em>. Broadway Books.</li>
                <li>Richardson, T., et al. (2013). <em>The relationship between personal unsecured debt and mental health: A systematic review and meta-analysis</em>. Clinical Psychology Review.</li>
                <li>Meltzer, H., et al. (2011). <em>Personal debt and suicidal ideation</em>. Public Health.</li>
            </ul>
        `,
        date: '2026-02-04',
        category: 'Psicoeconomía',
        image: '/blog/burnout-chile.png',
        author: 'Ps. Gustavo Caro',
        resources: [
            {
                id: 'guia-psicofinanzas',
                title: 'Hoja de Ruta: Emoción y Gasto',
                description: 'Identifica tus patrones emocionales de consumo y recupera el control de tus finanzas.',
                content: `
                    HOJA DE RUTA PSICO-FINANCIERA - PS. GUSTAVO CARO
                    
                    EL SEMÁFORO DEL GASTO:
                    1. ROJO: ¿Siento ansiedad, aburrimiento o tristeza antes de comprar? (Si es así, DETENTE 24 horas).
                    2. AMARILLO: ¿Es un deseo o una necesidad real?
                    3. VERDE: He esperado 48 horas y sigo creyendo que aporta valor a mi vida.
                    
                    Propiedad de: www.psgustavocaro.cl
                `
            }
        ]
    },
    {
        slug: 'ansiedad-en-santiago-tratamiento-tcc',
        title: 'La Ciudad que no Duerme: Reflexiones sobre la Ansiedad en el Santiago de Hoy',
        excerpt: 'Una mirada íntima y clínica sobre cómo el ritmo vertical de nuestra capital impacta el sistema nervioso, y por qué la TCC es el faro en la tormenta.',
        content: `
            <p>A menudo, cuando camino por el Paseo Ahumada o espero el Metro en Baquedano, observo los rostros. No solo veo gente apurada; veo sistemas nerviosos en estado de hipervigilancia. Como psicólogo, he llegado a la conclusión de que Santiago no es solo una ciudad, es un organismo que respira a un ritmo que, a veces, nos asfixia. La ansiedad aquí no es una "falla" del individuo, sino una respuesta adaptativa —aunque dolorosa— a un entorno que nos exige eficiencia a cambio de nuestra paz.</p>
            
            <p>En mi consulta, la pregunta más recurrente no es "¿Qué es la ansiedad?", sino "¿Por qué a mí?". Y mi respuesta siempre comienza con una invitación a la compasión. Imagina que tu cerebro es un guardián incansable que, al detectar el ruido de la ciudad, la incertidumbre económica y la presión del éxito, decide activar la alarma de incendio todos los días, solo para asegurarse de que estás a salvo. El problema es que el humo que detecta no es fuego real, son pensamientos sobre el futuro.</p>

            <h2>El Laberinto de la Mente Urbana</h2>
            <p>La ansiedad urbana en Chile tiene un sabor particular. Es la rumiación sobre el "llegar a fin de mes", es el miedo al juicio del otro en un entorno altamente competitivo, y es, sobre todo, la desconexión con nuestro presente. Nos hemos convertido en maestros del "Y si...": "¿Y si pierdo el trabajo?", "¿Y si no soy suficiente?", "¿Y si algo malo pasa?". Estos pensamientos no son simples palabras; son comandos biológicos que le dicen a tu corazón que lata más rápido y a tus pulmones que atrapen el aire con urgencia.</p>

            <p>Desde la <strong>Terapia Cognitivo Conductual (TCC)</strong>, no buscamos "eliminar" la ansiedad —sería como intentar quitarle el sistema de seguridad a una casa—, sino que buscamos reentrenar al guardia. Queremos que el guardián aprenda a distinguir entre una amenaza real y un simple pensamiento catastrófico. Es un proceso de reeducación cerebral que requiere paciencia, método y, sobre todo, evidencia.</p>

            <h2>La TCC como Brújula Clínica</h2>
            <p>La evidencia científica es clara: para los trastornos de ansiedad, la TCC es el tratamiento de elección. ¿Por qué? Porque va a la raíz del mantenimiento del problema. No nos quedamos solo en el "sentir", bajamos al "hacer" y al "pensar". Utilizamos técnicas como la <strong>reestructuración cognitiva</strong> para diseccionar esos pensamientos que nos paralizan. No se trata de "pensar positivo" (eso sería una simplificación peligrosa), sino de pensar de forma realista.</p>

            <p>Cuando un paciente logra identificar que su taquicardia no es un infarto inminente, sino la respuesta física a un pensamiento de insuficiencia, algo cambia. Se abre una brecha de libertad. Como decía <em>Viktor Frankl</em>, entre el estímulo y la respuesta hay un espacio, y en ese espacio reside nuestra libertad y nuestro crecimiento. Mi labor es ayudarte a ensanchar ese espacio.</p>

            <h2>Hacia un Santiago más Consciente</h2>
            <p>Recuperar la salud mental en una metrópolis como la nuestra implica también reaprender a habitar el cuerpo. La ansiedad nos saca de nosotros mismos; la terapia nos devuelve. Es un camino de vuelta a casa, a un lugar donde el ruido del exterior ya no tiene el poder de silenciar tu voz interna.</p>

            <p>Si sientes que el ritmo de la ciudad ha superado tu capacidad de respuesta, recuerda que no estás solo. Pedir ayuda no es un acto de debilidad, sino de una valentía extraordinaria. Es decir: "Merezco vivir mejor".</p>

            <h2>Referencias Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Hofmann, S. G. (2012). <em>An Introduction to Modern CBT: Psychological Solutions to Mental Health Problems</em>. Wiley-Blackwell.</li>
                <li>Beck, J. S. (2020). <em>Cognitive Behavior Therapy: Basics and Beyond</em>. Guilford Press.</li>
                <li>Leahy, R. L. (2017). <em>The Worry Cure: Seven Steps to Stop Worry from Stopping You</em>. Piatkus.</li>
            </ul>
        `,
        date: '2026-02-06',
        category: 'Ansiedad',
        image: '/blog/anxiety-tcc.png',
        author: 'Ps. Gustavo Caro',
        resources: [
            {
                id: 'registro-pensamientos-ansiedad',
                title: 'Registro de Pensamientos Automáticos (TCC)',
                description: 'Una guía práctica para identificar y cuestionar los pensamientos que generan ansiedad.',
                content: `
                    REGISTRO DE PENSAMIENTOS AUTOMÁTICOS - PS. GUSTAVO CARO
                    
                    1. SITUACIÓN: ¿Qué ocurrió? (Ej: Una reunión de trabajo por Zoom).
                    2. EMOCIÓN: ¿Qué sentiste? (Ej: Miedo, angustia, palpitaciones). Califica de 1 a 10.
                    3. PENSAMIENTO AUTOMÁTICO: ¿Qué pasó por tu mente en ese segundo? (Ej: "Voy a cometer un error y todos se darán cuenta de que no sé nada").
                    4. EVIDENCIA A FAVOR: ¿Qué pruebas hay de que ese pensamiento es cierto?
                    5. EVIDENCIA EN CONTRA: ¿Qué pruebas hay de que ese pensamiento NO es real o es exagerado?
                    6. PENSAMIENTO ALTERNATIVO: Una visión más equilibrada. (Ej: "Puedo cometer errores como cualquiera, pero estoy preparado para esta reunión").
                    
                    Propiedad de: www.psgustavocaro.cl - Psicología con Evidencia Académica.
                `
            }
        ]
    },
    {
        slug: 'depresion-tratamiento-activacion-conductual-chile',
        title: 'El Laberinto de Sombras: Repensando la Depresión y el Retorno a la Vida',
        excerpt: 'Más que un estado de ánimo, la depresión es una desconexión. Descubre cómo la Activación Conductual nos permite volver a habitar nuestro día a día.',
        content: `
            <p>Hay una metáfora que suelo usar con mis pacientes: la depresión no es solo estar triste; es como si alguien hubiera bajado la saturación de colores de tu vida hasta dejarla en una escala de grises monótona y pesada. No es pereza, no es falta de voluntad. Es, en términos neurobiológicos y conductuales, un estado de baja recompensa. Tu cerebro ha dejado de recibir señales de que el mundo "vale la pena", y por lo tanto, decide ahorrar energía apagando las luces.</p>
            
            <p>En el contexto chileno, donde la exigencia de "estar bien" es constante, la depresión se vive a menudo en silencio, como una carga vergonzosa. Pero mi experiencia en la clínica me ha enseñado que la depresión es, ante todo, una señal de que algo en nuestra forma de interactuar con nuestro entorno se ha roto. Hemos dejado de hacer las cosas que nos daban sentido, no porque no queramos, sino porque el costo de hacerlas parece infinito.</p>

            <h2>La Trampa de la Inactividad</h2>
            <p>El ciclo de la depresión es cruelmente lógico: como me siento mal, no hago nada; como no hago nada, mi cerebro no recibe refuerzos positivos; como no hay refuerzos, me siento peor. Romper este ciclo con "pensamientos positivos" es casi imposible. Por eso, en la <strong>Terapia Cognitivo Conductual</strong>, apostamos por la <strong>Activación Conductual (AC)</strong>.</p>

            <p>La AC es revolucionaria en su simplicidad: no esperamos a "tener ganas" para actuar. Actuamos para generar las ganas. Es mover el cuerpo aunque la mente diga que no. Es una forma de decirle a tu biología: "Estamos vivos, y vamos a recuperar nuestro territorio".</p>

            <h2>Dominio y Agrado: Las Dos Columnas de la Recuperación</h2>
            <p>En nuestras sesiones, nos enfocamos en dos tipos de actividades. Primero, las actividades de <strong>dominio</strong>: esas pequeñas tareas que te dan una sensación de logro (ordenar un cajón, pagar una cuenta, lavarte el pelo). Segundo, las actividades de <strong>agrado</strong>: cosas que solías disfrutar, aunque ahora no sientas el mismo placer. Al reintroducir estas piezas en el puzzle de tu semana, empezamos a subir el volumen de la vida, nota a nota.</p>

            <p>La depresión nos dice que el futuro será igual que el presente gris. La terapia nos demuestra, a través de la acción, que el futuro es un espacio que todavía podemos construir. Mi rol es acompañarte en ese primer paso, el más difícil, el que se da cuando todavía no hay luz al final del túnel, pero decides caminar de todas formas.</p>

            <h2>Referencias Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Martell, C. R., Dimidjian, S., & Herman-Dunn, R. (2010). <em>Behavioral Activation for Depression: A Clinician's Guide</em>. Guilford Press.</li>
                <li>Cuijpers, P., et al. (2023). <em>The efficacy of behavioral activation for depression: A meta-analysis</em>. Journal of Affective Disorders.</li>
                <li>Mazzucchelli, T. G., et al. (2009). <em>Behavioral activation treatments for depression in adults: A meta-analysis and review</em>. Clinical Psychology: Science and Practice.</li>
            </ul>
        `,
        date: '2026-02-07',
        category: 'Depresión',
        image: '/blog/healthy-relationships.png',
        author: 'Ps. Gustavo Caro',
        resources: [
            {
                id: 'planificador-activacion-conductual',
                title: 'Planificador de Activación Conductual',
                description: 'Un registro semanal para programar actividades de agrado y dominio, rompiendo el ciclo de la apatía.',
                content: `
                    PLANIFICADOR DE ACTIVACIÓN CONDUCTUAL - PS. GUSTAVO CARO
                    
                    INSTRUCCIONES: No busques actividades heroicas. Busca lo pequeño.
                    
                    CATEGORÍAS A CUBRIR:
                    1. DOMINIO (Logro): Ej: Hacer la cama, responder ese correo pendiente, cocinar algo simple.
                    2. AGRADO (Placer): Ej: Escuchar un disco completo, caminar 10 minutos, tomar un té sin distracciones.
                    
                    TABLA SEMANAL:
                    - LUNES: [Actividad] - Calificación de Agrado / Logro (1 a 10)
                    - MARTES: [Actividad] - Calificación de Agrado / Logro (1 a 10)
                    ... (Repetir para la semana)
                    
                    RECUERDA: "Afuera de la cama primero, el ánimo vendrá después".
                    
                    Propiedad de: www.psgustavocaro.cl - Psicología con Evidencia Académica.
                `
            }
        ]
    },
    {
        slug: 'tdah-adulto-estrategia-gestion-dopamina',
        title: 'El Cerebro que Busca la Chispa: Entendiendo el TDAH en la Adultez',
        excerpt: 'Más allá de la distracción, el TDAH es una forma distinta de procesar el mundo. Aprende a convertir tu neurodivergencia en tu mejor aliado.',
        content: `
            <p>A menudo, mis pacientes adultos con TDAH llegan a la primera sesión con una mochila cargada de etiquetas: "flojo", "despistado", "impulsivo", "inconstante". Pero lo primero que hacemos es vaciar esa mochila. Lo que ellos llaman fallas morales, la ciencia lo llama <strong>disfunción ejecutiva</strong>. No es que no quieran prestar atención; es que su cerebro tiene un sistema de filtrado de estímulos que funciona de manera diferente al de la mayoría.</p>
            
            <p>Imagina que el cerebro es una orquesta. En un cerebro neurotípico, el director de orquesta (la corteza prefrontal) decide cuándo tocan los violines y cuándo callan las trompetas. En un cerebro con TDAH, los músicos son brillantes, pero el director a veces se distrae o no tiene la batuta con suficiente fuerza. El resultado no es falta de música, es un caos creativo que puede ser agotador.</p>

            <h2>La Sed de Dopamina</h2>
            <p>La clave para entender el TDAH adulto está en la dopamina. El cerebro con TDAH vive en una búsqueda constante de estímulos que generen esa "chispa" dopaminérgica. Por eso las tareas rutinarias, los trámites y los correos administrativos se sienten como escalar el Everest, mientras que las crisis o los proyectos apasionantes activan una hiperfocalización asombrosa.</p>

            <p>Desde la <strong>Terapia Cognitivo Conductual</strong>, nuestro objetivo no es "normalizar" el cerebro, sino crear **andamiajes externos**. Si el director de orquesta interno es intermitente, instalamos un director externo: sistemas de organización, gestión del entorno y estrategias de regulación emocional que permitan que esa orquesta brille sin desgastarse.</p>

            <h2>De la Culpa a la Estrategia</h2>
            <p>El mayor enemigo del TDAH adulto no es la falta de atención, es la vergüenza acumulada por años de no encajar en moldes rígidos. Al comprender que tu cerebro simplemente necesita un combustible diferente y un mapa distinto, la culpa da paso a la estrategia. Aprendemos a dividir tareas en átomos, a hackear la dopamina y a perdonarnos cuando las cosas no salen perfecto.</p>

            <p>Ser neurodivergente en un mundo diseñado para la neurotipicidad es un desafío diario, pero también es una oportunidad para ver soluciones donde otros solo ven problemas. Mi trabajo es ayudarte a que el "ruido" se convierta, finalmente, en una melodía que tú mismo puedas dirigir.</p>

            <h2>Referencias Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Barkley, R. A. (2012). <em>Executive Functions: What They Are, How They Work, and Why They Evolved</em>. Guilford Press.</li>
                <li>Brown, T. E. (2013). <em>A New Understanding of ADHD in Children and Adults</em>. Routledge.</li>
                <li>Safren, S. A., et al. (2017). <em>Mastering Your Adult ADHD: A Cognitive-Behavioral Treatment Program</em>. Oxford University Press.</li>
            </ul>
        `,
        date: '2026-01-05',
        category: 'Neurodivergencia',
        image: '/blog/tdah-adulto.png',
        author: 'Ps. Gustavo Caro',
        resources: [
            {
                id: 'estrategias-tdah-adulto',
                title: 'Guía de Estrategias de Andamiaje para TDAH',
                description: 'Herramientas prácticas para externalizar las funciones ejecutivas y reducir la carga cognitiva diaria.',
                content: `
                    GUÍA DE ESTRATEGIAS PARA TDAH ADULTO - PS. GUSTAVO CARO
                    
                    1. EXTERNALIZAR EL TIEMPO:
                    - Usa relojes analógicos para "ver" pasar el tiempo.
                    - Técnica de Micro-Pomodoro: 15 min de trabajo, 5 de descanso.
                    
                    2. EXTERNALIZAR LA MEMORIA:
                    - La regla de "No lo pienses, anótalo": Tu cerebro no es para guardar información, es para procesarla.
                    - Puntos de Control: Una bandeja única para llaves, billetera y celular.
                    
                    3. GESTIÓN DEL ENTORNO:
                    - Reduce el ruido visual en tu escritorio.
                    - Escucha "Ruido Marrón" (Brown Noise) para calmar la inquietud motora.
                    
                    REGLA DE ORO: Si tarda menos de 2 minutos, hazlo AHORA.
                    
                    Propiedad de: www.psgustavocaro.cl - Psicología con Evidencia Académica.
                `
            }
        ]
    },
    {
        slug: 'ley-salud-mental-integral-chile-2026',
        title: 'Nueva Ley de Salud Mental en Chile: Un Hito hacia la Protección Integral',
        excerpt: 'Análisis legislativo y clínico sobre el nuevo marco legal que garantiza el acceso y la protección de los derechos de los pacientes en 2026.',
        content: `
            <h2>1. Un Cambio Histórico en la Salud Pública</h2>
            <p>La promulgación de la Ley de Salud Mental Integral este 2026 representa el avance más importante en la materia en las últimas décadas en Chile. Este marco legal sitúa a la salud mental al mismo nivel de relevancia que la salud física, abordando la brecha histórica de financiamiento y cobertura.</p>
            
            <h2>2. Puntos Clave para el Paciente y el Profesional</h2>
            <p>La ley introduce cambios fundamentales que todo ciudadano y profesional de la salud debe conocer:</p>
            <ul>
                <li><strong>Garantía de Acceso Universal:</strong> Se establecen plazos máximos de atención para patologías prioritarias, reduciendo las listas de espera en el sistema público.</li>
                <li><strong>Protección contra la Discriminación:</strong> Prohibición explícita de clausulas de exclusión por preexistencias psiquiátricas en seguros privados (Isapres).</li>
                <li><strong>Derecho a la Privacidad Digital:</strong> Protocolos estrictos sobre el manejo de fichas clínicas en plataformas de telemedicina.</li>
            </ul>

            <h2>3. Impacto en la Psicoterapia</h2>
            <p>Para nosotros como terapeutas, la ley facilita la continuidad del tratamiento al asegurar reembolsos más justos y proteger la autonomía del juicio clínico frente a las directrices administrativas de las aseguradoras.</p>

            <h2>Referencias Legales y Académicas</h2>
            <ul style="font-size: 0.9rem; color: #666;">
                <li>Biblioteca del Congreso Nacional de Chile (2026). <em>Ley N° 21.XXX sobre Salud Mental Integral</em>.</li>
                <li>Colegio de Psicólogos de Chile (2025). Análisis técnico del proyecto de ley de salud mental.</li>
            </ul>
        `,
        date: '2026-02-01',
        category: 'Legislación',
        image: '/blog/neuro-chile.png',
        author: 'Ps. Gustavo Caro'
    }
];
