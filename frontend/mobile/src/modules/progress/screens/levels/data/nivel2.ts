import { LevelContent } from './types';

export const nivel2: LevelContent = {
  1: {
    steps: ['intro', 'mascot_choice', 'phrase', 'mascot_open', 'phrase', 'mascot_checklist', 'phrase'],
    intro: {
      title: 'Paso 2, Módulo 1',
      description: 'Durante mucho tiempo aprendiste a desconfiar: de los demás, de las soluciones, incluso de ti mismo. Esa desconfianza no apareció de la nada, se construyó con experiencias, caídas y promesas que no se cumplieron.',
    },
    mascot_choice: [
      {
        question: 'Cuando piensas en cambiar, ¿qué aparece primero?',
        options: ['No va a funcionar', 'Ya lo intenté antes', 'No es para mí', 'Tal vez… pero no lo sé'],
      },
    ],
    mascot_open: [
      { question: '¿En qué cosas sientes que ya no puedes confiar?' },
    ],
    mascot_checklist: [
      {
        question: 'Selecciona los pensamientos que has tenido:',
        options: ['Nada va a cambiar', 'Yo soy el problema', 'Es demasiado tarde', 'No vale la pena intentarlo'],
      },
    ],
    phrase: [
      { text: 'La desconfianza también es una forma de protegerte… pero puede terminar encerrándote.' },
      { text: 'No confiar te ha mantenido a salvo, pero también te ha mantenido estancado.' },
      { text: 'A veces no creemos porque antes dolió demasiado intentar.' },
    ],
  },
  2: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 2, Módulo 2',
      description: 'No se trata de creer completamente, sino de dejar una pequeña puerta abierta. El cambio empieza cuando dejas de decir "no" automáticamente a todo lo que podría ayudarte.',
    },
    complete_sentence: [
      { prefix: 'Tal vez podría cambiar si…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué necesitas para empezar a confiar un poco más?',
        options: ['Ver resultados', 'Sentirme acompañado/a', 'Entender mejor lo que me pasa', 'Solo intentarlo'],
      },
    ],
    mascot_open: [
      { question: '¿Qué es lo peor que podría pasar si intentas confiar?' },
    ],
    phrase: [
      { text: 'No necesitas certezas para empezar, solo un poco de apertura.' },
      { text: 'El cambio no comienza cuando crees completamente, sino cuando dejas de cerrarte.' },
      { text: 'Darte una oportunidad no garantiza el resultado, pero negártela sí garantiza quedarte igual.' },
    ],
  },
  3: {
    steps: ['intro', 'mascot_open', 'phrase', 'mascot_choice', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 2, Módulo 3',
      description: 'La confianza no es solo una idea, es una acción. Empieza con algo pequeño: un paso, una decisión, un intento.',
    },
    mascot_choice: [
      {
        question: '¿En qué podrías apoyarte ahora mismo?',
        options: ['Una persona', 'Un hábito', 'Una idea', 'Yo mismo/a'],
      },
      {
        question: 'Elige una acción para hoy:',
        options: ['Hablar con alguien', 'Escribir lo que siento', 'Detenerme antes de reaccionar', 'Intentar algo diferente'],
      },
    ],
    mascot_open: [
      { question: 'Escribe algo en lo que sí puedes confiar hoy (aunque sea mínimo).' },
      { question: '¿Cómo se siente dar este pequeño paso?' },
    ],
    phrase: [
      { text: 'Confiar no es eliminar la duda, es avanzar a pesar de ella.' },
      { text: 'Voy a intentarlo.' },
      { text: 'No necesitas saber que funcionará, solo necesitas decidir no rendirte hoy.' },
    ],
  },
};