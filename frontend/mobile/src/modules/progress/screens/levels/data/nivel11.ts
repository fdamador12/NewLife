import { LevelContent } from './types';

export const nivel11: LevelContent = {
  1: {
    steps: ['intro', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 11, Módulo 1',
      description: 'No siempre estás acostumbrado/a a detenerte. Muchas veces sigues en automático o llenas el silencio para no sentir. Este módulo es simplemente eso: una pausa real.',
    },
    mascot_choice: [
      {
        question: '¿Cómo te sientes al detenerte?',
        options: ['Incómodo/a', 'Tranquilo/a', 'Ansioso/a', 'Desconectado/a'],
      },
    ],
    mascot_open: [
      { question: '¿Qué aparece cuando te quedas en silencio?' },
    ],
    phrase: [
      { text: 'Respira. Este es tu momento de pausa.' },
      { text: 'En el silencio aparecen cosas que el ruido tapa.' },
      { text: 'Detenerte no es perder el tiempo, es encontrarte.' },
    ],
  },
  2: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_checklist', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 11, Módulo 2',
      description: 'Conectar no es solo pausar, es empezar a escucharte de verdad. No desde la crítica, sino desde la curiosidad.',
    },
    complete_sentence: [
      { prefix: 'Hoy necesito…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué sientes que necesitas más en este momento?',
        options: ['Descanso', 'Claridad', 'Apoyo', 'Espacio'],
      },
    ],
    mascot_checklist: [
      {
        question: '¿Qué áreas has descuidado últimamente?',
        options: ['Emocional', 'Física', 'Mental', 'Relaciones'],
      },
    ],
    mascot_open: [
      { question: '¿Qué has estado ignorando de ti?' },
    ],
    phrase: [
      { text: 'Escucharte es una forma de cuidarte.' },
      { text: 'Lo que necesitas no siempre es lo que sueles darte.' },
      { text: 'Ignorar lo que sientes no lo hace desaparecer.' },
    ],
  },
  3: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_open', 'phrase', 'mascot_choice', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 11, Módulo 3',
      description: 'Después de todo lo vivido, empieza a aparecer una pregunta más profunda: ¿para qué? Conectar también es empezar a construir un sentido propio.',
    },
    complete_sentence: [
      { prefix: 'Quiero seguir cambiando porque…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué te motiva a seguir?',
        options: ['Mi bienestar', 'Mis relaciones', 'Mi crecimiento', 'Mi futuro'],
      },
    ],
    mascot_open: [
      { question: '¿Qué le está dando sentido a este proceso para ti?' },
      { question: '¿Quién estás empezando a ser?' },
    ],
    phrase: [
      { text: 'El cambio se sostiene mejor cuando tiene sentido para ti.' },
      { text: 'No se trata solo de dejar atrás lo que eras, sino de construir lo que quieres ser.' },
      { text: 'Conectar contigo le da dirección a todo lo demás.' },
    ],
  },
};