export type EventType =
  | 'national_holiday'
  | 'religious'
  | 'carnaval'
  | 'cultural_barranquilla'
  | 'cultural_national';

export interface CalendarEvent {
  id: string;
  name: string;
  emoji: string;
  shortDescription: string;
  fullDescription: string;
  type: EventType;
  isHighRisk: boolean;
}

export const EVENTS_DATA: Record<string, CalendarEvent> = {

  // ── CARNAVAL DE BARRANQUILLA ─────────────────────────────────────────────
  carnaval_guacherna: {
    id: 'carnaval_guacherna',
    name: 'La Guacherna',
    emoji: '🎶',
    shortDescription: 'Desfile nocturno del Carnaval',
    fullDescription:
      'La Guacherna Esthercita Forero es el desfile nocturno más importante previo al Carnaval. Comienza a las 4:00 p.m. en la carrera 44 con calle 70, recorriendo el centro de Barranquilla hasta la Casa del Carnaval.',
    type: 'carnaval',
    isHighRisk: true,
  },
  carnaval_batalla_flores: {
    id: 'carnaval_batalla_flores',
    name: 'Batalla de Flores',
    emoji: '🌸',
    shortDescription: 'Primer día del Carnaval — Vía 40',
    fullDescription:
      'La Batalla de Flores inaugura oficialmente el Carnaval de Barranquilla, Patrimonio Cultural Inmaterial de la Humanidad. El desfile recorre la Vía 40 con comparsas, disfraces y la alegría que define a Barranquilla.',
    type: 'carnaval',
    isHighRisk: true,
  },
  carnaval_gran_parada_1: {
    id: 'carnaval_gran_parada_1',
    name: 'Gran Parada de Tradición',
    emoji: '💃',
    shortDescription: 'Segundo día del Carnaval',
    fullDescription:
      'La Gran Parada de Tradición es el segundo gran desfile del Carnaval de Barranquilla, donde desfilan las danzas y tradiciones más antiguas de la festividad.',
    type: 'carnaval',
    isHighRisk: true,
  },
  carnaval_gran_parada_2: {
    id: 'carnaval_gran_parada_2',
    name: 'Gran Parada de Comparsas y Fantasía',
    emoji: '🎭',
    shortDescription: 'Tercer día del Carnaval',
    fullDescription:
      'El tercer día del Carnaval trae las comparsas más elaboradas y los disfraces más creativos. Es uno de los días de mayor afluencia y ambiente festivo en la ciudad.',
    type: 'carnaval',
    isHighRisk: true,
  },
  carnaval_joselito: {
    id: 'carnaval_joselito',
    name: 'Entierro de Joselito Carnaval',
    emoji: '🪦',
    shortDescription: 'Último día del Carnaval — Martes',
    fullDescription:
      'El Entierro de Joselito marca el final del Carnaval de Barranquilla. Es una despedida simbólica y emotiva de las festividades, cargada de melancolía y humor costeño.',
    type: 'carnaval',
    isHighRisk: true,
  },
  carnaval_miercoles_ceniza: {
    id: 'carnaval_miercoles_ceniza',
    name: 'Miércoles de Ceniza',
    emoji: '✝️',
    shortDescription: 'Inicio de la Cuaresma',
    fullDescription:
      'El Miércoles de Ceniza marca el fin del Carnaval y el inicio de la Cuaresma, un período de reflexión de 40 días antes de la Semana Santa.',
    type: 'religious',
    isHighRisk: false,
  },

  // ── SEMANA SANTA ─────────────────────────────────────────────────────────
  semana_santa_jueves: {
    id: 'semana_santa_jueves',
    name: 'Jueves Santo',
    emoji: '🕯️',
    shortDescription: 'Semana Santa — Jueves',
    fullDescription:
      'El Jueves Santo conmemora la Última Cena. En Colombia es día festivo y muchas familias se reúnen en torno a tradiciones religiosas.',
    type: 'religious',
    isHighRisk: true,
  },
  semana_santa_viernes: {
    id: 'semana_santa_viernes',
    name: 'Viernes Santo',
    emoji: '✝️',
    shortDescription: 'Semana Santa — Viernes',
    fullDescription:
      'El Viernes Santo es el día de mayor recogimiento de la Semana Santa. Es festivo nacional en Colombia y un día de reflexión profunda.',
    type: 'religious',
    isHighRisk: false,
  },
  semana_santa_domingo: {
    id: 'semana_santa_domingo',
    name: 'Domingo de Pascua',
    emoji: '🌅',
    shortDescription: 'Domingo de Resurrección',
    fullDescription:
      'El Domingo de Pascua celebra la resurrección. Es el día más importante del calendario cristiano y símbolo de renovación y esperanza.',
    type: 'religious',
    isHighRisk: false,
  },

  // ── FESTIVOS NACIONALES FIJOS ─────────────────────────────────────────────
  anio_nuevo: {
    id: 'anio_nuevo',
    name: 'Año Nuevo',
    emoji: '🎆',
    shortDescription: 'Inicio del nuevo año',
    fullDescription:
      'El 1 de enero celebramos el comienzo de un nuevo año. Es un momento de reflexión sobre lo vivido y de intención sobre lo que queremos construir.',
    type: 'national_holiday',
    isHighRisk: true,
  },
  reyes_magos: {
    id: 'reyes_magos',
    name: 'Día de Reyes',
    emoji: '👑',
    shortDescription: 'Festivo nacional — 6 de enero',
    fullDescription:
      'El 6 de enero se celebra la llegada de los Reyes Magos. En Colombia es día festivo, especialmente significativo para las familias con niños.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  dia_san_jose: {
    id: 'dia_san_jose',
    name: 'Día de San José',
    emoji: '🌸',
    shortDescription: 'Festivo nacional — 19 de marzo (trasladado)',
    fullDescription:
      'El Día de San José es festivo nacional en Colombia. Se celebra el 19 de marzo o el lunes siguiente si cae entre semana.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  dia_trabajo: {
    id: 'dia_trabajo',
    name: 'Día del Trabajo',
    emoji: '👷',
    shortDescription: 'Festivo nacional — 1 de mayo',
    fullDescription:
      'El 1 de mayo se celebra el Día Internacional del Trabajo en Colombia y el mundo.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  ascension: {
    id: 'ascension',
    name: 'Ascensión del Señor',
    emoji: '✨',
    shortDescription: 'Festivo religioso — trasladado',
    fullDescription:
      'La Ascensión del Señor es un festivo religioso que en Colombia se traslada al lunes siguiente a los 40 días después de Pascua.',
    type: 'religious',
    isHighRisk: false,
  },
  corpus_christi: {
    id: 'corpus_christi',
    name: 'Corpus Christi',
    emoji: '🌿',
    shortDescription: 'Festivo religioso — trasladado',
    fullDescription:
      'Corpus Christi es un festivo religioso que se traslada al lunes siguiente a los 60 días después de Pascua.',
    type: 'religious',
    isHighRisk: false,
  },
  sagrado_corazon: {
    id: 'sagrado_corazon',
    name: 'Sagrado Corazón de Jesús',
    emoji: '❤️',
    shortDescription: 'Festivo religioso — trasladado',
    fullDescription:
      'El Sagrado Corazón de Jesús se celebra el lunes siguiente a los 68 días después de Pascua en Colombia.',
    type: 'religious',
    isHighRisk: false,
  },
  san_pedro_pablo: {
    id: 'san_pedro_pablo',
    name: 'San Pedro y San Pablo',
    emoji: '⛵',
    shortDescription: 'Festivo nacional — 29 de junio (trasladado)',
    fullDescription:
      'El 29 de junio se celebra a San Pedro y San Pablo. En Colombia es festivo trasladado al lunes siguiente.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  independencia_colombia: {
    id: 'independencia_colombia',
    name: 'Independencia de Colombia',
    emoji: '🇨🇴',
    shortDescription: 'Festivo nacional — 20 de julio',
    fullDescription:
      'El 20 de julio de 1810 marcó el inicio del proceso de independencia de Colombia.',
    type: 'national_holiday',
    isHighRisk: true,
  },
  batalla_boyaca: {
    id: 'batalla_boyaca',
    name: 'Batalla de Boyacá',
    emoji: '⚔️',
    shortDescription: 'Festivo nacional — 7 de agosto',
    fullDescription:
      'El 7 de agosto de 1819 se libró la Batalla de Boyacá, que consolidó la independencia de Colombia.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  asuncion_virgen: {
    id: 'asuncion_virgen',
    name: 'Asunción de la Virgen',
    emoji: '🌟',
    shortDescription: 'Festivo nacional — 15 de agosto (trasladado)',
    fullDescription:
      'La Asunción de la Virgen María se celebra el 15 de agosto y en Colombia se traslada al lunes siguiente.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  dia_raza: {
    id: 'dia_raza',
    name: 'Día de la Raza',
    emoji: '🌎',
    shortDescription: 'Festivo nacional — 12 de octubre (trasladado)',
    fullDescription:
      'El 12 de octubre conmemora el encuentro de culturas que dio origen a lo que hoy es América Latina.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  todos_santos: {
    id: 'todos_santos',
    name: 'Día de Todos los Santos',
    emoji: '🕯️',
    shortDescription: 'Festivo nacional — 1 de noviembre (trasladado)',
    fullDescription:
      'El Día de Todos los Santos es un momento para recordar a quienes ya no están.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  independencia_cartagena: {
    id: 'independencia_cartagena',
    name: 'Independencia de Cartagena',
    emoji: '🏰',
    shortDescription: 'Festivo nacional — 11 de noviembre (trasladado)',
    fullDescription:
      'El 11 de noviembre de 1811 Cartagena declaró su independencia absoluta.',
    type: 'national_holiday',
    isHighRisk: false,
  },
  inmaculada_concepcion: {
    id: 'inmaculada_concepcion',
    name: 'Inmaculada Concepción',
    emoji: '🌟',
    shortDescription: 'Festivo nacional — 8 de diciembre',
    fullDescription:
      'El 8 de diciembre se celebra la Inmaculada Concepción. En Colombia es la Noche de Velitas.',
    type: 'national_holiday',
    isHighRisk: true,
  },
  navidad: {
    id: 'navidad',
    name: 'Navidad',
    emoji: '🎄',
    shortDescription: 'Festivo nacional — 25 de diciembre',
    fullDescription:
      'La Navidad es la festividad más importante del año para muchas familias colombianas.',
    type: 'national_holiday',
    isHighRisk: true,
  },

  // ── FECHAS CULTURALES NACIONALES ─────────────────────────────────────────
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    shortDescription: '31 de octubre',
    fullDescription:
      'El 31 de octubre se celebra Halloween en Colombia, especialmente entre los más jóvenes.',
    type: 'cultural_national',
    isHighRisk: true,
  },
  amor_amistad: {
    id: 'amor_amistad',
    name: 'Amor y Amistad',
    emoji: '💛',
    shortDescription: 'Tercer sábado de septiembre',
    fullDescription:
      'El Día del Amor y la Amistad se celebra el tercer sábado de septiembre en Colombia.',
    type: 'cultural_national',
    isHighRisk: false,
  },
  dia_madre: {
    id: 'dia_madre',
    name: 'Día de la Madre',
    emoji: '💐',
    shortDescription: 'Segundo domingo de mayo',
    fullDescription:
      'El Día de la Madre se celebra el segundo domingo de mayo en Colombia.',
    type: 'cultural_national',
    isHighRisk: true,
  },
  dia_padre: {
    id: 'dia_padre',
    name: 'Día del Padre',
    emoji: '👔',
    shortDescription: 'Tercer domingo de junio',
    fullDescription:
      'El Día del Padre se celebra el tercer domingo de junio en Colombia.',
    type: 'cultural_national',
    isHighRisk: true,
  },
  anio_viejo: {
    id: 'anio_viejo',
    name: 'Año Viejo',
    emoji: '🎉',
    shortDescription: '31 de diciembre',
    fullDescription:
      'El 31 de diciembre es la noche de despedida del año en Colombia.',
    type: 'cultural_national',
    isHighRisk: true,
  },
  noche_velitas: {
    id: 'noche_velitas',
    name: 'Noche de Velitas',
    emoji: '🕯️',
    shortDescription: '7 de diciembre — tradición colombiana',
    fullDescription:
      'La Noche de Velitas del 7 de diciembre marca el inicio de la temporada navideña en Colombia.',
    type: 'cultural_national',
    isHighRisk: true,
  },

  // ── BARRANQUILLA ESPECÍFICO ───────────────────────────────────────────────
  fundacion_barranquilla: {
    id: 'fundacion_barranquilla',
    name: 'Aniversario de Barranquilla',
    emoji: '🌊',
    shortDescription: '7 de abril — fundación de Barranquilla',
    fullDescription:
      'El 7 de abril se conmemora la fundación de Barranquilla en 1813.',
    type: 'cultural_barranquilla',
    isHighRisk: false,
  },
};