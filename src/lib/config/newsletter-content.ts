type NewsletterTopic = {
    id: number;
    weekOf: string;
    subject: string;
    preheader: string;
    theme: string;
    reflection: string;
    exercise: string;
    reminder: string;
    cta: string;
};

const topics: NewsletterTopic[] = [
    {
        id: 1,
        weekOf: '2026-08-10',
        subject: 'No tienes que esperar a estar al límite para pedir una hora',
        preheader: 'Una pausa breve para revisar cómo llegaste a agosto.',
        theme: 'Un chequeo emocional también es cuidado',
        reflection: 'Agosto suele traer el regreso a un ritmo más intenso: trabajo, estudios, pendientes y la sensación de que hay que ponerse al día rápido. Si notas que estás más irritable, desconectado o con la mente acelerada, no hace falta esperar a una crisis para mirarlo.',
        exercise: 'Completa esta frase sin corregirte: “Si pudiera quitarme un peso de encima esta semana, sería…”. Luego elige una acción de menos de diez minutos que vaya en esa dirección.',
        reminder: 'Una sesión puede servir para ordenar, prevenir que el cansancio se acumule o retomar un proceso que quedó en pausa.',
        cta: 'Revisar horarios disponibles'
    },
    {
        id: 2,
        weekOf: '2026-08-03',
        subject: 'Cuando la actualidad te deja con la mente encendida',
        preheader: 'Una forma de informarte sin quedar atrapado en la alarma.',
        theme: 'Informarse no debería costarte todo tu descanso',
        reflection: 'Entre noticias locales, conflictos que se siguen desde lejos y un flujo constante de redes, es comprensible que el sistema nervioso se quede en alerta. Estar informado no exige exponerte de manera continua a contenido que te desregula.',
        exercise: 'Prueba definir una ventana concreta para informarte, idealmente fuera de la última hora del día. Al terminar, haz una transición breve: agua, una caminata, música o una conversación que te devuelva al presente.',
        reminder: 'Si la preocupación se está filtrando en tu sueño, trabajo o vínculos, podemos revisarla con herramientas más específicas.',
        cta: 'Agendar una sesión'
    },
    {
        id: 3,
        weekOf: '2026-08-10',
        subject: 'Estás cansado o estás sobrepasado?',
        preheader: 'No es lo mismo, y distinguirlo puede cambiar la respuesta.',
        theme: 'No todo cansancio se resuelve empujando más fuerte',
        reflection: 'El cansancio esperable mejora cuando recuperas energía. La sobrecarga, en cambio, suele seguir contigo incluso cuando paras: cuesta dormir, concentrarse, responder con calma o disfrutar algo simple. No es flojera; es información importante.',
        exercise: 'Haz dos listas cortas: “lo urgente hoy” y “lo que puede esperar”. Deja solo tres cosas en la primera. Reducir la lista no elimina tus responsabilidades, pero puede bajar la sensación de amenaza.',
        reminder: 'Si llevas semanas funcionando por inercia, una sesión puede ayudarte a recuperar prioridades y margen de acción.',
        cta: 'Conversarlo en sesión'
    },
    {
        id: 4,
        weekOf: '2026-08-17',
        subject: 'TDAH adulto: entender no es etiquetarse',
        preheader: 'Una duda diagnóstica merece una evaluación cuidadosa, no un video de 30 segundos.',
        theme: 'Menos culpa, más observación clínica',
        reflection: 'Olvidar cosas, postergar o sentir que todo exige demasiado esfuerzo puede tener distintas explicaciones. En algunos casos se relaciona con TDAH; en otros, con ansiedad, sueño, sobrecarga u otros factores. Mirar el patrón completo es lo que permite orientar bien.',
        exercise: 'Durante una semana anota una situación concreta en la que te costó iniciar, organizarte o sostener atención. Incluye contexto, sueño, exigencia y qué hiciste para resolverlo. Los ejemplos reales son más útiles que una etiqueta rápida.',
        reminder: 'Si esta duda te acompaña hace tiempo, puedes consultar por una entrevista inicial para definir el camino más adecuado.',
        cta: 'Consultar por evaluación'
    },
    {
        id: 5,
        weekOf: '2026-08-24',
        subject: 'Para dormir, tu mente necesita una salida del día',
        preheader: 'Una pauta sencilla cuando los pendientes se instalan en la almohada.',
        theme: 'La noche no tiene que ser la oficina de tus preocupaciones',
        reflection: 'Cuando por fin baja el ruido externo, muchas personas recién escuchan todo lo que quedaron sosteniendo. No se trata de obligarte a dejar de pensar; se trata de darle a esas preocupaciones un lugar antes de acostarte.',
        exercise: 'Escribe pendientes y preocupaciones en una hoja. Junto a cada una, anota “próximo paso” o “volver a mirar el día…”. Guarda la hoja fuera del dormitorio. La idea es que tu mente no tenga que actuar como agenda de respaldo.',
        reminder: 'Si el sueño sigue siendo difícil, hay intervenciones psicológicas específicas que vale la pena revisar.',
        cta: 'Pedir apoyo'
    },
    {
        id: 6,
        weekOf: '2026-08-31',
        subject: 'Un límite breve puede ser más claro que una explicación larga',
        preheader: 'No necesitas defender cada necesidad que tienes.',
        theme: 'Decir que no también puede cuidar un vínculo',
        reflection: 'Cuando tememos incomodar, solemos explicar de más o postergar una respuesta hasta que ya estamos agotados. Un límite respetuoso no garantiza que la otra persona esté de acuerdo, pero sí deja claro qué puedes sostener sin abandonarte.',
        exercise: 'Ensaya una frase corta: “Hoy no puedo”, “necesito pensarlo antes de responder” o “prefiero no hablar de eso ahora”. No agregues una justificación adicional durante el ensayo.',
        reminder: 'Si cada límite activa mucha culpa o miedo, ese patrón se puede trabajar con calma en terapia.',
        cta: 'Agendar una hora'
    },
    {
        id: 7,
        weekOf: '2026-09-07',
        subject: 'Septiembre emocional: celebraciones, familia y estres',
        preheader: 'Como cuidarte cuando las reuniones familiares remueven mas de lo esperado.',
        theme: 'No todas las celebraciones se viven igual',
        reflection: 'Para algunas personas, las fechas sociales traen alegria; para otras, tension, comparaciones, discusiones o sensacion de soledad. Ambas experiencias son validas.',
        exercise: 'Antes de una reunion, define dos limites: cuanto tiempo quieres quedarte y que tema prefieres no discutir.',
        reminder: 'Si estas fechas suelen remover ansiedad, tristeza o conflictos familiares, podemos preparar estrategias antes de que te sobrepasen.',
        cta: 'Preparar una sesion'
    },
    {
        id: 8,
        weekOf: '2026-09-14',
        subject: 'Cuando tu cuerpo dice basta antes que tu mente',
        preheader: 'Dolores, cansancio e irritabilidad tambien pueden ser senales emocionales.',
        theme: 'El cuerpo suele avisar primero',
        reflection: 'Tension mandibular, colon irritable, cansancio persistente o dolores musculares no siempre son solo fisicos. A veces son el idioma que encuentra el estres.',
        exercise: 'Haz un escaneo corporal de 2 minutos y ubica donde se concentra la tension. Luego preguntate: que situacion estoy sosteniendo ahi?',
        reminder: 'Si llevas tiempo funcionando en automatico, una pausa terapeutica puede ayudarte a entender que esta pasando.',
        cta: 'Tomar una hora'
    },
    {
        id: 9,
        weekOf: '2026-09-21',
        subject: 'Volver a la rutina sin castigarte',
        preheader: 'Una forma mas amable y efectiva de retomar habitos despues de una pausa.',
        theme: 'La consistencia no necesita dureza',
        reflection: 'Retomar despues de descansar, viajar o desconectarte puede activar culpa. Pero los habitos se reconstruyen mejor con pasos pequenos que con exigencias extremas.',
        exercise: 'Elige una sola rutina base para esta semana: horario de sueno, movimiento o alimentacion. Una cosa bien hecha vale mas que cinco promesas imposibles.',
        reminder: 'Si te cuesta volver a organizarte o sientes que todo se desordena rapido, trabajemos un plan realista.',
        cta: 'Agendar sesion'
    },
    {
        id: 10,
        weekOf: '2026-09-28',
        subject: 'Pensamientos intrusivos: no todo pensamiento merece obediencia',
        preheader: 'Una herramienta TCC para relacionarte distinto con lo que aparece en tu mente.',
        theme: 'Pensar algo no significa quererlo ni creerlo',
        reflection: 'La mente produce ideas, imagenes y escenarios. Algunos son utiles, otros son ruido. La terapia ayuda a distinguir pensamiento de accion, posibilidad de probabilidad.',
        exercise: 'Cuando aparezca un pensamiento intrusivo, prueba nombrarlo: estoy teniendo el pensamiento de que... Esa frase crea distancia.',
        reminder: 'Si los pensamientos intrusivos te asustan o condicionan tu vida, no tienes que lidiar con eso en silencio.',
        cta: 'Pedir apoyo'
    },
    {
        id: 11,
        weekOf: '2026-10-05',
        subject: '¿Te estas exigiendo como si fueras una maquina?',
        preheader: 'Una pausa para mirar autoexigencia, productividad y salud mental.',
        theme: 'La autoexigencia tambien se regula',
        reflection: 'Exigirte puede haberte ayudado a lograr cosas importantes, pero cuando se vuelve la unica forma de moverte, termina cobrando intereses emocionales.',
        exercise: 'Escribe una meta de la semana y reduce su version minima viable. Cumplir lo esencial tambien cuenta.',
        reminder: 'Si la autoexigencia te tiene cansado, irritable o desconectado, podemos trabajar una forma mas sostenible de avanzar.',
        cta: 'Ver disponibilidad'
    },
    {
        id: 12,
        weekOf: '2026-10-12',
        subject: 'Terapia no es solo hablar: es aprender herramientas',
        preheader: 'Como funciona un proceso TCC y por que puede ayudarte en lo cotidiano.',
        theme: 'La terapia tambien se practica entre sesiones',
        reflection: 'En TCC no solo conversamos sobre lo que duele: identificamos patrones, probamos estrategias, revisamos resultados y ajustamos el plan.',
        exercise: 'Piensa en una dificultad actual y completa: situacion, pensamiento, emocion, conducta. Ese mapa es el inicio del trabajo terapeutico.',
        reminder: 'Si quieres un proceso con objetivos claros y herramientas concretas, puede ser un buen momento para comenzar.',
        cta: 'Comenzar proceso'
    },
    {
        id: 13,
        weekOf: '2026-10-19',
        subject: 'Cuando la tristeza no se va con descansar',
        preheader: 'Una mirada cuidadosa sobre animo bajo, aislamiento y ayuda profesional.',
        theme: 'No tienes que justificar tu cansancio emocional',
        reflection: 'Hay tristezas que pasan con descanso y apoyo. Otras se instalan, apagan el interes y vuelven dificil lo cotidiano. Pedir ayuda ahi no es exagerar.',
        exercise: 'Durante esta semana registra tres datos: energia, sueno e interes. No para juzgarte, sino para observar con mas claridad.',
        reminder: 'Si llevas varias semanas sintiendote apagado, acompanarte puede hacer la diferencia.',
        cta: 'Agendar evaluacion inicial'
    },
    {
        id: 14,
        weekOf: '2026-10-26',
        subject: 'Relaciones sanas: conversar antes de explotar',
        preheader: 'Una pauta simple para hablar de lo dificil sin escalar el conflicto.',
        theme: 'La comunicacion tambien se entrena',
        reflection: 'Muchas discusiones no nacen del tema puntual, sino de anos de decir poco, acumular mucho y explotar tarde.',
        exercise: 'Prueba iniciar una conversacion dificil con esta estructura: cuando pasa X, yo siento Y, y necesito Z.',
        reminder: 'Si repites patrones de conflicto, evitacion o dependencia emocional, terapia puede ayudarte a entender tu parte sin cargar con todo.',
        cta: 'Conversarlo en sesion'
    },
    {
        id: 15,
        weekOf: '2026-11-02',
        subject: 'Evaluaciones psicologicas: claridad para tomar mejores decisiones',
        preheader: 'Cuando una evaluacion puede orientar el proceso terapeutico, escolar o laboral.',
        theme: 'Evaluar no es etiquetar: es comprender mejor',
        reflection: 'Una buena evaluacion puede ordenar dudas sobre TDAH, autismo, funcionamiento cognitivo o aspectos emocionales. El objetivo no es encasillar, sino orientar.',
        exercise: 'Si tienes una duda diagnostica, anota ejemplos concretos: desde cuando ocurre, en que contextos aparece y que impacto tiene.',
        reminder: 'Si estas pensando en una evaluacion, podemos partir con una entrevista inicial para definir si corresponde y que camino seguir.',
        cta: 'Consultar por evaluacion'
    },
    {
        id: 16,
        weekOf: '2026-11-09',
        subject: 'Antes de cerrar el año, revisa como llegaste hasta aqui',
        preheader: 'Noviembre es buen momento para mirar avances, pendientes y necesidades reales.',
        theme: 'Cerrar el ano tambien puede ser un proceso emocional',
        reflection: 'A esta altura muchas personas sienten cansancio acumulado. No siempre se trata de rendir mas; a veces se trata de entender que necesitas para llegar mejor.',
        exercise: 'Escribe tres columnas: lo que avance, lo que me costo y lo que necesito cuidar antes de diciembre.',
        reminder: 'Si quieres ordenar el cierre de ano con apoyo, aun hay tiempo para tomar sesiones utiles y concretas.',
        cta: 'Agendar antes de diciembre'
    },
    {
        id: 17,
        weekOf: '2026-11-16',
        subject: 'Cansancio de fin de año: no lo normalices demasiado',
        preheader: 'Distinguir cansancio esperable de agotamiento que necesita atencion.',
        theme: 'No todo cansancio se soluciona empujando mas fuerte',
        reflection: 'El fin de ano suele traer pendientes, presion economica, balances personales y poco descanso. Si tu cuerpo esta pidiendo pausa, conviene escucharlo.',
        exercise: 'Haz una lista de pendientes y marca cuales son urgentes de verdad. Luego elige que puedes postergar sin culpa.',
        reminder: 'Si estas llegando al limite, una sesion puede ayudarte a ordenar carga, prioridades y limites.',
        cta: 'Tomar una hora'
    },
    {
        id: 18,
        weekOf: '2026-11-23',
        subject: 'Ansiedad anticipatoria: sufrir antes de tiempo',
        preheader: 'Como volver al presente cuando la mente se adelanta demasiado.',
        theme: 'Prepararte no es lo mismo que angustiarte por adelantado',
        reflection: 'La ansiedad anticipatoria intenta darte control, pero muchas veces te hace vivir varias veces un problema que aun no ocurre.',
        exercise: 'Pregunta TCC de la semana: que puedo hacer hoy que sea util, concreto y proporcional al problema?',
        reminder: 'Si tu mente se adelanta todo el tiempo y te cuesta descansar, podemos trabajar estrategias especificas.',
        cta: 'Agendar apoyo'
    },
    {
        id: 19,
        weekOf: '2026-11-30',
        subject: 'Diciembre no tiene que ser perfecto',
        preheader: 'Una invitacion a bajar exigencias y cuidar tu salud mental en fiestas.',
        theme: 'Las fiestas tambien pueden remover emociones complejas',
        reflection: 'Diciembre suele mezclar celebraciones, duelos, comparaciones y cansancio. No tienes que vivirlo como la publicidad dice que deberias.',
        exercise: 'Define una expectativa realista para este mes y una cosa que prefieres no forzarte a hacer.',
        reminder: 'Si diciembre suele ser dificil para ti, podemos preparar un plan de cuidado emocional antes de que avance.',
        cta: 'Preparar diciembre'
    },
    {
        id: 20,
        weekOf: '2026-12-07',
        subject: 'Cuidar tus vinculos en reuniones familiares',
        preheader: 'Limites, conversaciones dificiles y autocuidado para encuentros de fin de ano.',
        theme: 'Puedes estar presente sin exponerte de mas',
        reflection: 'No todas las familias son espacios faciles. A veces el cuidado no es evitar todo, sino decidir con claridad cuanto y como participar.',
        exercise: 'Prepara una frase de salida: prefiero no hablar de eso ahora, cambiemos de tema. Tenerla lista reduce la improvisacion ansiosa.',
        reminder: 'Si estas anticipando conflictos familiares, una sesion puede ayudarte a llegar con mas recursos.',
        cta: 'Agendar sesion'
    },
    {
        id: 21,
        weekOf: '2026-12-14',
        subject: 'Antes de terminar el año: reconoce lo que si sostuviste',
        preheader: 'Un recordatorio para mirar avances sin borrarlos por lo pendiente.',
        theme: 'Tu avance no desaparece porque aun queden cosas por trabajar',
        reflection: 'La mente ansiosa suele enfocarse en lo incompleto. Pero tambien importa reconocer lo que enfrentaste, aprendiste o dejaste de repetir.',
        exercise: 'Escribe cinco cosas que este ano te costaron y aun asi sostuviste. No tienen que ser enormes para contar.',
        reminder: 'Si quieres cerrar el ano con una revision terapeutica, este es un buen momento para hacerlo.',
        cta: 'Reservar cierre de ano'
    },
    {
        id: 22,
        weekOf: '2026-12-21',
        subject: 'Navidad, duelo y salud mental',
        preheader: 'Un mensaje cuidadoso para quienes no viven estas fechas con pura alegria.',
        theme: 'Tambien se puede cuidar el dolor en fechas sensibles',
        reflection: 'Si estas viviendo una perdida, una separacion, distancia familiar o cansancio profundo, no tienes que fingir entusiasmo todo el tiempo.',
        exercise: 'Elige un gesto pequeno de cuidado para ti durante la semana: salir a caminar, escribir, llamar a alguien seguro o descansar sin justificarte.',
        reminder: 'Si estas fechas te remueven mas de lo esperado, pedir apoyo es una forma valida de acompanarte.',
        cta: 'Pedir una hora'
    },
    {
        id: 23,
        weekOf: '2026-12-28',
        subject: 'Empezar el año con un plan emocional mas claro',
        preheader: 'Una invitacion a cerrar el ciclo y proyectar el proximo ano con mas cuidado.',
        theme: 'No necesitas una vida nueva, necesitas un plan posible',
        reflection: 'Los propositos fallan cuando nacen desde la culpa. Los cambios sostenibles suelen partir desde una pregunta mas honesta: que necesito cuidar mejor este ano?',
        exercise: 'Escribe una meta emocional para enero en formato concreto: quiero practicar X, durante Y dias, de una forma realista.',
        reminder: 'Si quieres iniciar el ano con apoyo profesional, podemos construir un plan terapeutico claro desde la primera sesion.',
        cta: 'Agendar para enero'
    }
];

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://psgustavocaro.cl';

function renderNewsletter(topic: NewsletterTopic, name: string) {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.65; color: #263238; max-width: 640px; margin: 0 auto;">
            <p style="display:none; max-height:0; overflow:hidden; opacity:0;">${topic.preheader}</p>
            <p style="font-size: 15px;">Hola ${name},</p>
            <h2 style="color: #0891b2; font-size: 26px; line-height: 1.2; margin: 8px 0 16px;">${topic.theme}</h2>
            <p>${topic.reflection}</p>
            <div style="background: #f0fdfa; border-left: 4px solid #0891b2; padding: 16px 18px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0;"><strong>Ejercicio breve de la semana:</strong><br/>${topic.exercise}</p>
            </div>
            <p>${topic.reminder}</p>
            <div style="margin: 30px 0; text-align: center;">
                <a href="${siteUrl}/agendar" style="background: #0891b2; color: #ffffff; padding: 13px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${topic.cta}</a>
            </div>
            <p style="text-align:center; margin:-10px 0 26px;"><a href="${siteUrl}/recursos" style="color:#0e7490; font-weight:bold; text-decoration:underline;">Ver recursos gratuitos de apoyo</a></p>
            <p style="font-size: 14px; color: #52616b;">Si este correo te llega en un momento sensible, leelo a tu ritmo. La idea no es presionarte, sino recordarte que puedes volver a pedir apoyo cuando lo necesites.</p>
            <p>Un abrazo,<br/><strong>Ps. Gustavo Caro</strong></p>
        </div>
    `;
}

export const newsletterSequence = topics.map((topic) => ({
    id: topic.id,
    weekOf: topic.weekOf,
    subject: topic.subject,
    preheader: topic.preheader,
    content: (name: string) => renderNewsletter(topic, name),
}));
