// ✅ Colores por tipo de evento
export const EVENT_TYPE_COLORS: Record<string, string> = {
  carnaval: '#FF6B35',
  national_holiday: '#F39C12', // ✅ dorado
  religious: '#9B59B6',
  cultural_national: '#E91E8C',
  cultural_barranquilla: '#00BCD4',
};

// ✅ Prioridad visual — el primer match gana el color del punto
export const EVENT_TYPE_PRIORITY = [
  'carnaval',
  'cultural_barranquilla',
  'national_holiday',
  'religious',
  'cultural_national',
];

// ✅ Retorna hasta 3 colores únicos para los puntos del día
export function getEventDotColors(types: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const priority of EVENT_TYPE_PRIORITY) {
    if (types.includes(priority) && !seen.has(priority)) {
      seen.add(priority);
      result.push(EVENT_TYPE_COLORS[priority]);
      if (result.length === 3) break;
    }
  }

  return result;
}

// ✅ Etiquetas legibles para la leyenda
export const EVENT_TYPE_LABELS: Record<string, string> = {
  carnaval: 'Carnaval',
  national_holiday: 'Festivo',
  religious: 'Religioso',
  cultural_national: 'Cultural',
  cultural_barranquilla: 'Barranquilla',
};