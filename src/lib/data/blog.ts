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
        slug: 'ansiedad-y-tcc-herramientas-practicas',
        title: 'Entendiendo la Ansiedad: Herramientas desde la TCC',
        excerpt: 'La ansiedad no es tu enemiga, es una señal. Descubre cómo la Terapia Cognitivo Conductual puede ayudarte a gestionarla de forma efectiva.',
        content: `
            <h2>¿Qué es realmente la ansiedad?</h2>
            <p>La ansiedad es una respuesta natural de nuestro cuerpo ante situaciones que percibimos como amenazantes. Sin embargo, cuando esta respuesta se vuelve constante e interfiere en nuestra vida diaria, es momento de actuar.</p>
            
            <h3>El enfoque de la Terapia Cognitivo Conductual (TCC)</h3>
            <p>La TCC se basa en la idea de que nuestros pensamientos, emociones y comportamientos están interconectados. Al identificar y desafiar los patrones de pensamiento negativos o irracionales, podemos cambiar la forma en que nos sentimos y actuamos.</p>
            
            <blockquote>"No son las cosas las que nos perturban, sino la visión que tenemos de ellas." - Epicteto</blockquote>
            
            <h3>Herramientas prácticas para hoy</h3>
            <ul>
                <li><strong>Reestructuración Cognitiva:</strong> Identifica ese pensamiento que te genera angustia y pregúntate: "¿Qué evidencia real tengo para creer esto?".</li>
                <li><strong>Exposición Gradual:</strong> Enfrenta aquello que temes de forma pausada y controlada.</li>
                <li><strong>Técnicas de Respiración:</strong> La respiración diafragmática ayuda a calmar tu sistema nervioso en minutos.</li>
            </ul>
            
            <p>Recuerda que cada proceso es único. Si sientes que la ansiedad te sobrepasa, buscar ayuda profesional es el primer paso hacia la libertad emocional.</p>
        `,
        date: '2026-01-20',
        category: 'Salud Mental',
        image: '/blog/anxiety-tcc.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'relaciones-saludables-vincularse-desde-el-respeto',
        title: 'Relaciones Saludables: Cómo vincularse desde el respeto',
        excerpt: 'Los vínculos sanos no ocurren por accidente, se construyen. Aprende las claves para mejorar la comunicación y establecer límites.',
        content: `
            <h2>La base de un vínculo sano</h2>
            <p>Construir relaciones saludables es uno de los mayores desafíos del ser humano. No se trata de encontrar a la persona "perfecta", sino de desarrollar las habilidades necesarias para cultivar el amor y el respeto mutuo.</p>
            
            <h3>Claves para una mejor relación</h3>
            <p>La comunicación asertiva es fundamental. Expresar nuestras necesidades sin atacar al otro permite que el vínculo crezca de forma equilibrada.</p>
            
            <h3>La importancia de los límites</h3>
            <p>Poner límites no es alejar a las personas, es decirles cómo pueden amarnos sin dañarnos. Un límite claro es un acto de amor propio y de respeto hacia la relación.</p>
            
            <ul>
                <li>Escucha activa y empática.</li>
                <li>Resolución de conflictos sin violencia.</li>
                <li>Mantenimiento de la individualidad dentro de la pareja.</li>
            </ul>
        `,
        date: '2026-01-15',
        category: 'Vínculos',
        image: '/blog/healthy-relationships.png',
        author: 'Ps. Gustavo Caro'
    },
    {
        slug: 'mindfulness-viviendo-el-presente',
        title: 'Mindfulness: El arte de vivir en el aquí y el ahora',
        excerpt: 'Vivimos en un mundo de distracciones constantes. El mindfulness nos devuelve la paz mental a través de la atención plena.',
        content: `
            <h2>¿Por qué mindfulness?</h2>
            <p>Nuestra mente suele viajar constantemente entre el pasado (remordimiento) y el futuro (ansiedad). El mindfulness es el entrenamiento mental para volver al presente.</p>
            
            <h3>Pequeños momentos de atención</h3>
            <p>No necesitas meditar horas para practicar atención plena. Puedes empezar saboreando realmente tu café matutino o sintiendo el aire al caminar.</p>
            
            <h3>Beneficios científicamente probados</h3>
            <p>La práctica regular reduce el cortisol (la hormona del estrés), mejora la concentración y aumenta la resiliencia ante las dificultades.</p>
        `,
        date: '2026-01-10',
        category: 'Bienestar',
        image: '/blog/mindfulness.png',
        author: 'Ps. Gustavo Caro'
    }
];
