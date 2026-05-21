import { LevelContent } from './types';

export const nivel10: LevelContent = {
  1: {
    steps: ['intro', 'mascot_choice', 'phrase', 'mascot_open', 'phrase', 'mascot_checklist', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 10',
      description: 'En medio del día a día es fácil actuar sin pensar. Este módulo es una pausa: un espacio para revisar cómo estás, qué estás sintiendo y cómo estás actuando.',
    },
    mascot_choice: [
      {
        question: '¿Cómo te sientes hoy?',
        options: ['Tranquilo/a', 'Ansioso/a', 'Cansado/a', 'Confundido/a'],
      },
    ],
    mascot_checklist: [
      {
        question: 'Selecciona las acciones que has tenido recientemente:',
        options: ['Actué diferente', 'Repetí un patrón', 'Evité algo', 'Intenté cambiar'],
      },
    ],
    mascot_open: [
      { question: '¿Qué ha marcado tu día recientemente?' },
      { question: '¿Estás siendo consciente o estás en automático?' },
    ],
    phrase: [
      { text: 'Lo que no observas, se repite.' },
      { text: 'Detenerte también es avanzar.' },
      { text: 'Ser consciente cambia más que intentar controlar todo.' },
    ],
  },
  2: {
    steps: ['intro', 'mascot_choice', 'phrase', 'complete_sentence', 'phrase', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 10',
      description: 'Equivocarte no significa retroceder. Reflexionar también implica reconocer cuando fallas y decidir qué hacer con eso.',
    },
    mascot_choice: [
      {
        question: 'Cuando cometes un error, tiendes a:',
        options: ['Ignorarlo', 'Justificarlo', 'Castigarte', 'Aprender de él'],
      },
    ],
    complete_sentence: [
      { prefix: 'Hoy me doy cuenta de que…' },
    ],
    mascot_open: [
      { question: '¿Qué podrías hacer diferente la próxima vez?' },
    ],
    phrase: [
      { text: 'Equivocarte no borra tu proceso, lo hace más real.' },
      { text: 'Reconocer es más útil que castigarte.' },
      { text: 'Cada error bien visto se convierte en guía.' },
    ],
  },
  3: {
    steps: ['intro', 'complete_sentence', 'phrase', 'complete_sentence', 'phrase', 'mascot_choice', 'mascot_open', 'phrase'],
    intro: {
      title: 'Nivel 10',
      description: 'Reflexionar no sirve de mucho si no haces algo con eso. Este módulo es sobre ajustar tu camino sin perder el impulso.',
    },
    complete_sentence: [
      { prefix: 'Hoy puedo mejorar en…' },
      { prefix: 'Mañana voy a…' },
    ],
    mascot_choice: [
      {
        question: '¿Qué necesitas para continuar?',
        options: ['Paciencia', 'Constancia', 'Apoyo', 'Claridad'],
      },
    ],
    mascot_open: [
      { question: '¿Qué has aprendido de ti en este proceso?' },
    ],
    phrase: [
      { text: 'No necesitas empezar de nuevo, solo ajustar.' },
      { text: 'El cambio se construye corrigiendo, no siendo perfecto.' },
      { text: 'Seguir es más importante que hacerlo impecable.' },
    ],
  },
};