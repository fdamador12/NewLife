import { LevelContent } from './types';

export const nivel6: LevelContent = {
  1: {
    steps: ['intro', 'mascot_checklist', 'phrase', 'mascot_open', 'phrase', 'mascot_choice', 'phrase'],
    intro: {
      title: 'Paso 6, Módulo 1',
      description: 'No todo lo que te hace daño es fácil de dejar. Algunas cosas se quedan porque son conocidas, porque te dan algo, o porque no sabes quién serías sin ellas.',
    },
    mascot_checklist: [
      {
        question: '¿Qué sientes que te cuesta soltar?',
        options: ['Un hábito', 'Una forma de pensar', 'Una relación', 'Una versión de mí'],
      },
    ],
    mascot_choice: [
      {
        question: '¿Qué te mantiene ahí?',
        options: ['Comodidad', 'Miedo', 'Costumbre', 'Dependencia'],
      },
    ],
    mascot_open: [
      { question: '¿Qué te da eso que no quieres perder?' },
    ],
    phrase: [
      { text: 'No todo lo que te hace daño se siente malo todo el tiempo.' },
      { text: 'A veces no sueltas porque aún obtienes algo, aunque te cueste.' },
      { text: 'Reconocer la resistencia es parte del cambio, no un obstáculo.' },
    ],
  },
  2: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 6, Módulo 2',
      description: 'Decir "quiero cambiar" no siempre significa lo mismo. A veces lo dices por presión, por culpa o por cansancio. Este momento es para preguntarte si realmente quieres hacerlo por ti.',
    },
    complete_sentence: [
      { prefix: 'Quiero cambiar porque…' },
    ],
    mascot_choice: [
      {
        question: '¿De dónde viene tu deseo de cambiar?',
        options: ['De mí', 'De lo que otros esperan', 'De una situación límite', 'No estoy seguro/a'],
      },
    ],
    mascot_open: [
      { question: '¿Qué cambiaría en tu vida si realmente hicieras ese cambio?' },
    ],
    phrase: [
      { text: 'El cambio que nace desde afuera dura poco, el que nace desde adentro transforma.' },
      { text: 'No tienes que estar completamente listo/a, pero sí tienes que ser honesto/a.' },
      { text: 'Querer cambiar es distinto a estar dispuesto a hacerlo.' },
    ],
  },
  3: {
    steps: ['intro', 'mascot_choice', 'phrase', 'complete_sentence', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 6, Módulo 3',
      description: 'No se trata de no tener miedo, sino de avanzar con él. Estar listo/a no es sentir seguridad, es decidir que vas a intentarlo aunque no lo tengas todo claro.',
    },
    mascot_choice: [
      {
        question: '¿Qué estás dispuesto/a a hacer?',
        options: ['Pedir ayuda', 'Intentar algo diferente', 'Salir de mi zona cómoda', 'Ser honesto/a conmigo'],
      },
    ],
    complete_sentence: [
      { prefix: 'Estoy dispuesto/a a…' },
    ],
    mascot_open: [
      { question: '¿Qué significa para ti dar este paso?' },
    ],
    phrase: [
      { text: 'La disposición no elimina el miedo, pero sí cambia tu dirección.' },
      { text: 'Estoy listo/a para intentar.' },
      { text: 'Estar listo/a no es sentirte seguro/a, es dejar de posponer.' },
    ],
  },
};