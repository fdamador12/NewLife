import { PetForm } from '../types/pet.types';

export const PET_IMAGES: Record<PetForm, any> = {
  seed:              require('../../../assets/images/pet/seed.png'),
  sprout:            require('../../../assets/images/pet/sprout.png'),
  moss:              require('../../../assets/images/pet/moss.png'),
  flower_lavanda:    require('../../../assets/images/pet/flower_lavanda.png'),
  flower_azucena:    require('../../../assets/images/pet/flower_azucena.png'),
  flower_baobab:     require('../../../assets/images/pet/flower_baobab.png'),
  flower_lirio:      require('../../../assets/images/pet/flower_lirio.png'),
  flower_crisantemo: require('../../../assets/images/pet/flower_crisantemo.png'),
};

export const PET_NAMES: Record<PetForm, string> = {
  seed:              'Semilla',
  sprout:            'Brote',
  moss:              'Musgo',
  flower_lavanda:    'Lavanda',
  flower_azucena:    'Azucena',
  flower_baobab:     'Baobab',
  flower_lirio:      'Lirio',
  flower_crisantemo: 'Crisantemo',
};

export const PET_DESCRIPTIONS: Record<PetForm, { tagline: string; description: string }> = {
  seed: {
    tagline: '¡Sueña con ser un árbol gigante!',
    description: '¡Hola! Soy tu nueva semilla-mascota. No sé cómo llegué aquí, pero estoy contigo. ¡Cuídame y verás cómo florecemos juntos!',
  },
  sprout: {
    tagline: 'Mis primeras hojas al sol.',
    description: 'Ya soy un brote. Algo en ti cambió y yo lo siento. Sigamos creciendo juntos, cada día un poco más.',
  },
  moss: {
    tagline: 'Fuerte y tranquilo como la naturaleza.',
    description: 'Me convertí en musgo. Soy resiliente, me adapto a cualquier superficie. Como tú, que sigues adelante sin importar lo que venga.',
  },
  flower_lavanda: {
    tagline: 'Calma y equilibrio en cada pétalo.',
    description: '¡Florecí! La lavanda representa la serenidad. Tu constancia nos trajo hasta aquí.',
  },
  flower_azucena: {
    tagline: 'La disciplina tiene su recompensa.',
    description: 'La azucena florece para quienes no se rinden. Tu disciplina día a día nos hizo llegar a este momento.',
  },
  flower_baobab: {
    tagline: 'Raíces profundas, alma inquebrantable.',
    description: 'El baobab es el árbol de la vida. Tu resiliencia y tiempo sobrio construyeron algo extraordinario.',
  },
  flower_lirio: {
    tagline: 'La constancia es la flor más bella.',
    description: 'El lirio nace de la constancia. Cada actividad, cada paso completado nos acercó a este momento.',
  },
  flower_crisantemo: {
    tagline: 'El equilibrio es el camino.',
    description: 'El crisantemo representa el equilibrio total. Has usado cada parte de tu camino con sabiduría.',
  },
};

export const PET_MESSAGES: Record<PetForm, string[]> = {
  seed: [
    'Estoy creciendo contigo. ¡Sigue así!',
    'Cada día cuenta. Estoy aquí.',
    'Un pequeño paso hoy, un gran cambio mañana.',
  ],
  sprout: [
    'Mira cuánto hemos avanzado juntos.',
    'Tu esfuerzo me hace crecer.',
    'Estás construyendo algo hermoso.',
  ],
  moss: [
    'Ya somos fuertes. No te rindas.',
    'Tu constancia es increíble.',
    'Cada registro es una victoria.',
  ],
  flower_lavanda: [
    'La calma es tu mayor fortaleza.',
    'Respira. Estás exactamente donde debes estar.',
    'Tu serenidad inspira a quienes te rodean.',
  ],
  flower_azucena: [
    '¡Florecimos! Esto es solo el comienzo.',
    'Tu disciplina te trajo hasta aquí.',
    'Cada día sobrio es una victoria enorme.',
  ],
  flower_baobab: [
    'Tus raíces son profundas e inquebrantables.',
    'Eres más fuerte de lo que crees.',
    'El tiempo que llevas sobrio es tu mayor logro.',
  ],
  flower_lirio: [
    'Tu constancia es admirable.',
    'Cada paso completado nos acercó a este momento.',
    'La persistencia es tu superpoder.',
  ],
  flower_crisantemo: [
    'El equilibrio que encontraste es extraordinario.',
    'Tu camino es único y valioso.',
    'Has integrado cada parte de tu proceso con sabiduría.',
  ],
};

export function getPetMessage(form: PetForm): string {
  const messages = PET_MESSAGES[form] ?? PET_MESSAGES['seed'];
  return messages[Math.floor(Math.random() * messages.length)];
}

export const PET_BACKGROUNDS: Record<number, { primary: string; secondary: string; accent: string }> = {
  1: { primary: '#8B6914', secondary: '#A0785A', accent: '#C4936A' },
  2: { primary: '#4A7C59', secondary: '#6B9E78', accent: '#8FBC8F' },
  3: { primary: '#2D6A4F', secondary: '#40916C', accent: '#52B788' },
  4: { primary: '#6B4FA0', secondary: '#9B72CF', accent: '#C9A8E0' },
};

export const XP_THRESHOLDS = [
  { form: 'seed'              as PetForm, xp: 0,    label: 'Semilla',    evolution: 1 },
  { form: 'sprout'            as PetForm, xp: 100,  label: 'Brote',      evolution: 1 },
  { form: 'moss'              as PetForm, xp: 300,  label: 'Musgo',      evolution: 2 },
  { form: 'flower_lavanda'    as PetForm, xp: 500,  label: 'Lavanda',    evolution: 3 },
  { form: 'flower_azucena'    as PetForm, xp: 700,  label: 'Azucena',    evolution: 3 },
  { form: 'flower_baobab'     as PetForm, xp: 900,  label: 'Baobab',     evolution: 3 },
  { form: 'flower_lirio'      as PetForm, xp: 1100, label: 'Lirio',      evolution: 3 },
  { form: 'flower_crisantemo' as PetForm, xp: 1300, label: 'Crisantemo', evolution: 3 },
];

export function getNextThreshold(xp: number): { form: PetForm; xp: number; label: string; evolution: number } | null {
  return XP_THRESHOLDS.find(t => t.xp > xp) ?? null;
}

export function getXpProgress(xp: number): { current: number; next: number; progress: number } {
  const currentThreshold = [...XP_THRESHOLDS].reverse().find(t => xp >= t.xp);
  const nextThreshold = getNextThreshold(xp);

  if (!nextThreshold) {
    return { current: xp, next: xp, progress: 1 };
  }

  const currentXp = currentThreshold?.xp ?? 0;
  const range = nextThreshold.xp - currentXp;
  const progress = (xp - currentXp) / range;

  return {
    current: xp - currentXp,
    next: range,
    progress: Math.min(progress, 1),
  };
}