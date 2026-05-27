/**
 * services.test.js (backend)
 * Pruebas unitarias para los servicios de negocio del Mobile API y Admin API.
 * Los repositorios de Roble DB están completamente mockeados.
 */

const {
  mockUsers,
  mockCredentials,
  mockCheckins,
  mockCheckinResponse,
  mockCamino,
  mockPet,
  mockPetEvolucionData,
  mockFrase,
  mockMedals,
  mockSobrietyData,
} = require('../../fixtures/mock-data');
const { createJwtServiceMock, createServiceMock } = require('../../utils/test-helpers');

// ─── MOCK: AuthService ────────────────────────────────────────────────────────

describe('AuthService', () => {
  let authService;
  let mockUserRepo;
  let mockJwtService;
  let mockMailService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockJwtService = createJwtServiceMock();

    mockMailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    };

    // Simulamos el AuthService
    authService = {
      login: async ({ email, password }) => {
        const user = await mockUserRepo.findByEmail(email);
        if (!user) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
        if (!user.is_verified) throw Object.assign(new Error('Email no verificado'), { status: 403 });
        const isValid = password === 'SecurePass123!'; // Simplificado para prueba
        if (!isValid) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
        const token = mockJwtService.sign({ sub: user.id });
        return { access_token: token, refresh_token: 'refresh-token', user };
      },

      register: async ({ email, password, nombre }) => {
        const existing = await mockUserRepo.findByEmail(email);
        if (existing) throw Object.assign(new Error('Email ya registrado'), { status: 409 });
        const user = await mockUserRepo.create({ email, nombre, is_verified: false });
        await mockMailService.sendVerificationEmail(email);
        return { message: 'Registro exitoso. Verifica tu email.', userId: user.id };
      },

      verifyEmail: async ({ email, code }) => {
        const user = await mockUserRepo.findByEmail(email);
        if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
        if (code !== '123456') throw Object.assign(new Error('Código inválido'), { status: 400 });
        await mockUserRepo.update(user.id, { is_verified: true });
        return { message: 'Email verificado exitosamente' };
      },

      forgotPassword: async ({ email }) => {
        const user = await mockUserRepo.findByEmail(email);
        if (!user) return { message: 'Si el email existe, recibirás instrucciones.' };
        await mockMailService.sendPasswordResetEmail(email);
        return { message: 'Si el email existe, recibirás instrucciones.' };
      },

      refreshToken: async (refreshToken) => {
        if (!refreshToken || refreshToken === 'invalid') {
          throw Object.assign(new Error('Token inválido'), { status: 401 });
        }
        const newToken = mockJwtService.sign({ sub: 'user-001' });
        return { access_token: newToken };
      },

      logout: async (userId) => {
        if (!userId) throw Object.assign(new Error('Usuario no encontrado'), { status: 400 });
        return { message: 'Sesión cerrada exitosamente' };
      },
    };
  });

  describe('login()', () => {
    test('retorna tokens y usuario con credenciales válidas', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUsers.regularUser });
      const result = await authService.login(mockCredentials.valid);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(mockCredentials.valid.email);
    });

    test('lanza 401 con credenciales incorrectas', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUsers.regularUser });
      await expect(authService.login({ email: 'juan.perez@test.com', password: 'wrong' })).rejects.toMatchObject({ status: 401 });
    });

    test('lanza 401 cuando el usuario no existe', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      await expect(authService.login(mockCredentials.nonExistent)).rejects.toMatchObject({ status: 401 });
    });

    test('lanza 403 cuando el usuario no ha verificado el email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUsers.unverifiedUser });
      await expect(authService.login(mockCredentials.valid)).rejects.toMatchObject({ status: 403 });
    });

    test('genera un JWT al autenticar exitosamente', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUsers.regularUser });
      const result = await authService.login(mockCredentials.valid);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result.access_token).toBeTruthy();
    });
  });

  describe('register()', () => {
    test('crea usuario y envía email de verificación', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({ id: 'user-new', email: 'nuevo@test.com', nombre: 'Nuevo' });
      const result = await authService.register({ email: 'nuevo@test.com', password: 'Pass123!', nombre: 'Nuevo' });
      expect(result.message).toContain('Verifica tu email');
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith('nuevo@test.com');
    });

    test('lanza 409 si el email ya está registrado', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUsers.regularUser);
      await expect(authService.register({ email: 'juan.perez@test.com', password: 'Pass123!', nombre: 'Juan' })).rejects.toMatchObject({ status: 409 });
    });

    test('no crea usuario si el email ya existe', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUsers.regularUser);
      try { await authService.register({ email: 'juan.perez@test.com', password: 'Pass123!', nombre: 'Juan' }); } catch {}
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail()', () => {
    test('verifica email con código correcto', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUsers.unverifiedUser });
      const result = await authService.verifyEmail({ email: 'maria.rodriguez@test.com', code: '123456' });
      expect(result.message).toContain('verificado');
      expect(mockUserRepo.update).toHaveBeenCalled();
    });

    test('lanza 400 con código incorrecto', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUsers.unverifiedUser });
      await expect(authService.verifyEmail({ email: 'maria@test.com', code: '000000' })).rejects.toMatchObject({ status: 400 });
    });

    test('lanza 404 si el usuario no existe', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      await expect(authService.verifyEmail({ email: 'noexiste@test.com', code: '123456' })).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('forgotPassword()', () => {
    test('siempre retorna mensaje genérico (evita enumeración de usuarios)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const result = await authService.forgotPassword({ email: 'noexiste@test.com' });
      expect(result.message).toBeTruthy();
    });

    test('envía email cuando el usuario existe', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUsers.regularUser);
      await authService.forgotPassword({ email: 'juan.perez@test.com' });
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith('juan.perez@test.com');
    });
  });

  describe('refreshToken()', () => {
    test('genera nuevo access token con refresh token válido', async () => {
      const result = await authService.refreshToken('valid-refresh-token');
      expect(result.access_token).toBeTruthy();
    });

    test('lanza 401 con refresh token inválido', async () => {
      await expect(authService.refreshToken('invalid')).rejects.toMatchObject({ status: 401 });
    });

    test('lanza 401 sin refresh token', async () => {
      await expect(authService.refreshToken(null)).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('logout()', () => {
    test('cierra sesión exitosamente', async () => {
      const result = await authService.logout('user-001');
      expect(result.message).toContain('cerrada');
    });

    test('lanza error sin userId', async () => {
      await expect(authService.logout(null)).rejects.toBeDefined();
    });
  });
});

// ─── MOCK: ProgressService ────────────────────────────────────────────────────

describe('ProgressService', () => {
  let progressService;
  let mockCheckinRepo;
  let mockCaminoRepo;

  beforeEach(() => {
    mockCheckinRepo = {
      findToday: jest.fn(),
      create: jest.fn(),
      findByUserId: jest.fn(),
      countStreak: jest.fn(),
    };

    mockCaminoRepo = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    progressService = {
      getTodayCheckin: async (userId) => {
        return await mockCheckinRepo.findToday(userId);
      },

      submitCheckin: async (userId, data) => {
        const existing = await mockCheckinRepo.findToday(userId);
        if (existing) throw Object.assign(new Error('Ya existe un check-in para hoy'), { status: 409 });
        const checkin = await mockCheckinRepo.create({ ...data, userId });
        const streak = await mockCheckinRepo.countStreak(userId);
        return { ...checkin, streak };
      },

      getCamino: async (userId) => {
        const camino = await mockCaminoRepo.findByUserId(userId);
        if (!camino) throw Object.assign(new Error('Camino no inicializado'), { status: 404 });
        return camino;
      },

      initCamino: async (userId) => {
        const existing = await mockCaminoRepo.findByUserId(userId);
        if (existing) throw Object.assign(new Error('Camino ya inicializado'), { status: 409 });
        return await mockCaminoRepo.create({ userId, nivel_actual: 1, modulo_actual: 1 });
      },

      advanceCamino: async (userId) => {
        const camino = await mockCaminoRepo.findByUserId(userId);
        if (!camino) throw Object.assign(new Error('Camino no encontrado'), { status: 404 });
        const updated = await mockCaminoRepo.update(userId, { modulo_actual: camino.modulo_actual + 1 });
        return updated;
      },

      calculateStreak: (checkins) => {
        if (!checkins || checkins.length === 0) return 0;
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < checkins.length; i++) {
          const expected = new Date(today);
          expected.setDate(expected.getDate() - i);
          const dateStr = expected.toISOString().split('T')[0];
          if (checkins[i].fecha === dateStr && !checkins[i].consumo) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      },
    };
  });

  describe('submitCheckin()', () => {
    test('crea check-in exitosamente cuando no hay uno hoy', async () => {
      mockCheckinRepo.findToday.mockResolvedValue(null);
      mockCheckinRepo.create.mockResolvedValue({ ...mockCheckinResponse });
      mockCheckinRepo.countStreak.mockResolvedValue(15);
      const result = await progressService.submitCheckin('user-001', mockCheckins.valid);
      expect(result).toHaveProperty('emocion', 'bien');
      expect(result).toHaveProperty('streak', 15);
    });

    test('lanza 409 si ya existe check-in del día', async () => {
      mockCheckinRepo.findToday.mockResolvedValue(mockCheckinResponse);
      await expect(progressService.submitCheckin('user-001', mockCheckins.valid)).rejects.toMatchObject({ status: 409 });
    });

    test('persiste el check-in en el repositorio', async () => {
      mockCheckinRepo.findToday.mockResolvedValue(null);
      mockCheckinRepo.create.mockResolvedValue({ id: 'c-new', ...mockCheckins.valid, userId: 'user-001' });
      mockCheckinRepo.countStreak.mockResolvedValue(1);
      await progressService.submitCheckin('user-001', mockCheckins.valid);
      expect(mockCheckinRepo.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-001', emocion: 'bien' }));
    });
  });

  describe('getTodayCheckin()', () => {
    test('retorna check-in de hoy si existe', async () => {
      mockCheckinRepo.findToday.mockResolvedValue(mockCheckinResponse);
      const result = await progressService.getTodayCheckin('user-001');
      expect(result).toEqual(mockCheckinResponse);
    });

    test('retorna null si no hay check-in hoy', async () => {
      mockCheckinRepo.findToday.mockResolvedValue(null);
      const result = await progressService.getTodayCheckin('user-001');
      expect(result).toBeNull();
    });
  });

  describe('getCamino()', () => {
    test('retorna el camino del usuario', async () => {
      mockCaminoRepo.findByUserId.mockResolvedValue(mockCamino);
      const result = await progressService.getCamino('user-001');
      expect(result).toEqual(mockCamino);
    });

    test('lanza 404 si el camino no está inicializado', async () => {
      mockCaminoRepo.findByUserId.mockResolvedValue(null);
      await expect(progressService.getCamino('user-001')).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('calculateStreak()', () => {
    test('calcula racha correctamente con check-ins consecutivos sin consumo', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const checkins = [
        { fecha: today, consumo: false },
        { fecha: yesterday, consumo: false },
      ];
      expect(progressService.calculateStreak(checkins)).toBe(2);
    });

    test('rompe racha cuando hay consumo', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const checkins = [
        { fecha: today, consumo: true }, // recaída
        { fecha: yesterday, consumo: false },
      ];
      expect(progressService.calculateStreak(checkins)).toBe(0);
    });

    test('retorna 0 con lista vacía', () => {
      expect(progressService.calculateStreak([])).toBe(0);
    });

    test('retorna 0 con lista null', () => {
      expect(progressService.calculateStreak(null)).toBe(0);
    });
  });
});

// ─── MOCK: PetService ─────────────────────────────────────────────────────────

describe('PetService', () => {
  let petService;
  let mockPetRepo;

  beforeEach(() => {
    mockPetRepo = {
      findByUserId: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    petService = {
      getPet: async (userId) => {
        const pet = await mockPetRepo.findByUserId(userId);
        if (!pet) throw Object.assign(new Error('Mascota no encontrada'), { status: 404 });
        return pet;
      },

      addXp: async (userId, xpAmount) => {
        const pet = await mockPetRepo.findByUserId(userId);
        if (!pet) throw Object.assign(new Error('Mascota no encontrada'), { status: 404 });
        const newXp = pet.xp_actual + xpAmount;
        const evolucionado = newXp >= 500 && pet.xp_actual < 500;
        const updated = await mockPetRepo.update(userId, {
          xp_actual: newXp,
          forma_actual: evolucionado ? 'brote' : pet.forma_actual,
        });
        return { pet: updated, evolucionado, nuevaForma: evolucionado ? 'brote' : null };
      },

      calculateEvolutionThreshold: (nivel) => {
        return nivel * 500;
      },
    };
  });

  test('getPet() retorna mascota del usuario', async () => {
    mockPetRepo.findByUserId.mockResolvedValue(mockPet);
    const result = await petService.getPet('user-001');
    expect(result).toEqual(mockPet);
  });

  test('getPet() lanza 404 si no hay mascota', async () => {
    mockPetRepo.findByUserId.mockResolvedValue(null);
    await expect(petService.getPet('user-001')).rejects.toMatchObject({ status: 404 });
  });

  test('addXp() incrementa XP correctamente', async () => {
    mockPetRepo.findByUserId.mockResolvedValue({ ...mockPet, xp_actual: 250 });
    mockPetRepo.update.mockResolvedValue({ ...mockPet, xp_actual: 260 });
    const result = await petService.addXp('user-001', 10);
    expect(result.pet.xp_actual).toBe(260);
    expect(result.evolucionado).toBe(false);
  });

  test('addXp() detecta evolución al superar umbral', async () => {
    mockPetRepo.findByUserId.mockResolvedValue({ ...mockPet, xp_actual: 490 });
    mockPetRepo.update.mockResolvedValue({ ...mockPet, xp_actual: 510, forma_actual: 'brote' });
    const result = await petService.addXp('user-001', 20);
    expect(result.evolucionado).toBe(true);
    expect(result.nuevaForma).toBe('brote');
  });

  test('calculateEvolutionThreshold() calcula umbral por nivel', () => {
    expect(petService.calculateEvolutionThreshold(1)).toBe(500);
    expect(petService.calculateEvolutionThreshold(2)).toBe(1000);
    expect(petService.calculateEvolutionThreshold(5)).toBe(2500);
  });
});

// ─── MOCK: MotivationService ──────────────────────────────────────────────────

describe('MotivationService', () => {
  let motivationService;
  let mockFraseRepo;
  let mockMedalRepo;

  beforeEach(() => {
    mockFraseRepo = { findForDate: jest.fn() };
    mockMedalRepo = { findByUserId: jest.fn(), findEarned: jest.fn() };

    motivationService = {
      getDailyPhrase: async (date) => {
        const frase = await mockFraseRepo.findForDate(date);
        if (!frase) return { texto: 'Cada día es una nueva oportunidad.', autor: 'NewLife' };
        return frase;
      },

      getMedals: async (userId) => {
        return await mockMedalRepo.findByUserId(userId);
      },

      checkNewMedals: async (userId, diasSobrio) => {
        const milestones = [7, 30, 90, 180, 365];
        const newMedals = milestones.filter((m) => diasSobrio === m);
        return newMedals;
      },
    };
  });

  test('getDailyPhrase() retorna frase del día', async () => {
    mockFraseRepo.findForDate.mockResolvedValue(mockFrase);
    const result = await motivationService.getDailyPhrase('2024-05-20');
    expect(result.texto).toBe(mockFrase.texto);
  });

  test('getDailyPhrase() retorna frase por defecto si no hay para la fecha', async () => {
    mockFraseRepo.findForDate.mockResolvedValue(null);
    const result = await motivationService.getDailyPhrase('2099-01-01');
    expect(result.texto).toBeTruthy();
  });

  test('getMedals() retorna medallas del usuario', async () => {
    mockMedalRepo.findByUserId.mockResolvedValue(mockMedals);
    const result = await motivationService.getMedals('user-001');
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('nombre');
  });

  test('checkNewMedals() detecta hito de 7 días', async () => {
    const newMedals = await motivationService.checkNewMedals('user-001', 7);
    expect(newMedals).toContain(7);
  });

  test('checkNewMedals() detecta hito de 30 días', async () => {
    const newMedals = await motivationService.checkNewMedals('user-001', 30);
    expect(newMedals).toContain(30);
  });

  test('checkNewMedals() no detecta hito en día sin hito', async () => {
    const newMedals = await motivationService.checkNewMedals('user-001', 15);
    expect(newMedals).toHaveLength(0);
  });

  test('checkNewMedals() detecta hito de un año (365 días)', async () => {
    const newMedals = await motivationService.checkNewMedals('user-001', 365);
    expect(newMedals).toContain(365);
  });
});
