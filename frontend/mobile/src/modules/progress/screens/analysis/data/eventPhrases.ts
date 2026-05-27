export interface EventPhrases {
  noRecord: string;
  clean: string;
  difficult: string;
  future: string; // ✅ día futuro — siempre sin registro
}

export const EVENT_PHRASES: Record<string, EventPhrases> = {

  // ── CARNAVAL ─────────────────────────────────────────────────────────────
  carnaval_guacherna: {
    noRecord: 'La Guacherna es intensa. ¿Tienes un plan para esta noche?',
    clean: 'Viviste la Guacherna y te mantuviste firme. Eso no es fácil — es una victoria real.',
    difficult: 'La Guacherna puede ser muy difícil de resistir. Reconocerlo es el primer paso. Mañana es una nueva oportunidad.',
    future: 'La Guacherna se acerca. Empieza a pensar en cómo quieres vivirla — tener un plan marca la diferencia.',
  },
  carnaval_batalla_flores: {
    noRecord: 'El Carnaval celebra la vida. ¿Cómo planeas vivirlo hoy?',
    clean: 'Batalla de Flores y tú ganaste la tuya. Cada día limpio en Carnaval es un logro enorme.',
    difficult: 'El ambiente del Carnaval hace todo más difícil. No te juzgues — aprende y sigue.',
    future: 'La Batalla de Flores se acerca. El Carnaval es intenso — ¿tienes a alguien de confianza con quien vivirlo?',
  },
  carnaval_gran_parada_1: {
    noRecord: 'Gran Parada hoy. Las celebraciones pueden ser desafiantes — ten tu red de apoyo cerca.',
    clean: 'Seguiste en pie durante la Gran Parada. Tu fortaleza es más grande de lo que crees.',
    difficult: 'La fiesta puede arrastrar. Lo importante es que sigues aquí, intentándolo.',
    future: 'Gran Parada en camino. Piensa en quién quieres tener cerca ese día.',
  },
  carnaval_gran_parada_2: {
    noRecord: 'Tercer día de Carnaval. Si sientes presión, recuerda que puedes salir cuando quieras.',
    clean: 'Tres días de Carnaval y tres días de fortaleza. Impresionante.',
    difficult: 'El Carnaval es una maratón difícil. Cada nuevo día es una nueva oportunidad de elegir.',
    future: 'Tercer día de Carnaval se aproxima. Está bien decir que no a ciertas situaciones.',
  },
  carnaval_joselito: {
    noRecord: 'Último día de Carnaval. El final está cerca — ¿cómo quieres cerrarlo?',
    clean: 'Todo el Carnaval y te mantuviste firme. Joselito se va, y tú sigues de pie.',
    difficult: 'El Carnaval terminó. Lo que viene ahora eres tú — y tú puedes empezar de nuevo.',
    future: 'El último día del Carnaval se acerca. ¿Cómo quieres recordar esta semana?',
  },
  carnaval_miercoles_ceniza: {
    noRecord: 'El Carnaval terminó. El Miércoles de Ceniza invita a la reflexión — ¿qué aprendiste esta semana?',
    clean: 'Superaste el Carnaval entero. Ahora un nuevo ciclo comienza, y ya demostraste de qué estás hecho.',
    difficult: 'El Carnaval pasó. La Cuaresma es un tiempo de reflexión — y tú ya tienes mucho para reflexionar con orgullo.',
    future: 'El Miércoles de Ceniza llega pronto. Después del Carnaval, un tiempo de calma y reflexión.',
  },

  // ── SEMANA SANTA ─────────────────────────────────────────────────────────
  semana_santa_jueves: {
    noRecord: 'Jueves Santo — las reuniones familiares pueden ser intensas. Recuerda que puedes poner límites.',
    clean: 'Jueves Santo en familia y te mantuviste presente y firme. Eso es un regalo para ti y para ellos.',
    difficult: 'Las reuniones familiares pueden despertar muchas emociones. Lo que sientes es válido — busca apoyo.',
    future: 'Jueves Santo se acerca. Las reuniones familiares pueden ser intensas — planea cómo manejarlas.',
  },
  semana_santa_viernes: {
    noRecord: 'Viernes Santo — un día de quietud y reflexión. ¿Qué encuentras cuando te detienes a mirar adentro?',
    clean: 'Un día de paz, vivido plenamente. La quietud también es una forma de fortaleza.',
    difficult: 'Incluso en los días más difíciles, mañana siempre trae una nueva oportunidad.',
    future: 'Viernes Santo se acerca. Un día para la quietud y la reflexión.',
  },
  semana_santa_domingo: {
    noRecord: 'Domingo de Pascua — día de renovación. ¿Qué quieres renovar en ti?',
    clean: 'Domingo de Resurrección — y tú también estás renaciendo cada día limpio.',
    difficult: 'La Pascua habla de empezar de nuevo. Tú también puedes empezar de nuevo hoy.',
    future: 'Domingo de Pascua se acerca. ¿Qué quieres renovar en tu vida?',
  },

  // ── FESTIVOS NACIONALES ───────────────────────────────────────────────────
  anio_nuevo: {
    noRecord: '¿Cómo quieres empezar este año? Lo que elijas hoy importa.',
    clean: 'Empezaste el año con fortaleza. Eso marca el tono de todo lo que viene.',
    difficult: 'El año nuevo no te cambia — pero tú puedes cambiar en él. Siempre es tiempo de empezar.',
    future: 'Año Nuevo se acerca. Las celebraciones pueden ser desafiantes — ¿tienes un plan?',
  },
  reyes_magos: {
    noRecord: 'Día de Reyes — los mejores regalos no se compran. ¿Qué te regalas tú hoy?',
    clean: 'Te regalaste un día limpio. Ese es el mejor regalo.',
    difficult: 'Un día difícil no borra todo lo que has construido. Sigue.',
    future: 'Día de Reyes en camino. El mejor regalo que puedes prepararte es un día limpio.',
  },
  dia_san_jose: {
    noRecord: 'Un día para reflexionar sobre el cuidado — ¿cómo te estás cuidando tú?',
    clean: 'Te cuidaste hoy. Eso es lo más importante.',
    difficult: 'Cuidarte empieza por ser honesto contigo mismo. Ya lo estás haciendo.',
    future: 'Día de San José se acerca. Un buen momento para pensar en cómo te estás cuidando.',
  },
  dia_trabajo: {
    noRecord: 'Tu trabajo más importante es cuidarte. ¿Cómo lo estás haciendo hoy?',
    clean: 'Trabajaste en lo más importante hoy — en ti mismo.',
    difficult: 'Cada tropiezo es parte del trabajo. Lo que importa es seguir.',
    future: 'Día del Trabajo se acerca. Recuerda que cuidarte es también un trabajo.',
  },
  ascension: {
    noRecord: 'Un día festivo para reflexionar. ¿Qué tan lejos has llegado desde que empezaste?',
    clean: 'Subiste hoy. Cada día limpio es un paso hacia arriba.',
    difficult: 'Hay días que cuestan más. Eso no te define — lo que haces después, sí.',
    future: 'Ascensión se acerca. Mira qué tan lejos has llegado desde que empezaste.',
  },
  corpus_christi: {
    noRecord: 'La gratitud por lo que tenemos es el primer paso para cuidar lo que somos.',
    clean: 'Hoy tienes mucho que agradecer — incluyendo este día limpio.',
    difficult: 'Incluso en los días difíciles hay algo que agradecer. Búscalo.',
    future: 'Corpus Christi se acerca. La gratitud es una herramienta poderosa.',
  },
  sagrado_corazon: {
    noRecord: 'El corazón que cuidas hoy es el que te llevará donde quieres llegar.',
    clean: 'Te cuidaste el corazón hoy. Eso vale mucho.',
    difficult: 'El corazón puede doler. Busca a alguien con quien hablar — no tienes que cargarlo solo.',
    future: 'Sagrado Corazón se acerca. ¿Cómo está tu corazón hoy?',
  },
  san_pedro_pablo: {
    noRecord: 'Un día para recordar que cada día es una nueva oportunidad.',
    clean: 'Aprovechaste bien este día. Así se construye el camino.',
    difficult: 'Mañana es una nueva oportunidad. Siempre.',
    future: 'San Pedro y San Pablo se acercan. Cada nuevo día es una nueva oportunidad.',
  },
  independencia_colombia: {
    noRecord: 'La independencia también es decidir cada día quién quieres ser.',
    clean: 'Hoy elegiste bien. Eso es independencia real.',
    difficult: 'Los días difíciles también forman parte de tu historia de independencia.',
    future: 'Independencia de Colombia se acerca. ¿De qué quieres independizarte tú?',
  },
  batalla_boyaca: {
    noRecord: 'Las batallas más importantes se libran adentro. ¿Cómo va la tuya hoy?',
    clean: 'Ganaste tu batalla de hoy. Eso cuenta.',
    difficult: 'No todas las batallas se ganan. Pero los que no se rinden, eventualmente ganan la guerra.',
    future: 'Batalla de Boyacá se acerca. Tú también tienes tu propia batalla — y la estás ganando.',
  },
  asuncion_virgen: {
    noRecord: 'Un día de paz. Aprovéchalo para reconocer lo lejos que has llegado.',
    clean: 'Un día tranquilo y limpio. Esos también cuentan.',
    difficult: 'Después de los días difíciles, la paz vuelve. Aguanta.',
    future: 'Asunción se acerca. Un día de paz que mereces.',
  },
  dia_raza: {
    noRecord: 'Eres el resultado de muchas historias. La que estás escribiendo hoy es la más importante.',
    clean: 'Escribiste una buena página hoy.',
    difficult: 'Hasta las mejores historias tienen capítulos difíciles. La tuya no es la excepción.',
    future: 'Día de la Raza se acerca. ¿Qué historia quieres escribir ese día?',
  },
  todos_santos: {
    noRecord: 'Honrar a quienes amamos también significa cuidarnos a nosotros mismos.',
    clean: 'Te cuidaste hoy. Ellos también estarían orgullosos.',
    difficult: 'Los que ya no están también quisieran verte bien. Sigue intentándolo por ellos y por ti.',
    future: 'Día de Todos los Santos se acerca. Honra a quienes amas cuidándote tú también.',
  },
  independencia_cartagena: {
    noRecord: 'Declarar tu independencia de lo que te hace daño es el acto más valiente.',
    clean: 'Hoy fuiste libre. Así se siente la independencia real.',
    difficult: 'La independencia no se logra de un día para otro. Pero cada día cuenta.',
    future: 'Independencia de Cartagena se acerca. Tú también puedes declarar tu propia independencia.',
  },
  inmaculada_concepcion: {
    noRecord: 'Noche de Velitas — la luz que enciendes esta noche también ilumina tu propio camino.',
    clean: 'Brillaste hoy. Sigue así.',
    difficult: 'Incluso una vela pequeña ilumina en la oscuridad. Tú también.',
    future: 'Noche de Velitas se acerca. Prepárate para encender tu propia luz.',
  },
  navidad: {
    noRecord: 'Las reuniones navideñas pueden ser intensas. Recuerda que puedes poner límites y pedir apoyo.',
    clean: 'Navidad limpia. Ese es el mejor regalo que te pudiste dar.',
    difficult: 'La Navidad puede ser muy difícil. No estás solo — busca apoyo.',
    future: 'Navidad se acerca. Las reuniones familiares pueden ser intensas — ¿tienes un plan de apoyo?',
  },

  // ── CULTURALES ────────────────────────────────────────────────────────────
  halloween: {
    noRecord: 'Los monstruos reales no usan disfraz. El más importante ya lo estás enfrentando.',
    clean: 'Enfrentaste al monstruo hoy — y ganaste.',
    difficult: 'Todos tenemos nuestros monstruos. Lo valiente es seguir enfrentándolos.',
    future: 'Halloween se acerca. Las fiestas pueden ser difíciles — ten un plan.',
  },
  amor_amistad: {
    noRecord: 'Las personas que te acompañan son tu mayor red de apoyo. ¿Les has dicho lo importante que son?',
    clean: 'Hoy demostraste amor propio también. Eso es lo más importante.',
    difficult: 'El amor y la amistad también están para los días difíciles. Apóyate en ellos.',
    future: 'Amor y Amistad se acerca. Rodéate de quienes te cuidan de verdad.',
  },
  dia_madre: {
    noRecord: 'El mejor regalo que puedes dar hoy es tu presencia real.',
    clean: 'Te mostraste bien hoy. Eso es un regalo para todos.',
    difficult: 'Las reuniones familiares pueden despertar muchas emociones. Es normal — busca apoyo.',
    future: 'Día de la Madre se acerca. El mejor regalo es tu presencia real — cuídate para dársela.',
  },
  dia_padre: {
    noRecord: 'Ser quien quieres ser empieza por cuidarte a ti mismo.',
    clean: 'Hoy te cuidaste. Eso también es un acto de amor.',
    difficult: 'Los días difíciles también son parte de la historia. Lo que importa es no rendirse.',
    future: 'Día del Padre se acerca. Cuidarte es también cuidar a quienes amas.',
  },
  anio_viejo: {
    noRecord: 'Esta noche no necesitas alcohol para celebrar. Tu mayor logro merece ser celebrado sobrio.',
    clean: 'Cerraste el año con fortaleza. Eso dice mucho de ti.',
    difficult: 'El año cierra, pero tu camino continúa. Mañana empieza uno nuevo.',
    future: 'Año Viejo se acerca. ¿Cómo quieres cerrar este año? Piénsalo con tiempo.',
  },
  noche_velitas: {
    noRecord: 'Una pequeña luz puede iluminar mucho. La tuya también.',
    clean: 'Brillaste esta noche. Sigue encendido.',
    difficult: 'Incluso en la oscuridad, una vela basta. Tú eres esa vela.',
    future: 'Noche de Velitas se acerca. Una noche bonita — y tú puedes vivirla plenamente.',
  },
  fundacion_barranquilla: {
    noRecord: 'Barranquilla siempre ha sido tierra de quienes se reinventan. Tú también lo estás haciendo.',
    clean: 'La Arenosa celebra — y tú tienes algo que celebrar también.',
    difficult: 'Barranquilla se ha levantado muchas veces. Tú también puedes.',
    future: 'Aniversario de Barranquilla se acerca. La ciudad que te vio crecer también te acompaña en este camino.',
  },
};