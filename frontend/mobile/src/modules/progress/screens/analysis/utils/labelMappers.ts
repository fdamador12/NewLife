// ==================== LABEL MAPPERS ====================

/**
 * Mapeo de labels largos a cortos para vínculos (personas)
 * Fuente: Backend SOCIAL_LABEL (pero invertido)
 */
const VINCULOS_MAP: Record<string, string> = {
  'estar solo': 'Solo/a',
  'estar con amigos': 'Amigos',
  'estar con tu pareja': 'Pareja',
  'estar con compañeros de trabajo': 'Compañeros Trabajo',
  'estar con compañeros de universidad': 'Compañeros Estudio',
  'estar con desconocidos': 'Desconocidos',
  // Fallbacks por si llega sin transformación del backend
  'solo': 'Solo/a',
  'con amigos': 'Amigos',
  'con mi pareja': 'Pareja',
  'con gente del trabajo': 'Compañeros Trabajo',
  'con gente de la uni': 'Compañeros Estudio',
  'con desconocidos': 'Desconocidos',
};

/**
 * Mapeo de labels largos a cortos para zonas (ubicaciones)
 * Fuente: Backend UBICACION_LABEL (pero invertido)
 */
const ZONAS_MAP: Record<string, string> = {
  'estar en tu casa': 'Mi casa',
  'estar en casa de un amigo': 'Casa amigo',
  'estar en la calle': 'Barrio/Calle',
  'estar en la universidad': 'Universidad',
  'estar en un bar o discoteca': 'Bar/Disco',
  // Fallbacks
  'en mi casa': 'Mi casa',
  'en casa de un amigo': 'Casa amigo',
  'en el barrio / calle': 'Barrio/Calle',
  'en la universidad': 'Universidad',
  'en un bar o disco': 'Bar/Disco',
};

/**
 * Transforma un label de vínculo al formato corto
 * Si no encuentra mapeo, devuelve el label original truncado a 12 chars
 */
export function shortenVinculoLabel(label: string): string {
  const normalized = label.toLowerCase().trim();
  return VINCULOS_MAP[normalized] || truncate(label, 12);
}

/**
 * Transforma un label de zona al formato corto
 * Si no encuentra mapeo, devuelve el label original truncado a 12 chars
 */
export function shortenZonaLabel(label: string): string {
  const normalized = label.toLowerCase().trim();
  return ZONAS_MAP[normalized] || truncate(label, 12);
}

/**
 * Trunca un string a N caracteres con puntos suspensivos
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}