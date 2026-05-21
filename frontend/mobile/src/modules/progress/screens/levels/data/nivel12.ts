import { LevelContent } from './types';

export const nivel12: LevelContent = {
  1: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 12',
      description: 'Después de todo este proceso, algo en ti cambió. Tal vez no todo, pero sí lo suficiente para que ahora tengas algo distinto que ofrecer.',
    },
    complete_sentence: [
      { prefix: 'Hoy puedo dar…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué sientes que puedes aportar ahora?',
        options: ['Escucha', 'Comprensión', 'Apoyo', 'Ejemplo'],
      },
    ],
    mascot_open: [
      { question: '¿Qué aprendiste que podría ayudar a alguien más?' },
    ],
    phrase: [
      { text: 'No tienes que estar completamente bien para poder aportar algo bueno.' },
      { text: 'Lo que viviste puede convertirse en algo útil para otros.' },
      { text: 'Tu proceso también puede ser un puente para alguien más.' },
    ],
  },
  2: {
    steps: ['intro', 'mascot_open', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 12',
      description: 'Compartir no es dar consejos desde arriba, es hablar desde lo vivido. Es conectar con otros desde la autenticidad, no desde la perfección.',
    },
    mascot_choice: [
      {
        question: '¿Cómo te gustaría compartir lo que aprendiste?',
        options: ['Hablando con alguien', 'Acompañando', 'Dando ejemplo', 'Aún no lo sé'],
      },
    ],
    mascot_open: [
      { question: 'Escribe un mensaje que te habría ayudado cuando más lo necesitabas.' },
      { question: '¿Qué te detiene de compartir tu proceso?' },
    ],
    phrase: [
      { text: 'No necesitas tener todas las respuestas para poder acompañar.' },
      { text: 'Compartir desde lo real conecta más que intentar ser perfecto/a.' },
      { text: 'Tu historia puede ser más valiosa de lo que crees.' },
    ],
  },
  3: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_open', 'phrase', 'mascot_choice', 'phrase'],
    intro: {
      title: 'Nivel 12',
      description: 'Este no es un final, es una forma nueva de vivir. Integrar es llevar todo lo aprendido contigo, no como algo externo, sino como parte de quién eres ahora.',
    },
    complete_sentence: [
      { prefix: 'Hoy soy alguien que…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué quieres seguir construyendo?',
        options: ['Bienestar', 'Relaciones sanas', 'Constancia', 'Propósito'],
      },
    ],
    mascot_open: [
      { question: '¿Qué cambió en ti desde el inicio hasta ahora?' },
    ],
    phrase: [
      { text: 'No eres la misma persona que empezó este proceso.' },
      { text: 'Continúo mi proceso.' },
      { text: 'El cambio no termina aquí, se convierte en parte de tu vida.' },
    ],
  },
};