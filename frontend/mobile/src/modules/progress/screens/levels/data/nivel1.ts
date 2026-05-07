import { LevelContent } from './types';

export const nivel1: LevelContent = {
  1: {
    steps: ['intro', 'mascot_choice', 'phrase', 'mascot_checklist', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 1, Módulo 1',
      description: 'Es fácil convencerse de que todo está bajo control o que "no es tan grave". La negación no siempre es obvia; a veces se disfraza de excusas, comparaciones o silencios.',
    },
    mascot_choice: [
      {
        question: '¿Cómo has visto tu situación hasta ahora?',
        options: ['No es tan grave', 'Puedo controlarlo', 'Otros están peor', 'Prefiero no pensar en eso'],
      },
    ],
    mascot_checklist: [
      {
        question: 'Selecciona los pensamientos que has tenido:',
        options: ['Puedo dejarlo cuando quiera', 'Esto no me está afectando tanto', 'No es el momento de cambiar', 'No es para tanto'],
      },
    ],
    mascot_open: [
      { question: '¿En qué momentos has evitado aceptar lo que realmente pasa?' },
    ],
    phrase: [
      { text: 'La negación no elimina el problema, solo lo aplaza.' },
      { text: 'Minimizar te calma por un momento, pero te aleja de la realidad.' },
      { text: 'Ver lo que pasa puede doler, pero no verlo cuesta más con el tiempo.' },
    ],
  },
  2: {
    steps: ['intro', 'mascot_checklist', 'phrase', 'mascot_open', 'phrase', 'mascot_choice', 'phrase'],
    intro: {
      title: 'Paso 1, Módulo 2',
      description: 'Nada de esto ocurre sin impacto. Poco a poco, las decisiones y hábitos dejan huellas en distintas áreas de tu vida. Reconocerlas no es para culparte, es para entender el alcance real.',
    },
    mascot_checklist: [
      {
        question: '¿Dónde has notado consecuencias?',
        options: ['Personal (emociones, salud)', 'Relaciones', 'Estudios/trabajo', 'Rutina diaria'],
      },
    ],
    mascot_open: [
      { question: 'Describe una consecuencia que te haya marcado.' },
    ],
    mascot_choice: [
      {
        question: '¿Cómo sueles reaccionar ante estas consecuencias?',
        options: ['Las ignoro', 'Las justifico', 'Me siento culpable', 'Intento cambiarlas'],
      },
    ],
    phrase: [
      { text: 'Lo que haces tiene efectos, incluso cuando no quieres verlos.' },
      { text: 'Reconocer lo que perdiste es el inicio de tu recuperación.' },
      { text: 'Las consecuencias no son castigos, son señales.' },
    ],
  },
  3: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 1, Módulo 3',
      description: 'Hay un punto en el que dejar de resistirte se vuelve necesario. Rendirte no es perder, es aceptar que esto te supera tal como lo has estado manejando. Es el momento más honesto del proceso.',
    },
    complete_sentence: [
      { prefix: 'Hoy reconozco que…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué tan difícil es aceptar esto?',
        options: ['Muy difícil', 'Difícil', 'Neutral', 'Aliviador'],
      },
    ],
    mascot_open: [
      { question: '¿Qué cambia en ti al admitirlo?' },
      { question: '¿Qué significa para ti dar este primer paso?' },
    ],
    phrase: [
      { text: 'El primer paso no es vencer, es rendirse a la verdad.' },
      { text: 'Acepto la realidad.' },
      { text: 'Dejar de negarlo es empezar a avanzar.' },
    ],
  },
};