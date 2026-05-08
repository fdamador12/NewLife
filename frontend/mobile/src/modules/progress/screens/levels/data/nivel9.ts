import { LevelContent } from './types';

export const nivel9: LevelContent = {
  1: {
    steps: ['intro', 'mascot_choice', 'phrase', 'mascot_open', 'phrase', 'mascot_checklist', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 9, Módulo 1',
      description: 'Saber lo que tienes que hacer no siempre significa que sea fácil hacerlo. El miedo, la duda o la incomodidad pueden frenarte justo antes de avanzar.',
    },
    mascot_choice: [
      {
        question: '¿Qué sientes cuando piensas en actuar diferente?',
        options: ['Miedo', 'Inseguridad', 'Duda', 'Resistencia'],
      },
    ],
    mascot_checklist: [
      {
        question: 'Identifica lo que aparece antes de actuar:',
        options: ['¿Y si sale mal?', 'No estoy listo/a', 'Mejor después', 'No va a servir'],
      },
    ],
    mascot_open: [
      { question: '¿Qué es lo que más te detiene en este momento?' },
      { question: '¿Qué has evitado hacer hasta ahora?' },
    ],
    phrase: [
      { text: 'Saber no cambia nada si no actúas diferente.' },
      { text: 'El miedo no desaparece antes de actuar, se transforma después.' },
      { text: 'Postergar también es una decisión, aunque no lo parezca.' },
    ],
  },
  2: {
    steps: ['intro', 'mascot_choice', 'phrase', 'complete_sentence', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 9, Módulo 2',
      description: 'Actuar no significa hacer algo perfecto, significa hacer algo diferente a lo de siempre. Aquí empiezas a romper el patrón con acciones concretas.',
    },
    mascot_choice: [
      {
        question: '¿Qué tipo de acción estás dispuesto/a a tomar?',
        options: ['Hablar honestamente', 'Pedir perdón', 'Poner un límite', 'Cambiar un hábito'],
      },
    ],
    complete_sentence: [
      { prefix: 'Hoy puedo actuar diferente haciendo…' },
    ],
    mascot_open: [
      { question: '¿Qué acción pequeña puedes hacer hoy?' },
    ],
    phrase: [
      { text: 'No necesitas hacerlo perfecto, solo hacerlo distinto.' },
      { text: 'Cada acción nueva rompe un patrón antiguo.' },
      { text: 'Cambiar se ve en lo que haces, no en lo que piensas.' },
    ],
  },
  3: {
    steps: ['intro', 'mascot_open', 'phrase', 'mascot_choice', 'phrase', 'complete_sentence', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 9, Módulo 3',
      description: 'Actuar una vez es importante, pero sostenerlo es lo que realmente transforma. Este es el inicio de una nueva forma de responder.',
    },
    mascot_open: [
      { question: 'Escribe una acción concreta que vas a sostener.' },
      { question: '¿Cómo se siente haber actuado diferente?' },
    ],
    mascot_choice: [
      {
        question: '¿Qué podría hacerte volver a lo anterior?',
        options: ['Cansancio', 'Emociones intensas', 'Entorno', 'Costumbre'],
      },
    ],
    complete_sentence: [
      { prefix: 'Si siento que voy a recaer, voy a…' },
    ],
    phrase: [
      { text: 'El cambio no se demuestra una vez, se construye con repetición.' },
      { text: 'Volver atrás es parte del proceso, no el final.' },
      { text: 'Cada vez que eliges distinto, te conviertes en alguien nuevo.' },
    ],
  },
};