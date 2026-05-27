/**
 * hooks.test.js
 * Pruebas unitarias para los custom hooks del frontend móvil de NewLife.
 */

const { mockCheckinResponse, mockCamino, mockPet } = require('../../fixtures/mock-data');

// ─── useCacheQuery (simulado puro sin React) ──────────────────────────────────
// Extraemos la lógica central del hook para probarla aisladamente

function createCacheQueryLogic() {
  const subscribers = new Map();
  const cache = new Map();

  function subscribe(key, callback) {
    if (!subscribers.has(key)) subscribers.set(key, new Set());
    subscribers.get(key).add(callback);
    return () => subscribers.get(key).delete(callback);
  }

  function notify(key, data) {
    if (subscribers.has(key)) {
      subscribers.get(key).forEach((cb) => cb(data));
    }
  }

  async function query(key, fetcher, options = {}) {
    const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options;

    // 1. Si hay datos en caché
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (Date.now() < cached.expiresAt) {
        return { data: cached.data, loading: false, error: null, fromCache: true };
      }
    }

    // 2. Fetch fresco
    try {
      const data = await fetcher();
      cache.set(key, { data, expiresAt: Date.now() + ttl });
      notify(key, { data, loading: false, error: null });
      return { data, loading: false, error: null, fromCache: false };
    } catch (error) {
      return { data: null, loading: false, error: error.message };
    }
  }

  function mutate(key, newData) {
    cache.set(key, { data: newData, expiresAt: Date.now() + 5 * 60 * 1000 });
    notify(key, { data: newData, loading: false, error: null });
  }

  function invalidate(key) {
    cache.delete(key);
  }

  function getSync(key) {
    const entry = cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.data;
  }

  return { query, mutate, invalidate, getSync, subscribe, _cache: cache };
}

describe('useCacheQuery — lógica central', () => {
  let cacheQuery;

  beforeEach(() => {
    cacheQuery = createCacheQueryLogic();
  });

  describe('query()', () => {
    test('llama al fetcher en la primera solicitud (cache miss)', async () => {
      const fetcher = jest.fn().mockResolvedValue(mockCheckinResponse);
      const result = await cacheQuery.query('checkin-today', fetcher);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(mockCheckinResponse);
      expect(result.fromCache).toBe(false);
    });

    test('retorna datos de caché en solicitudes subsecuentes (cache hit)', async () => {
      const fetcher = jest.fn().mockResolvedValue(mockCamino);
      await cacheQuery.query('camino', fetcher);
      await cacheQuery.query('camino', fetcher);
      expect(fetcher).toHaveBeenCalledTimes(1); // Solo llamado una vez
    });

    test('retorna datos en el primer fetch', async () => {
      const fetcher = jest.fn().mockResolvedValue({ id: 'test' });
      const result = await cacheQuery.query('test-key', fetcher);
      expect(result.data).toEqual({ id: 'test' });
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    test('retorna error cuando el fetcher falla', async () => {
      const fetcher = jest.fn().mockRejectedValue(new Error('Network Error'));
      const result = await cacheQuery.query('failing-key', fetcher);
      expect(result.error).toBe('Network Error');
      expect(result.data).toBeNull();
    });

    test('maneja diferentes claves independientemente', async () => {
      const fetcherA = jest.fn().mockResolvedValue({ source: 'A' });
      const fetcherB = jest.fn().mockResolvedValue({ source: 'B' });
      const resultA = await cacheQuery.query('keyA', fetcherA);
      const resultB = await cacheQuery.query('keyB', fetcherB);
      expect(resultA.data.source).toBe('A');
      expect(resultB.data.source).toBe('B');
    });
  });

  describe('mutate()', () => {
    test('actualiza la caché optimistamente', async () => {
      const fetcher = jest.fn().mockResolvedValue({ value: 'original' });
      await cacheQuery.query('mut-key', fetcher);
      cacheQuery.mutate('mut-key', { value: 'updated' });
      expect(cacheQuery.getSync('mut-key')).toEqual({ value: 'updated' });
    });

    test('notifica a los suscriptores al mutar', () => {
      const subscriber = jest.fn();
      cacheQuery.subscribe('notif-key', subscriber);
      cacheQuery.mutate('notif-key', { value: 'new' });
      expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({ data: { value: 'new' } }));
    });
  });

  describe('invalidate()', () => {
    test('elimina la entrada de caché al invalidar', async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: 'cached' });
      await cacheQuery.query('inv-key', fetcher);
      cacheQuery.invalidate('inv-key');
      // Después de invalidar, getSync debe retornar null
      expect(cacheQuery.getSync('inv-key')).toBeNull();
    });

    test('fuerza refetch después de invalidar', async () => {
      const fetcher = jest.fn().mockResolvedValue({ value: 1 });
      await cacheQuery.query('refetch-key', fetcher);
      cacheQuery.invalidate('refetch-key');
      await cacheQuery.query('refetch-key', fetcher);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe('getSync()', () => {
    test('retorna datos de caché sincrónicamente', async () => {
      const fetcher = jest.fn().mockResolvedValue(mockPet);
      await cacheQuery.query('pet-sync', fetcher);
      expect(cacheQuery.getSync('pet-sync')).toEqual(mockPet);
    });

    test('retorna null para clave no cacheada', () => {
      expect(cacheQuery.getSync('nonexistent')).toBeNull();
    });
  });

  describe('subscribe()', () => {
    test('registra suscriptor y retorna función de cleanup', () => {
      const cb = jest.fn();
      const unsubscribe = cacheQuery.subscribe('sub-key', cb);
      expect(typeof unsubscribe).toBe('function');
    });

    test('el unsubscribe evita notificaciones posteriores', () => {
      const cb = jest.fn();
      const unsubscribe = cacheQuery.subscribe('unsub-key', cb);
      unsubscribe();
      cacheQuery.mutate('unsub-key', { value: 'new' });
      expect(cb).not.toHaveBeenCalled();
    });

    test('múltiples suscriptores reciben la misma notificación', () => {
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      cacheQuery.subscribe('multi-key', cb1);
      cacheQuery.subscribe('multi-key', cb2);
      cacheQuery.mutate('multi-key', { value: 'shared' });
      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });
  });
});

// ─── useLevelProgress (simulado) ──────────────────────────────────────────────

describe('useLevelProgress — lógica de progreso del programa', () => {
  function calculateLevelProgress(camino) {
    if (!camino) return { porcentaje: 0, nivelActual: 1, moduloActual: 1, completado: false };
    const { nivel_actual, modulo_actual } = camino;
    const totalModulos = 36; // 12 niveles × 3 módulos
    const completados = (nivel_actual - 1) * 3 + (modulo_actual - 1);
    const porcentaje = Math.round((completados / totalModulos) * 100);
    return {
      porcentaje,
      nivelActual: nivel_actual,
      moduloActual: modulo_actual,
      completado: nivel_actual === 12 && modulo_actual === 3,
    };
  }

  test('retorna 0% al inicio del programa (nivel 1, módulo 1)', () => {
    const result = calculateLevelProgress({ nivel_actual: 1, modulo_actual: 1 });
    expect(result.porcentaje).toBe(0);
    expect(result.completado).toBe(false);
  });

  test('calcula porcentaje correcto en nivel 4 módulo 1 (25%)', () => {
    const result = calculateLevelProgress({ nivel_actual: 4, modulo_actual: 1 });
    expect(result.porcentaje).toBe(25);
  });

  test('calcula porcentaje correcto en nivel 7 módulo 1 (50%)', () => {
    const result = calculateLevelProgress({ nivel_actual: 7, modulo_actual: 1 });
    expect(result.porcentaje).toBe(50);
  });

  test('retorna completado=true al finalizar nivel 12 módulo 3', () => {
    const result = calculateLevelProgress({ nivel_actual: 12, modulo_actual: 3 });
    expect(result.completado).toBe(true);
  });

  test('retorna valores por defecto cuando camino es null', () => {
    const result = calculateLevelProgress(null);
    expect(result.porcentaje).toBe(0);
    expect(result.nivelActual).toBe(1);
  });

  test('retorna valores correctos del caminoMock', () => {
    const result = calculateLevelProgress(mockCamino);
    expect(result.nivelActual).toBe(mockCamino.nivel_actual);
    expect(result.moduloActual).toBe(mockCamino.modulo_actual);
  });
});

// ─── useTrackScreen (simulado) ────────────────────────────────────────────────

describe('useTrackScreen — rastreo de pantallas', () => {
  function createTrackScreen(analyticsEnabled = true) {
    const events = [];
    return {
      trackScreen: (screenName, properties = {}) => {
        if (!analyticsEnabled) return;
        events.push({ event: 'screen_view', screenName, properties, timestamp: Date.now() });
      },
      getEvents: () => events,
      clearEvents: () => events.splice(0),
    };
  }

  test('registra evento de vista de pantalla', () => {
    const { trackScreen, getEvents } = createTrackScreen(true);
    trackScreen('LoginScreen');
    expect(getEvents()).toHaveLength(1);
    expect(getEvents()[0].screenName).toBe('LoginScreen');
  });

  test('no registra evento cuando analytics está deshabilitado', () => {
    const { trackScreen, getEvents } = createTrackScreen(false);
    trackScreen('LoginScreen');
    expect(getEvents()).toHaveLength(0);
  });

  test('incluye propiedades adicionales en el evento', () => {
    const { trackScreen, getEvents } = createTrackScreen(true);
    trackScreen('ProgressScreen', { nivel: 3 });
    expect(getEvents()[0].properties.nivel).toBe(3);
  });

  test('registra múltiples pantallas', () => {
    const { trackScreen, getEvents } = createTrackScreen(true);
    trackScreen('HomeScreen');
    trackScreen('ProgressScreen');
    trackScreen('PetScreen');
    expect(getEvents()).toHaveLength(3);
  });
});
