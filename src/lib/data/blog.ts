export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    category: 'Salud Mental' | 'Neurodiversidad' | 'Ansiedad' | 'Opinión' | 'Recursos';
    image: string;
    resources?: {
        title: string;
        description: string;
        link: string;
    }[];
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'ansiedad-social-metro-santiago',
        title: 'Sobrevivir a la hora punta: Ansiedad social en el Metro de Santiago',
        excerpt: 'Cómo el hacinamiento y el ruido del transporte público afectan nuestro sistema nervioso y qué técnicas usar en el momento.',
        date: '2024-04-10',
        author: 'Ps. Gustavo Caro',
        category: 'Ansiedad',
        image: 'https://images.unsplash.com/photo-1595181829241-e374d6c4e09a?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Para muchos santiaguinos, el día no comienza en la oficina, sino en el andén de la Línea 1 o la Línea 4. El Metro de Santiago, aunque eficiente, representa uno de los mayores desafíos diarios para quienes lidian con ansiedad social o hipersensibilidad sensorial.</p>
            
            <h3>El impacto del hacinamiento</h3>
            <p>Cuando estamos rodeados de desconocidos en un espacio reducido, nuestro cerebro reptiliano puede interpretar la situación como una amenaza. El contacto físico involuntario, el ruido de los frenos y la falta de espacio personal disparan los niveles de cortisol.</p>
            
            <h3>Opinión: La ciudad no nos cuida</h3>
            <p>Personalmente, creo que hemos normalizado un nivel de estrés urbano que es insostenible. No se trata solo de "llegar a la hora", se trata de cómo llegamos. Llegar con el pulso a cien y la respiración cortada condiciona todo nuestro desempeño laboral y emocional.</p>
            
            <h3>Técnicas de choque en el vagón</h3>
            <ul>
                <li><strong>La técnica 5-4-3-2-1:</strong> Identifica 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles y 1 que saboreas. Ayuda a anclarte al presente.</li>
                <li><strong>Cancelación de ruido:</strong> Invertir en buenos audífonos no es un lujo, es una herramienta de salud mental.</li>
                <li><strong>Respiración cuadrada:</strong> Inhala en 4, mantén en 4, exhala en 4, mantén en 4.</li>
            </ul>
        `
    },
    {
        slug: 'tdah-adulto-oficinas-santiago',
        title: 'TDAH Adulto: El desafío invisible en Sanhattan',
        excerpt: 'Trabajar en los centros financieros de Santiago exige una atención lineal que el cerebro neurodivergente a veces no puede dar.',
        date: '2024-04-08',
        author: 'Ps. Gustavo Caro',
        category: 'Neurodiversidad',
        image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>El TDAH en adultos no es "falta de voluntad", es una diferencia en la arquitectura química del cerebro. En barrios como el Golf o Nueva Las Condes (Sanhattan), las expectativas de productividad son altísimas y muy rígidas.</p>
            
            <h3>¿Por qué es más difícil en Santiago?</h3>
            <p>Nuestra cultura laboral todavía castiga mucho al que no sigue el ritmo tradicional. Las oficinas abiertas (open office) son el enemigo número uno de la concentración para alguien con TDAH.</p>
            
            <h3>Estrategias de adaptación</h3>
            <p>Si eres neurodivergente en este entorno, necesitas crear tu propio "ecosistema de foco". El uso de bloqueadores de tiempo y la técnica Pomodoro adaptada son vitales.</p>
        `
    },
    {
        slug: 'estigma-salud-mental-familias-chilenas',
        title: 'El "no sea flojo": Rompiendo el estigma en la familia chilena',
        excerpt: 'Por qué a las familias en Chile les cuesta tanto entender que la depresión no es falta de ánimo, sino una enfermedad real.',
        date: '2024-04-05',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Históricamente, en Chile hemos tenido una cultura de "ponerle el hombro" a todo. Aunque esto nos ha hecho resilientes ante terremotos, nos ha hecho muy crueles ante los "terremotos internos".</p>
            
            <h3>La validación emocional</h3>
            <p>Escuchar a un hijo o a una pareja decir que se siente mal y responder con "pero si tienes todo", es una forma de invalidación que profundiza el problema.</p>
            
            <p>Es hora de entender que la salud mental es tan física como una pierna rota. No le pedirías a alguien con la pierna quebrada que corra una maratón solo con "ánimo".</p>
        `
    },
    {
        slug: 'invierno-gris-santiago-depresion',
        title: 'El invierno gris de Santiago: Combatiendo el Trastorno Afectivo Estacional',
        excerpt: 'La falta de luz solar en los meses de invierno en la capital chilena tiene un efecto directo en nuestra serotonina.',
        date: '2024-04-01',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: 'https://images.unsplash.com/photo-1478144592103-258228292733?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Santiago tiene inviernos con mucha polución y poca luz. Esto genera lo que llamamos Trastorno Afectivo Estacional (TAE).</p>
            <h3>Síntomas comunes</h3>
            <ul>
                <li>Ganas de comer carbohidratos en exceso.</li>
                <li>Dormir más de lo habitual y no sentirse descansado.</li>
                <li>Irritabilidad y retiro social.</li>
            </ul>
        `
    },
    {
        slug: 'ritmo-frenetico-santiago-cortisol',
        title: 'Vivir a mil: El impacto del ritmo santiaguino en tu cortisol',
        excerpt: 'Nuestra ciudad se mueve rápido, y nuestro cuerpo paga el precio con inflamación y estrés crónico.',
        date: '2024-03-28',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>El estrés no es solo mental, es bioquímico. El cortisol alto de forma constante nos enferma. En Santiago, vivimos en un estado de alerta perenne.</p>
        `
    },
    {
        slug: 'higiene-sueno-ciudad-luces',
        title: 'Dormir en la ciudad que nunca se apaga',
        excerpt: 'Cómo la contaminación lumínica y el ruido de Santiago afectan tu higiene del sueño y cómo recuperar tus noches.',
        date: '2024-03-25',
        author: 'Ps. Gustavo Caro',
        category: 'Recursos',
        image: 'https://images.unsplash.com/photo-1519003722824-192d9920188d?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>El sueño es el taller de reparación de tu mente. Si no duermes bien, tu capacidad de regular emociones cae drásticamente.</p>
        `
    },
    {
        slug: 'resiliencia-aprender-de-las-crisis',
        title: 'Más que sobrevivir: Resiliencia ante las crisis en Chile',
        excerpt: 'Desde desastres naturales hasta crisis sociales, los chilenos somos expertos en levantarnos. Pero ¿a qué costo emocional?',
        date: '2024-03-20',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>La resiliencia no es aguantar hasta romperse, es la capacidad de doblarse y volver a la forma original, con nuevos aprendizajes.</p>
        `
    },
    {
        slug: 'neurodivergencia-sistema-escolar-chileno',
        title: 'Encasillados: La neurodivergencia en el sistema escolar chileno',
        excerpt: 'Opinión sobre por qué nuestras escuelas necesitan urgentemente adaptarse a distintas formas de aprender.',
        date: '2024-03-15',
        author: 'Ps. Gustavo Caro',
        category: 'Neurodiversidad',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>El sistema escolar actual en Chile está diseñado para un "promedio" que no existe. Los niños con TDAH o TEA son a menudo catalogados como problemas cuando el problema es el molde.</p>
        `
    },
    {
        slug: 'como-elegir-psicologo-chile',
        title: 'No todos son para ti: Cómo elegir un buen psicólogo en Chile',
        excerpt: 'Guía práctica para encontrar un profesional que realmente se ajuste a tus necesidades y valores.',
        date: '2024-03-10',
        author: 'Ps. Gustavo Caro',
        category: 'Recursos',
        image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>La alianza terapéutica es el factor más importante para que una terapia funcione. No te quedes con alguien si no sientes esa conexión.</p>
        `
    },
    {
        slug: 'mitos-terapia-conductual-cognitiva',
        title: 'Mitos y realidades de la Terapia TCC',
        excerpt: '¿Es verdad que es solo para síntomas superficiales? Desmitificando el enfoque más respaldado por la ciencia.',
        date: '2024-03-05',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: 'https://images.unsplash.com/photo-1454165833968-4e76589653ef?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>La TCC no es solo cambiar pensamientos, es cambiar la forma en que nos relacionamos con nuestra propia experiencia.</p>
        `
    },
    {
        slug: 'ansiedad-redes-sociales-adolescentes',
        title: 'Generación Ansiedad: Redes sociales en los colegios de Santiago',
        excerpt: 'El impacto de la comparación constante y el cyberbullying en la salud mental de nuestros jóvenes.',
        date: '2024-03-01',
        author: 'Ps. Gustavo Caro',
        category: 'Salud Mental',
        image: 'https://images.unsplash.com/photo-1516726817505-f5ed17dc4803?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Las redes sociales son el nuevo patio de recreo, pero uno que nunca cierra y donde la opinión de miles puede pesarte.</p>
        `
    },
    {
        slug: 'sindrome-impostor-emprendedores',
        title: 'El impostor en la oficina: El síndrome del impostor en Chile',
        excerpt: 'Por qué a los profesionales chilenos les cuesta tanto creerse el cuento y cómo afecta su crecimiento.',
        date: '2024-02-25',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Sentir que vas a ser "descubierto" como un fraude es más común de lo que crees, especialmente en entornos competitivos.</p>
        `
    },
    {
        slug: 'autocuidado-psicologos-chilenos',
        title: '¿Quién cuida al que cuida? El autocuidado en psicología',
        excerpt: 'Reflexión personal sobre los desafíos de sostener el dolor ajeno día tras día.',
        date: '2024-02-20',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: 'https://images.unsplash.com/photo-1499209974431-9eaa37a11144?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Ser terapeuta en Chile implica navegar un sistema de salud precario y muchas veces desolador. El autocuidado no es opcional, es ético.</p>
        `
    },
    {
        slug: 'salud-mental-no-es-lujo',
        title: 'Por qué la salud mental no debería ser un lujo en Chile',
        excerpt: 'Opinión crítica sobre el acceso a psicoterapia y la necesidad de mejores políticas públicas.',
        date: '2024-02-15',
        author: 'Ps. Gustavo Caro',
        category: 'Opinión',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Pagar por salud mental no debería significar dejar de pagar el arriendo. El acceso Universal es una deuda histórica en nuestro país.</p>
        `
    },
    {
        slug: 'herramientas-tcc-manejo-panico',
        title: 'Kit de emergencia: Herramientas TCC para el manejo de pánico',
        excerpt: 'Recursos prácticos para usar durante un ataque de ansiedad o pánico.',
        date: '2024-02-10',
        author: 'Ps. Gustavo Caro',
        category: 'Recursos',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
        content: `
            <p>Los ataques de pánico son aterradores pero inofensivos. Aquí te explico cómo navegar la tormenta.</p>
        `,
        resources: [
            {
                title: 'Guía de Respiración Diafragmática',
                description: 'PDF paso a paso para regular tu sistema nervioso.',
                link: '#'
            }
        ]
    }
];
