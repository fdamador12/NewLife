import { LevelContent } from './types';

export const nivel5: LevelContent = {
  1: {
    steps: ['intro', 'mascot_choice', 'phrase', 'mascot_open', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 5',
      description: 'Callar puede parecer más fácil, pero lo que no se expresa no desaparece. Se acumula, se transforma y muchas veces pesa más con el tiempo.',
    },
    mascot_choice: [
      {
        question: 'Cuando algo te afecta, normalmente:',
        options: ['Me lo guardo', 'Lo minimizo', 'Lo digo, pero no todo', 'Lo expreso completamente'],
      },
    ],
    mascot_open: [
      { question: '¿Qué cosas sueles callar?' },
      { question: '¿Desde cuándo llevas eso contigo?' },
    ],
    phrase: [
      { text: 'Lo que no dices no desaparece, solo cambia de forma dentro de ti.' },
      { text: 'Callar te protege del momento… pero te pesa con el tiempo.' },
      { text: 'A veces no hablas porque no sabes cómo, no porque no lo necesites.' },
    ],
  },
  2: {
    steps: ['intro', 'mascot_choice', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 5',
      description: 'Compartir no es exponerte completamente, es elegir empezar. No necesitas confianza total, solo un primer intento.',
    },
    mascot_choice: [
      {
        question: '¿Con quién podrías abrirte?',
        options: ['Una persona cercana', 'Un profesional', 'Alguien de confianza', 'Nadie aún'],
      },
      {
        question: '¿Qué te detiene más para hablar?',
        options: ['Miedo a ser juzgado/a', 'Vergüenza', 'No saber cómo explicarlo', 'Sentir que no importa'],
      },
    ],
    mascot_open: [
      { question: '¿Qué necesitarías para sentirte un poco más seguro/a al compartir?' },
    ],
    phrase: [
      { text: 'No necesitas decirlo perfecto, solo necesitas decirlo real.' },
      { text: 'Abrirte no es debilidad, es una forma de dejar de cargar solo/a.' },
      { text: 'Ser escuchado puede cambiar más de lo que imaginas.' },
    ],
  },
  3: {
    steps: ['intro', 'mascot_open', 'phrase', 'mascot_open', 'phrase', 'mascot_choice', 'phrase'],
    intro: {
      title: 'Nivel 5',
      description: 'Expresar lo que llevas dentro no soluciona todo, pero sí cambia algo: ya no lo estás cargando igual. Liberar es soltar un poco del peso.',
    },
    mascot_open: [
      { question: 'Escribe algo que nunca has dicho (puede ser largo o corto).' },
      { question: '¿Cómo se siente haberlo expresado?' },
    ],
    mascot_choice: [
      {
        question: '¿Te gustaría compartir esto con alguien en la vida real?',
        options: ['Sí', 'Tal vez después', 'No aún'],
      },
    ],
    phrase: [
      { text: 'Lo que se expresa, deja de pesar de la misma forma.' },
      { text: 'Quiero soltar esto.' },
      { text: 'A veces liberar no cambia el pasado, pero sí cambia cómo lo llevas.' },
    ],
  },
};