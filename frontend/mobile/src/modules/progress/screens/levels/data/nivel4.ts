import { LevelContent } from './types';

export const nivel4: LevelContent = {
  1: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_checklist', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 4',
      description: 'No siempre es fácil quedarse con uno mismo. Muchas veces evitamos mirar lo que sentimos porque no sabemos qué hacer con eso. Este es el primer intento de observarte sin huir.',
    },
    complete_sentence: [
      { prefix: 'Cuando estoy solo/a conmigo, lo que más aparece es…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué sueles hacer cuando algo te incomoda emocionalmente?',
        options: ['Distraerme', 'Ignorarlo', 'Reaccionar impulsivamente', 'Pensarlo demasiado'],
      },
    ],
    mascot_checklist: [
      {
        question: '¿Cuáles de estas emociones has sentido más últimamente?',
        options: ['Miedo', 'Tristeza', 'Rabia', 'Culpa', 'Vergüenza', 'Soledad'],
      },
    ],
    mascot_open: [
      { question: '¿Qué emoción sientes que has estado evitando?' },
    ],
    phrase: [
      { text: 'Lo que evitas sentir, suele quedarse más tiempo.' },
      { text: 'Mirarte no te hace débil, te hace consciente.' },
      { text: 'No necesitas resolver todo ahora, solo empezar a observar.' },
    ],
  },
  2: {
    steps: ['intro', 'mascot_choice', 'phrase', 'complete_sentence', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 4',
      description: 'Muchas de tus decisiones no son nuevas, solo son repeticiones. Entender tus patrones es empezar a romperlos.',
    },
    mascot_choice: [
      {
        question: '¿Cuál de estos patrones reconoces en ti?',
        options: ['Evito los problemas', 'Reacciono con enojo', 'Me saboteo', 'Me cierro emocionalmente'],
      },
    ],
    complete_sentence: [
      { prefix: 'Me doy cuenta de que siempre…' },
    ],
    mascot_open: [
      { question: '¿Qué crees que estás intentando evitar o proteger con ese patrón?' },
    ],
    phrase: [
      { text: 'Repetir no significa fallar, significa que aún no has entendido algo.' },
      { text: 'Tus patrones no aparecieron por casualidad, tienen una historia.' },
      { text: 'Lo que hoy te afecta, alguna vez te protegió.' },
    ],
  },
  3: {
    steps: ['intro', 'mascot_open', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 4',
      description: 'Verte con claridad puede doler. Pero el cambio no empieza con culpa, empieza con aceptación. No eres solo tus errores, pero tampoco puedes ignorarlos.',
    },
    mascot_open: [
      { question: 'Escribe algo de ti que te cuesta aceptar.' },
      { question: '¿Cómo sería tratarte con más comprensión?' },
    ],
    mascot_choice: [
      {
        question: '¿Cómo te hablas cuando cometes errores?',
        options: ['Muy duro', 'Indiferente', 'Comprensivo', 'Cambiante'],
      },
    ],
    phrase: [
      { text: 'No puedes cambiar lo que te niegas a aceptar.' },
      { text: 'Aceptarte no es justificarte, es dejar de atacarte.' },
      { text: 'El cambio real empieza cuando dejas de verte como enemigo.' },
    ],
  },
};