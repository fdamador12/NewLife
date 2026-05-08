import { LevelContent } from './types';

export const nivel7: LevelContent = {
  1: {
    steps: ['intro', 'mascot_choice', 'phrase', 'mascot_open', 'phrase', 'mascot_checklist', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 7, Módulo 1',
      description: 'Pedir ayuda no siempre es natural. Puede sentirse incómodo, innecesario o incluso vergonzoso. Muchas veces aprendiste que tenías que resolver todo por tu cuenta.',
    },
    mascot_choice: [
      {
        question: '¿Cómo te sientes al pensar en pedir ayuda?',
        options: ['Incómodo/a', 'Débil', 'Indiferente', 'Aliviado/a'],
      },
    ],
    mascot_checklist: [
      {
        question: '¿Qué pensamientos aparecen cuando piensas en pedir ayuda?',
        options: ['Debería poder solo/a', 'No quiero molestar', 'No me van a entender', 'No lo necesito'],
      },
    ],
    mascot_open: [
      { question: '¿Qué te cuesta más de pedir ayuda?' },
      { question: '¿De dónde crees que viene esa forma de pensar?' },
    ],
    phrase: [
      { text: 'Aprender a pedir ayuda también es aprender a confiar.' },
      { text: 'No todo lo que haces solo/a es fortaleza… a veces es aislamiento.' },
      { text: 'Pedir ayuda no te hace menos capaz, te hace más consciente.' },
    ],
  },
  2: {
    steps: ['intro', 'complete_sentence', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 7, Módulo 2',
      description: 'No solo se trata de pedir, sino de permitirte recibir. A veces incluso cuando la ayuda está disponible, cuesta aceptarla.',
    },
    complete_sentence: [
      { prefix: 'Me cuesta recibir ayuda porque…' },
    ],
    mascot_choice: [
      {
        question: 'Cuando alguien intenta ayudarte, tú:',
        options: ['Lo rechazas', 'Lo dudas', 'Lo aceptas con incomodidad', 'Lo aceptas con tranquilidad'],
      },
    ],
    mascot_open: [
      { question: '¿Qué cambiaría si te permitieras recibir apoyo?' },
    ],
    phrase: [
      { text: 'Aceptar ayuda también es un acto de cambio.' },
      { text: 'No todo lo tienes que resolver tú para que sea válido.' },
      { text: 'Recibir no te hace dependiente, te hace humano.' },
    ],
  },
  3: {
    steps: ['intro', 'mascot_open', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Paso 7, Módulo 3',
      description: 'Este es un momento interno. No importa a quién o cómo lo hagas: pedir cambio es reconocer que necesitas algo distinto y estar dispuesto/a a aceptarlo.',
    },
    mascot_choice: [
      {
        question: '¿Qué estás pidiendo realmente?',
        options: ['Fuerza', 'Claridad', 'Apoyo', 'Cambio'],
      },
    ],
    mascot_open: [
      { question: 'Escribe una petición personal: puede ser a alguien, a la vida, o a ti mismo/a.' },
      { question: '¿Cómo se siente pedir esto?' },
    ],
    phrase: [
      { text: 'Pedir cambio es reconocer que ya no quieres seguir igual.' },
      { text: 'Pido cambio.' },
      { text: 'A veces el cambio empieza cuando dejas de resistirte a recibirlo.' },
    ],
  },
};