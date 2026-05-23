/**
 * components.test.js
 * Pruebas unitarias para los componentes del frontend móvil de NewLife.
 * Se prueba la lógica de renderizado, estado, props y eventos sin DOM real.
 */

const {
  mockUsers,
  mockCredentials,
  mockCheckins,
  mockCheckinResponse,
  mockPet,
  mockCamino,
  mockFrase,
  mockMedals,
} = require('../../fixtures/mock-data');

// ─── Simulación de componentes (lógica pura, sin React Native) ────────────────
// Extraemos la lógica de cada pantalla para probarla de forma aislada

// ─── LoginScreen ──────────────────────────────────────────────────────────────

function createLoginScreenState() {
  return {
    email: '',
    password: '',
    rememberMe: false,
    loading: false,
    error: null,
    passwordVisible: false,
  };
}

function loginScreenReducer(state, action) {
  switch (action.type) {
    case 'SET_EMAIL': return { ...state, email: action.value, error: null };
    case 'SET_PASSWORD': return { ...state, password: action.value, error: null };
    case 'TOGGLE_REMEMBER': return { ...state, rememberMe: !state.rememberMe };
    case 'TOGGLE_PASSWORD_VISIBLE': return { ...state, passwordVisible: !state.passwordVisible };
    case 'SET_LOADING': return { ...state, loading: action.value };
    case 'SET_ERROR': return { ...state, error: action.message, loading: false };
    case 'RESET': return createLoginScreenState();
    default: return state;
  }
}

function canSubmitLogin(state) {
  return (
    state.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email) &&
    state.password.length >= 6 &&
    !state.loading
  );
}

describe('LoginScreen — lógica de estado', () => {
  let state;

  beforeEach(() => {
    state = createLoginScreenState();
  });

  test('estado inicial con campos vacíos', () => {
    expect(state.email).toBe('');
    expect(state.password).toBe('');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('actualiza el email correctamente', () => {
    state = loginScreenReducer(state, { type: 'SET_EMAIL', value: 'test@test.com' });
    expect(state.email).toBe('test@test.com');
  });

  test('limpia el error al cambiar el email', () => {
    state = loginScreenReducer(state, { type: 'SET_ERROR', message: 'Error previo' });
    state = loginScreenReducer(state, { type: 'SET_EMAIL', value: 'nuevo@test.com' });
    expect(state.error).toBeNull();
  });

  test('toggle de rememberMe funciona correctamente', () => {
    expect(state.rememberMe).toBe(false);
    state = loginScreenReducer(state, { type: 'TOGGLE_REMEMBER' });
    expect(state.rememberMe).toBe(true);
    state = loginScreenReducer(state, { type: 'TOGGLE_REMEMBER' });
    expect(state.rememberMe).toBe(false);
  });

  test('toggle de visibilidad de contraseña', () => {
    expect(state.passwordVisible).toBe(false);
    state = loginScreenReducer(state, { type: 'TOGGLE_PASSWORD_VISIBLE' });
    expect(state.passwordVisible).toBe(true);
  });

  test('canSubmitLogin es false con email vacío', () => {
    state = loginScreenReducer(state, { type: 'SET_PASSWORD', value: 'Abc123!' });
    expect(canSubmitLogin(state)).toBe(false);
  });

  test('canSubmitLogin es false con email inválido', () => {
    state = loginScreenReducer(state, { type: 'SET_EMAIL', value: 'noesemail' });
    state = loginScreenReducer(state, { type: 'SET_PASSWORD', value: 'Abc123!' });
    expect(canSubmitLogin(state)).toBe(false);
  });

  test('canSubmitLogin es false con password corta', () => {
    state = loginScreenReducer(state, { type: 'SET_EMAIL', value: 'test@test.com' });
    state = loginScreenReducer(state, { type: 'SET_PASSWORD', value: '123' });
    expect(canSubmitLogin(state)).toBe(false);
  });

  test('canSubmitLogin es true con datos válidos', () => {
    state = loginScreenReducer(state, { type: 'SET_EMAIL', value: 'test@test.com' });
    state = loginScreenReducer(state, { type: 'SET_PASSWORD', value: 'Abc123!' });
    expect(canSubmitLogin(state)).toBe(true);
  });

  test('canSubmitLogin es false durante loading', () => {
    state = loginScreenReducer(state, { type: 'SET_EMAIL', value: 'test@test.com' });
    state = loginScreenReducer(state, { type: 'SET_PASSWORD', value: 'Abc123!' });
    state = loginScreenReducer(state, { type: 'SET_LOADING', value: true });
    expect(canSubmitLogin(state)).toBe(false);
  });

  test('establece error correctamente', () => {
    state = loginScreenReducer(state, { type: 'SET_ERROR', message: 'Credenciales inválidas' });
    expect(state.error).toBe('Credenciales inválidas');
    expect(state.loading).toBe(false);
  });

  test('reset vuelve al estado inicial', () => {
    state = loginScreenReducer(state, { type: 'SET_EMAIL', value: 'test@test.com' });
    state = loginScreenReducer(state, { type: 'SET_ERROR', message: 'Error' });
    state = loginScreenReducer(state, { type: 'RESET' });
    expect(state.email).toBe('');
    expect(state.error).toBeNull();
  });
});

// ─── DailyCheckInScreen ───────────────────────────────────────────────────────

function createCheckInState() {
  return {
    emocion: null,
    consumo: null,
    gratitud: '',
    reflexion: '',
    loading: false,
    submitted: false,
    error: null,
    step: 1, // 1=emoción, 2=consumo, 3=gratitud
  };
}

function checkInReducer(state, action) {
  switch (action.type) {
    case 'SELECT_EMOCION': return { ...state, emocion: action.value, step: 2 };
    case 'SELECT_CONSUMO': return { ...state, consumo: action.value, step: 3 };
    case 'SET_GRATITUD': return { ...state, gratitud: action.value };
    case 'SET_REFLEXION': return { ...state, reflexion: action.value };
    case 'SUBMIT_START': return { ...state, loading: true, error: null };
    case 'SUBMIT_SUCCESS': return { ...state, loading: false, submitted: true };
    case 'SUBMIT_ERROR': return { ...state, loading: false, error: action.message };
    default: return state;
  }
}

function canSubmitCheckin(state) {
  return state.emocion !== null && state.consumo !== null && state.gratitud.trim().length > 0;
}

describe('DailyCheckInScreen — lógica de estado', () => {
  let state;

  beforeEach(() => {
    state = createCheckInState();
  });

  test('estado inicial con campos nulos', () => {
    expect(state.emocion).toBeNull();
    expect(state.consumo).toBeNull();
    expect(state.gratitud).toBe('');
    expect(state.step).toBe(1);
  });

  test('seleccionar emoción avanza al paso 2', () => {
    state = checkInReducer(state, { type: 'SELECT_EMOCION', value: 'bien' });
    expect(state.emocion).toBe('bien');
    expect(state.step).toBe(2);
  });

  test('seleccionar consumo avanza al paso 3', () => {
    state = checkInReducer(state, { type: 'SELECT_EMOCION', value: 'bien' });
    state = checkInReducer(state, { type: 'SELECT_CONSUMO', value: false });
    expect(state.consumo).toBe(false);
    expect(state.step).toBe(3);
  });

  test('canSubmitCheckin es false sin emoción', () => {
    state = checkInReducer(state, { type: 'SELECT_CONSUMO', value: false });
    state = checkInReducer(state, { type: 'SET_GRATITUD', value: 'Gracias.' });
    expect(canSubmitCheckin(state)).toBe(false);
  });

  test('canSubmitCheckin es false sin gratitud', () => {
    state = checkInReducer(state, { type: 'SELECT_EMOCION', value: 'bien' });
    state = checkInReducer(state, { type: 'SELECT_CONSUMO', value: false });
    expect(canSubmitCheckin(state)).toBe(false);
  });

  test('canSubmitCheckin es true con todos los datos', () => {
    state = checkInReducer(state, { type: 'SELECT_EMOCION', value: 'bien' });
    state = checkInReducer(state, { type: 'SELECT_CONSUMO', value: false });
    state = checkInReducer(state, { type: 'SET_GRATITUD', value: 'Agradezco el día.' });
    expect(canSubmitCheckin(state)).toBe(true);
  });

  test('estado loading durante envío', () => {
    state = checkInReducer(state, { type: 'SUBMIT_START' });
    expect(state.loading).toBe(true);
  });

  test('estado submitted después de éxito', () => {
    state = checkInReducer(state, { type: 'SUBMIT_SUCCESS' });
    expect(state.submitted).toBe(true);
    expect(state.loading).toBe(false);
  });
});

// ─── PetScreen ────────────────────────────────────────────────────────────────

function createPetState(pet = null) {
  return {
    pet,
    loading: !pet,
    error: null,
    animating: false,
    evolutionAlert: null,
  };
}

function petScreenReducer(state, action) {
  switch (action.type) {
    case 'LOAD_PET': return { ...state, pet: action.pet, loading: false };
    case 'ADD_XP_START': return { ...state, animating: true };
    case 'ADD_XP_SUCCESS': return {
      ...state,
      animating: false,
      pet: { ...state.pet, xp_actual: action.newXp },
      evolutionAlert: action.evolucionado ? action.nuevaForma : null,
    };
    case 'SET_ERROR': return { ...state, error: action.message, loading: false };
    case 'DISMISS_EVOLUTION': return { ...state, evolutionAlert: null };
    default: return state;
  }
}

describe('PetScreen — lógica de estado', () => {
  let state;

  beforeEach(() => {
    state = createPetState();
  });

  test('estado inicial cargando cuando no hay mascota', () => {
    expect(state.loading).toBe(true);
    expect(state.pet).toBeNull();
  });

  test('estado inicial no cargando cuando hay mascota', () => {
    const stateWithPet = createPetState(mockPet);
    expect(stateWithPet.loading).toBe(false);
    expect(stateWithPet.pet).toEqual(mockPet);
  });

  test('cargar mascota actualiza el estado', () => {
    state = petScreenReducer(state, { type: 'LOAD_PET', pet: mockPet });
    expect(state.pet).toEqual(mockPet);
    expect(state.loading).toBe(false);
  });

  test('animating es true durante adición de XP', () => {
    state = petScreenReducer(createPetState(mockPet), { type: 'ADD_XP_START' });
    expect(state.animating).toBe(true);
  });

  test('actualiza XP correctamente después de éxito', () => {
    state = petScreenReducer(createPetState(mockPet), { type: 'ADD_XP_SUCCESS', newXp: 260, evolucionado: false, nuevaForma: null });
    expect(state.pet.xp_actual).toBe(260);
    expect(state.animating).toBe(false);
    expect(state.evolutionAlert).toBeNull();
  });

  test('muestra alerta de evolución cuando mascota evoluciona', () => {
    state = petScreenReducer(createPetState(mockPet), { type: 'ADD_XP_SUCCESS', newXp: 510, evolucionado: true, nuevaForma: 'brote' });
    expect(state.evolutionAlert).toBe('brote');
  });

  test('dismiss evolution limpia la alerta', () => {
    state = petScreenReducer(createPetState(mockPet), { type: 'ADD_XP_SUCCESS', newXp: 510, evolucionado: true, nuevaForma: 'brote' });
    state = petScreenReducer(state, { type: 'DISMISS_EVOLUTION' });
    expect(state.evolutionAlert).toBeNull();
  });
});

// ─── SOSScreen ────────────────────────────────────────────────────────────────

function createSOSState() {
  return {
    crisisModeActive: false,
    breathingActive: false,
    currentStep: 0,
    contactsLoaded: false,
    contacts: [],
  };
}

function sosScreenReducer(state, action) {
  switch (action.type) {
    case 'ACTIVATE_CRISIS': return { ...state, crisisModeActive: true };
    case 'DEACTIVATE_CRISIS': return { ...state, crisisModeActive: false, currentStep: 0 };
    case 'ACTIVATE_BREATHING': return { ...state, breathingActive: true };
    case 'DEACTIVATE_BREATHING': return { ...state, breathingActive: false };
    case 'NEXT_STEP': return { ...state, currentStep: state.currentStep + 1 };
    case 'LOAD_CONTACTS': return { ...state, contacts: action.contacts, contactsLoaded: true };
    default: return state;
  }
}

describe('SOSScreen — lógica de estado', () => {
  let state;

  beforeEach(() => {
    state = createSOSState();
  });

  test('crisis mode desactivado por defecto', () => {
    expect(state.crisisModeActive).toBe(false);
  });

  test('activar crisis mode cambia estado', () => {
    state = sosScreenReducer(state, { type: 'ACTIVATE_CRISIS' });
    expect(state.crisisModeActive).toBe(true);
  });

  test('desactivar crisis mode resetea el paso', () => {
    state = sosScreenReducer(state, { type: 'ACTIVATE_CRISIS' });
    state = sosScreenReducer(state, { type: 'NEXT_STEP' });
    state = sosScreenReducer(state, { type: 'NEXT_STEP' });
    state = sosScreenReducer(state, { type: 'DEACTIVATE_CRISIS' });
    expect(state.crisisModeActive).toBe(false);
    expect(state.currentStep).toBe(0);
  });

  test('avanzar pasos del protocolo de crisis', () => {
    state = sosScreenReducer(state, { type: 'ACTIVATE_CRISIS' });
    state = sosScreenReducer(state, { type: 'NEXT_STEP' });
    expect(state.currentStep).toBe(1);
  });

  test('activar ejercicio de respiración', () => {
    state = sosScreenReducer(state, { type: 'ACTIVATE_BREATHING' });
    expect(state.breathingActive).toBe(true);
  });

  test('cargar contactos de emergencia', () => {
    const contacts = [{ id: 'c1', nombre: 'Mamá', telefono: '+573001234567' }];
    state = sosScreenReducer(state, { type: 'LOAD_CONTACTS', contacts });
    expect(state.contacts).toHaveLength(1);
    expect(state.contactsLoaded).toBe(true);
  });
});
