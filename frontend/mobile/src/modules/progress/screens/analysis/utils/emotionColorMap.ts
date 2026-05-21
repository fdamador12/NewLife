/**
 * Mapeo de emociones a colores
 * Case-insensitive (funciona con cualquier mayúscula/minúscula)
 */
export function getEmotionColor(emotion: string): string {
  const colorMap: Record<string, string> = {
    tranquilo: '#4CAF50',      // Verde
    animado: '#FFC107',        // Amarillo
    normal: '#9E9E9E',         // Gris
    bajoneado: '#00BCD4',      // Cyan
    ansioso: '#F44336',        // Rojo
    saturado: '#9C27B0',       // Púrpura
    irritado: '#FF5722',       // Naranja
  };

  const normalized = emotion.toLowerCase().trim();
  return colorMap[normalized] || '#7050C8'; // Color fallback
}

/**
 * Orden de emociones de MEJOR a PEOR
 * Izquierda (mejor) → Derecha (peor)
 */
export const EMOTION_ORDER = [
  'tranquilo',    // 1 - Mejor
  'animado',      // 2
  'normal',       // 3
  'bajoneado',    // 4
  'ansioso',      // 5
  'saturado',     // 6
  'irritado',     // 7 - Peor
];

/**
 * Ordena las emociones según el orden predefinido
 * Las que no existan en los datos no aparecen
 */
export function sortEmotionsByOrder(
  emotions: Array<{ label: string; value: number; active: boolean }>
): Array<{ label: string; value: number; active: boolean }> {
  return emotions.sort((a, b) => {
    const indexA = EMOTION_ORDER.findIndex(
      (e) => e.toLowerCase() === a.label.toLowerCase()
    );
    const indexB = EMOTION_ORDER.findIndex(
      (e) => e.toLowerCase() === b.label.toLowerCase()
    );
    return indexA - indexB;
  });
}