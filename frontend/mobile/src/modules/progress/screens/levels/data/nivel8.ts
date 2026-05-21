import { LevelContent } from './types';

export const nivel8: LevelContent = {
  1: {
    steps: ['intro', 'mascot_open', 'phrase', 'mascot_open', 'phrase', 'mascot_choice', 'phrase'],
    intro: {
      title: 'Nivel 8',
      description: 'Aceptar que nuestras acciones han afectado a otros puede ser incómodo, incluso doloroso. Pero ignorarlo no lo desaparece. Este es el primer paso para mirar más allá de ti mismo/a.',
    },
    mascot_open: [
      { question: 'Escribe las personas o relaciones que sientes que han sido afectadas (pueden ser nombres o categorías: familia, pareja, amigos…).' },
      { question: '¿De qué forma crees que pudieron haber sido afectados?' },
    ],
    mascot_choice: [
      {
        question: '¿Cómo te hace sentir reconocer esto?',
        options: ['Culpa', 'Tristeza', 'Evitación', 'Confusión'],
      },
    ],
    phrase: [
      { text: 'Reconocer el impacto no es para castigarte, es para hacerte consciente.' },
      { text: 'Lo que haces no solo te afecta a ti, también deja huella en otros.' },
      { text: 'Mirar esto puede doler, pero también es lo que permite cambiar.' },
    ],
  },
  2: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 8',
      description: 'Es fácil justificar, minimizar o culpar a otros. Asumir responsabilidad es dejar esas defensas y reconocer lo que sí estuvo en tus manos.',
    },
    complete_sentence: [
      { prefix: 'En esta situación, mi responsabilidad fue…' },
    ],
    mascot_choice: [
      {
        question: 'Cuando piensas en lo ocurrido, tiendes a:',
        options: ['Justificarte', 'Culpar a otros', 'Minimizarlo', 'Aceptarlo'],
      },
    ],
    mascot_open: [
      { question: '¿Qué te cuesta aceptar de lo que pasó?' },
    ],
    phrase: [
      { text: 'Asumir responsabilidad no te define como persona, pero sí define tu crecimiento.' },
      { text: 'Aceptar tu parte no borra lo ocurrido, pero cambia lo que haces después.' },
      { text: 'Dejar de justificarte es empezar a transformarte.' },
    ],
  },
  3: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'mascot_choice', 'phrase'],
    intro: {
      title: 'Nivel 8',
      description: 'Reparar no siempre significa arreglar todo o recibir perdón. A veces empieza solo con la intención sincera de hacer las cosas de otra manera.',
    },
    complete_sentence: [
      { prefix: 'Me gustaría reparar esto haciendo…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué forma de reparación sientes más posible?',
        options: ['Pedir perdón', 'Cambiar mi comportamiento', 'Hablar honestamente', 'Respetar distancia'],
      },
      {
        question: '¿Estás dispuesto/a a intentarlo?',
        options: ['Sí', 'Tal vez más adelante', 'Aún no'],
      },
    ],
    mascot_open: [
      { question: '¿Qué te da miedo al intentar reparar?' },
    ],
    phrase: [
      { text: 'Reparar no garantiza una respuesta, pero sí cambia tu dirección.' },
      { text: 'No todo se puede arreglar, pero todo se puede afrontar de una forma distinta.' },
      { text: 'La intención sincera de reparar ya es un paso hacia el cambio.' },
    ],
  },
};