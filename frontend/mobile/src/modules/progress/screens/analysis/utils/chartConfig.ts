// analysis/utils/chartConfig.ts

export const chartConfig = {
  colors: {
    primary: '#00BCD4',
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
    secondary: '#9C27B0',
    info: '#2196F3',
    light: '#E3F2FD',
  },
  emotionColors: {
    '😇': '#4CAF50', // Tranquilo - verde
    '😄': '#FFC107', // Animado - amarillo
    '😐': '#9E9E9E', // Normal - gris
    '😔': '#00BCD4', // Bajoneado - azul
    '😰': '#F44336', // Ansioso - rojo
    '🤯': '#9C27B0', // Saturado - púrpura
    '😡': '#FF5722', // Irritado - naranja
  },
  animation: {
    duration: 600,
    delay: 100,
  },
  chartSpacing: {
    padding: 20,
    margin: 10,
  },
  fonts: {
    small: 12,
    medium: 14,
    large: 16,
  },
};

export const EMOTION_MAP: Record<string, { emoji: string; value: number }> = {
  'Tranquilo': { emoji: '😇', value: 1 },
  'Animado': { emoji: '😄', value: 2 },
  'Normal': { emoji: '😐', value: 3 },
  'Bajoneado': { emoji: '😔', value: 4 },
  'Ansioso': { emoji: '😰', value: 5 },
  'Saturado': { emoji: '🤯', value: 6 },
  'Irritado': { emoji: '😡', value: 7 },
};

export const LOCATION_EMOJIS: Record<string, string> = {
  'En mi casa': '🏠',
  'En casa de un amigo': '🏡',
  'En el barrio / calle': '🏙️',
  'En la universidad': '🎓',
  'En un bar o disco': '🪩',
};

export const getEmotionColor = (emotion: string): string => {
  const emoji = EMOTION_MAP[emotion]?.emoji;
  if (!emoji) return chartConfig.colors.primary;
  
  const color = (chartConfig.emotionColors as Record<string, string>)[emoji];
  return color || chartConfig.colors.primary;
};

export const getEmotionValue = (emotion: string): number => {
  return EMOTION_MAP[emotion]?.value || 3;
};