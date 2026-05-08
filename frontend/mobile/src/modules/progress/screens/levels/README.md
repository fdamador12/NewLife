# Módulo: Levels (12 Pasos de Recuperación)

## ¿Qué había antes?
36 archivos individuales (`Nivel1Modulo1.tsx` ... `Nivel12Modulo3.tsx`) con:
- Encoding roto (`Â¡Felicidades!`, `MÃ³dulo`, etc.)
- Lógica duplicada en cada archivo
- `Alert.alert` nativos sin estética consistente
- Sin validaciones — el botón siempre activo
- Contenido hardcodeado en cada archivo

## ¿Qué hicimos?
Refactorización completa a arquitectura modular por capas:
levels/
├── data/                     ← Solo contenido, sin lógica
│   ├── types.ts              ← Tipos TypeScript compartidos
│   ├── index.ts              ← Combina y exporta MODULES_CONTENT
│   ├── nivel1.ts             ← Contenido de los 3 módulos del Paso 1
│   ├── nivel2.ts
│   └── ... (hasta nivel12.ts)
│
├── components/               ← Componentes visuales independientes
│   ├── MascotBubble.tsx      ← Burbuja con mascota aleatoria
│   ├── ReflectivePhrase.tsx  ← Tarjeta de frase motivacional animada
│   ├── MultipleChoice.tsx    ← Selector de opción múltiple
│   ├── OpenQuestion.tsx      ← Campo de texto libre
│   └── CompleteSentence.tsx  ← Completar una frase con prefijo
│
├── steps/                    ← Adaptadores de navegación (12 archivos)
│   ├── Nivel1.tsx            ← Exporta Nivel1Modulo1, Nivel1Modulo2, Nivel1Modulo3
│   └── ... (hasta Nivel12.tsx)
│
├── NivelModulo.tsx           ← Lógica central reutilizable
├── SubLevelScreen.tsx        ← Layout visual (barra progreso, scroll, botón)
├── LevelCompleteScreen.tsx   ← Pantalla de nivel completado
└── LevelDetailScreen.tsx     ← Detalle de nivel

## Cómo funciona

### Flujo de datos
AppNavigator
→ Nivel7Modulo2 (steps/Nivel7.tsx)
→ NivelModulo (level=7, sublevel=2)
→ MODULES_CONTENT[7][2] (data/nivel7.ts)
→ SubLevelScreen + componentes

### NivelModulo.tsx
Es el cerebro del sistema. Recibe `level` y `sublevel`, busca el contenido en `MODULES_CONTENT` y:
- Lee `content.steps` para saber el orden y tipo de cada paso
- Renderiza el componente correcto según el tipo de step
- Desactiva el botón si el step requiere respuesta y no la tiene
- Al completar: guarda progreso, muestra toast de éxito y navega a Path
- En error: muestra toast específico (sin conexión, sesión expirada, error general)

### Validaciones automáticas
El botón "Continuar" se desactiva automáticamente según el tipo de step:
- `mascot_choice` → desactivado hasta que seleccione una opción
- `mascot_open` → desactivado hasta que escriba algo
- `complete_sentence` → desactivado hasta que escriba algo
- `phrase` → siempre activo (solo leer)
- `intro` → siempre activo

## Cómo modificar el contenido de un módulo

Solo edita el archivo correspondiente en `data/`. Por ejemplo para el Paso 7, Módulo 2:

```ts
// data/nivel7.ts
2: {
  steps: ['intro', 'phrase', 'mascot_open', 'mascot_choice', 'phrase'],
  intro: {
    title: 'Paso 7, Módulo 2',
    description: 'Tu descripción aquí.',
  },
  mascot_open: [
    { question: '¿Qué sientes cuando pides ayuda?' },
  ],
  mascot_choice: [
    {
      question: '¿Cómo describes tu disposición hoy?',
      options: ['Abierto', 'Dudoso', 'Resistente', 'En proceso'],
    },
  ],
  phrase: [
    { text: 'Pedir ayuda es un acto de valentía.' },
    { text: 'Cada día es una nueva oportunidad.' },
  ],
},
```

**Regla importante:** el array `steps` y los arrays de contenido deben coincidir en cantidad.
Si pones 3 veces `phrase` en `steps`, necesitas 3 objetos en el array `phrase`.

## Tipos de steps disponibles

| Tipo | Componente | Validación |
|------|-----------|------------|
| `intro` | Pantalla de introducción con mascota | Ninguna |
| `phrase` | Tarjeta de frase reflexiva animada | Ninguna |
| `mascot_open` | Burbuja + campo de texto libre | Requiere texto |
| `mascot_choice` | Burbuja + opciones múltiples | Requiere selección |
| `complete_sentence` | Prefijo + campo de texto | Requiere texto |

## Ejemplos de estructuras posibles

### Módulo solo con frases (meditación)
```ts
steps: ['intro', 'phrase', 'phrase', 'phrase'],
phrase: [
  { text: 'Primera reflexión.' },
  { text: 'Segunda reflexión.' },
  { text: 'Tercera reflexión.' },
],
```

### Módulo solo con preguntas abiertas
```ts
steps: ['intro', 'mascot_open', 'mascot_open', 'mascot_open'],
mascot_open: [
  { question: '¿Cómo te sientes hoy?' },
  { question: '¿Qué aprendiste esta semana?' },
  { question: '¿Qué quieres mejorar?' },
],
```

### Módulo mixto con muchos pasos
```ts
steps: ['intro', 'phrase', 'mascot_choice', 'phrase', 'mascot_open', 'phrase', 'mascot_open', 'phrase'],
// Requiere: 4 phrases, 1 mascot_choice, 2 mascot_open
```

### Sin límite de cantidad
Hipotéticamente 15 frases:
```ts
steps: ['intro', 'phrase', 'phrase', ...(x15)],
phrase: [
  { text: 'Frase 1.' },
  // ... hasta 15
],
```

## Lo que NO debes tocar para agregar contenido
- `NivelModulo.tsx`
- `SubLevelScreen.tsx`
- Los 12 archivos de `steps/`
- `AppNavigator.tsx`
- Los componentes en `components/`

**Solo edita archivos en `data/`.**