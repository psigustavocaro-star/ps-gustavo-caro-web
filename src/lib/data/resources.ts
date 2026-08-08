export interface ClinicalResource {
    id: string;
    title: string;
    description: string;
    content: string;
    relatedPost?: string;
}

export const clinicalResources: ClinicalResource[] = [
    {
        id: 'registro-ansiedad',
        title: 'Registro breve de ansiedad',
        description: 'Una hoja de trabajo para identificar situaciones, pensamientos, intensidad emocional y respuestas posibles.',
        relatedPost: 'ansiedad-domingo-en-la-noche',
        content: `Registro breve de ansiedad\n\n1. Situacion: Que ocurrio? Describe solo los hechos observables.\n\n2. Pensamiento automatico: Que paso por tu mente en ese momento?\n\n3. Emocion e intensidad: Nombra la emocion y puntuala de 0 a 100.\n\n4. Respuesta corporal: Que notaste en tu cuerpo?\n\n5. Conducta: Que hiciste o dejaste de hacer?\n\n6. Mirada alternativa: Que evidencia apoya mi preocupacion? Que evidencia la matiza? Que accion pequena y util puedo hacer ahora?\n\nEste registro no busca obligarte a pensar positivo. Busca ayudarte a observar el ciclo con mayor distancia y elegir una respuesta mas util.`
    },
    {
        id: 'plan-de-pausa',
        title: 'Plan de pausa cuando todo se acumula',
        description: 'Una pauta de cinco minutos para ordenar prioridades cuando aparece sobrecarga, irritabilidad o bloqueo.',
        relatedPost: 'burnout-en-chile-senales-tempranas',
        content: `Plan de pausa de cinco minutos\n\n1. Detente: Pon ambos pies en el suelo y exhala un poco mas lento de lo habitual durante un minuto.\n\n2. Nombra: Que esta pasando ahora? Usa una frase simple: estoy sobrecargado, ansioso, frustrado o cansado.\n\n3. Reduce: Que es lo verdaderamente urgente hoy? Elige una sola tarea posible.\n\n4. Pide margen: Que puedes postergar, delegar o responder mas tarde?\n\n5. Vuelve: Define el siguiente paso de menos de diez minutos.\n\nUna pausa no resuelve todo el contexto. Si evita que respondas desde el agotamiento, ya esta cumpliendo una funcion importante.`
    },
    {
        id: 'preparar-primera-sesion',
        title: 'Guia para preparar tu primera sesion',
        description: 'Preguntas simples para llegar a consulta con una idea clara de lo que te gustaria trabajar.',
        relatedPost: 'como-preparar-primera-sesion-psicologica',
        content: `Antes de tu primera sesion\n\nNo necesitas llegar con todo ordenado. Si te ayuda, anota algunas ideas:\n\n- Que situacion te hizo pensar en consultar ahora?\n- Desde cuando la notas y como afecta tu descanso, trabajo, estudios o relaciones?\n- Que has intentado hasta ahora? Que te ayudo aunque fuera un poco?\n- Que te gustaria que fuera diferente en las proximas semanas o meses?\n- Hay algo importante de tu historia que quisieras que el profesional conozca?\n\nLa primera sesion es un espacio para comprender el motivo de consulta y decidir juntos una forma de trabajo. No es una prueba y no tienes que hacerlo perfecto.`
    },
    {
        id: 'organizacion-tdah',
        title: 'Inicio de tarea para dias de bloqueo',
        description: 'Una pauta práctica para reducir fricción al comenzar tareas cuando cuesta organizarse o sostener la atención.',
        relatedPost: 'tdah-adulto-senales-en-la-vida-diaria',
        content: `Inicio de tarea para dias de bloqueo\n\n1. Define una tarea visible: no “ordenar todo”, sino “abrir el documento y escribir el titulo”.\n\n2. Reduce distractores por 20 minutos: deja el telefono fuera de alcance y cierra pestañas que no necesitas.\n\n3. Usa un temporizador: el objetivo es empezar, no terminar el proyecto completo.\n\n4. Deja una señal de continuidad: al terminar, escribe cual es el siguiente paso para no tener que decidir desde cero despues.\n\n5. Revisa sin insultarte: si no resulto, ajusta el entorno o el tamano de la tarea. La dificultad para iniciar no se resuelve con mas culpa.`
    },
];
