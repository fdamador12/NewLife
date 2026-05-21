export function getColorByIndex(index: number): string {
  const colors_gradient = [
    '#FF3B7F',
    '#E04590',
    '#C050A0',
    '#9055B5',
    '#7050C8',
    '#5545D8',
    '#4540E5',
    '#3B5BF0',
  ];
  return colors_gradient[index % colors_gradient.length];
}

export function getColorByZone(zone: string): string {
  const colorMap: Record<string, string> = {
    'mi casa': '#FFD700',
    'casa de un amigo': '#FFA500',
    'calle': '#FF6347',
    'universidad': '#4B3B9C',
    'bar': '#FF3B7F',
    'trabajo': '#5B45C8',
    'discoteca': '#FF1493',
    'parque': '#32CD32',
  };

  const lowerZone = zone.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (lowerZone.includes(key)) return color;
  }

  return '#7050C8';
}