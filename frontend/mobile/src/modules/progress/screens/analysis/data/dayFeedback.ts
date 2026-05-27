export interface DayFeedback {
  emoji: string;
  title: string;
  message: string;
}

// ✅ 7 emociones × 2 estados + default por estado = 16 combinaciones
const DIFFICULT_FEEDBACK: Record<string, DayFeedback> = {
  Tranquilo: {
    emoji: '🤔',
    title: 'Día difícil',
    message: 'A veces consumimos incluso cuando estamos tranquilos. Entender por qué ayuda a prepararse mejor para la próxima vez.',
  },
  Animado: {
    emoji: '🎉',
    title: 'Día difícil',
    message: 'La celebración y la euforia pueden ser detonantes. Ahora que lo identificas, puedes prepararte mejor cuando te sientas así.',
  },
  Normal: {
    emoji: '😐',
    title: 'Día difícil',
    message: 'A veces los días más "normales" son los más difíciles de manejar. Reconocerlo es el primer paso para cambiar el patrón.',
  },
  Bajoneado: {
    emoji: '💙',
    title: 'Día difícil',
    message: 'Estabas bajoneado y fue un día complicado. El dolor emocional es uno de los detonantes más comunes. No te juzgues — aprende.',
  },
  Ansioso: {
    emoji: '💙',
    title: 'Día difícil',
    message: 'La ansiedad hace todo más difícil de resistir. Reconocerlo ya es un paso importante — busca herramientas para manejarla.',
  },
  Saturado: {
    emoji: '💙',
    title: 'Día difícil',
    message: 'Estabas al límite y cediste. En esos momentos cualquiera tropieza. Lo importante es no quedarse ahí.',
  },
  Irritado: {
    emoji: '💙',
    title: 'Día difícil',
    message: 'La irritación puede nublar el juicio. Ahora que identificas este detonante, puedes trabajar en él.',
  },
  default: {
    emoji: '💪',
    title: 'Día difícil',
    message: 'Un día complicado. Reconocerlo ya es un paso. Mañana siempre trae una nueva oportunidad.',
  },
};

const CLEAN_FEEDBACK: Record<string, DayFeedback> = {
  Tranquilo: {
    emoji: '✨',
    title: '¡Día limpio!',
    message: 'Tranquilo y limpio — eso es exactamente lo que buscamos. La calma y la claridad son tus aliadas.',
  },
  Animado: {
    emoji: '🌟',
    title: '¡Día limpio!',
    message: 'Animado y limpio — la mejor combinación posible. Ese entusiasmo es tuyo, no de ninguna sustancia.',
  },
  Normal: {
    emoji: '✅',
    title: '¡Día limpio!',
    message: 'Un día normal y limpio. Esos también construyen el camino — no todos los días tienen que ser épicos.',
  },
  Bajoneado: {
    emoji: '💪',
    title: '¡Día limpio!',
    message: 'Te sentías bajoneado y aún así lo lograste. Eso no es poca cosa — es fortaleza real.',
  },
  Ansioso: {
    emoji: '💪',
    title: '¡Día limpio!',
    message: 'Ansioso y aún limpio. Resistir cuando la ansiedad aprieta es una de las victorias más difíciles. La lograste.',
  },
  Saturado: {
    emoji: '🏆',
    title: '¡Día limpio!',
    message: 'Saturado y aún limpio — impresionante. Tu fortaleza es más grande de lo que crees.',
  },
  Irritado: {
    emoji: '🏆',
    title: '¡Día limpio!',
    message: 'Irritado y aún limpio. Controlaste el impulso cuando más difícil estaba. Eso es una victoria.',
  },
  default: {
    emoji: '🌟',
    title: '¡Día limpio!',
    message: 'Lo lograste. Cada día limpio es un ladrillo más en tu camino.',
  },
};

// ✅ Función principal — retorna feedback según tipo y emoción
export function getDayFeedback(
  tipo: 'limpio' | 'dificil',
  emocion: string,
): DayFeedback {
  const map = tipo === 'limpio' ? CLEAN_FEEDBACK : DIFFICULT_FEEDBACK;
  return map[emocion] || map['default'];
}