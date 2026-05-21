/**
 * external-services.test.js
 * Pruebas de integración con servicios externos: Roble DB, MinIO y Socket.io.
 */

const { createRobleClientMock } = require('../fixtures/test-database');
const { mockUsers, mockContent } = require('../fixtures/mock-data');

// ─── Roble DB (vía API REST) ─────────────────────────────────────────────────

describe('Servicio Externo: Roble DB', () => {
  let robleClient;
  let robleService;

  beforeEach(() => {
    robleClient = createRobleClientMock();

    robleService = {
      async findUserById(userId) {
        try {
          const response = await robleClient.get(`/users/${userId}`);
          if (response.status === 404) return null;
          return response.data;
        } catch {
          throw new Error('Error al conectar con Roble DB');
        }
      },

      async createUser(userData) {
        const response = await robleClient.post('/users', userData);
        return response.data;
      },

      async updateUser(userId, updates) {
        const response = await robleClient.put(`/users/${userId}`, updates);
        return response.data;
      },

      async deleteUser(userId) {
        await robleClient.delete(`/users/${userId}`);
        return true;
      },
    };
  });

  test('findUserById retorna usuario existente', async () => {
    robleClient.get.mockResolvedValueOnce({ data: mockUsers.regularUser, status: 200 });
    const user = await robleService.findUserById('user-001');
    expect(user).toEqual(mockUsers.regularUser);
    expect(robleClient.get).toHaveBeenCalledWith('/users/user-001');
  });

  test('findUserById retorna null para usuario inexistente', async () => {
    robleClient.get.mockResolvedValueOnce({ data: null, status: 404 });
    const user = await robleService.findUserById('nonexistent');
    expect(user).toBeNull();
  });

  test('createUser persiste datos en Roble DB', async () => {
    const newUser = { email: 'nuevo@test.com', nombre: 'Nuevo' };
    robleClient.post.mockResolvedValueOnce({ data: { ...newUser, id: 'new-id' }, status: 201 });
    const created = await robleService.createUser(newUser);
    expect(created.id).toBe('new-id');
    expect(robleClient.post).toHaveBeenCalledWith('/users', newUser);
  });

  test('propaga error cuando Roble DB no está disponible', async () => {
    robleClient.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(robleService.findUserById('user-001')).rejects.toThrow('Error al conectar con Roble DB');
  });

  test('updateUser llama al endpoint correcto', async () => {
    robleClient.put.mockResolvedValueOnce({ data: { ...mockUsers.regularUser, nombre: 'Actualizado' }, status: 200 });
    await robleService.updateUser('user-001', { nombre: 'Actualizado' });
    expect(robleClient.put).toHaveBeenCalledWith('/users/user-001', { nombre: 'Actualizado' });
  });
});

// ─── MinIO (Almacenamiento de Objetos) ────────────────────────────────────────

describe('Servicio Externo: MinIO', () => {
  let minioClient;
  let mediaService;

  beforeEach(() => {
    minioClient = {
      putObject: jest.fn().mockResolvedValue({ etag: 'abc123', versionId: null }),
      getObject: jest.fn(),
      removeObject: jest.fn().mockResolvedValue(undefined),
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn().mockResolvedValue(undefined),
      setBucketPolicy: jest.fn().mockResolvedValue(undefined),
    };

    const PUBLIC_ENDPOINT = 'http://localhost:5183';
    const BUCKET = 'newlife-public';

    mediaService = {
      async uploadImage(file, filename) {
        const exists = await minioClient.bucketExists(BUCKET);
        if (!exists) throw new Error('Bucket no encontrado');
        await minioClient.putObject(BUCKET, filename, file.buffer, {
          'Content-Type': file.mimetype,
        });
        return `${PUBLIC_ENDPOINT}/${BUCKET}/${filename}`;
      },

      async deleteFile(filename) {
        await minioClient.removeObject(BUCKET, filename);
        return true;
      },

      async ensureBucketExists() {
        const exists = await minioClient.bucketExists(BUCKET);
        if (!exists) {
          await minioClient.makeBucket(BUCKET);
          await minioClient.setBucketPolicy(BUCKET, JSON.stringify({ public: true }));
        }
        return true;
      },

      generatePublicUrl(filename) {
        return `${PUBLIC_ENDPOINT}/${BUCKET}/${filename}`;
      },
    };
  });

  test('sube imagen y retorna URL pública', async () => {
    const file = { buffer: Buffer.from('image-data'), mimetype: 'image/jpeg', size: 1024 };
    const url = await mediaService.uploadImage(file, 'test-image.jpg');
    expect(url).toContain('test-image.jpg');
    expect(url).toContain('newlife-public');
    expect(minioClient.putObject).toHaveBeenCalled();
  });

  test('elimina archivo correctamente', async () => {
    await mediaService.deleteFile('old-image.jpg');
    expect(minioClient.removeObject).toHaveBeenCalledWith('newlife-public', 'old-image.jpg');
  });

  test('falla si el bucket no existe', async () => {
    minioClient.bucketExists.mockResolvedValueOnce(false);
    const file = { buffer: Buffer.from('data'), mimetype: 'image/jpeg', size: 1024 };
    await expect(mediaService.uploadImage(file, 'test.jpg')).rejects.toThrow('Bucket no encontrado');
  });

  test('ensureBucketExists crea bucket si no existe', async () => {
    minioClient.bucketExists.mockResolvedValueOnce(false);
    await mediaService.ensureBucketExists();
    expect(minioClient.makeBucket).toHaveBeenCalled();
    expect(minioClient.setBucketPolicy).toHaveBeenCalled();
  });

  test('ensureBucketExists no crea bucket si ya existe', async () => {
    await mediaService.ensureBucketExists();
    expect(minioClient.makeBucket).not.toHaveBeenCalled();
  });

  test('generatePublicUrl retorna URL correcta', () => {
    const url = mediaService.generatePublicUrl('articles/image.jpg');
    expect(url).toBe('http://localhost:5183/newlife-public/articles/image.jpg');
  });
});

// ─── Socket.io (Chat en Tiempo Real) ─────────────────────────────────────────

describe('Servicio Externo: Socket.io (Chat)', () => {
  let socketService;
  let mockSocket;
  let events;

  beforeEach(() => {
    events = [];
    mockSocket = {
      id: 'socket-001',
      connected: true,
      rooms: new Set(),
      emit: jest.fn((event, data) => events.push({ type: 'emit', event, data })),
      on: jest.fn(),
      join: jest.fn((room) => mockSocket.rooms.add(room)),
      leave: jest.fn((room) => mockSocket.rooms.delete(room)),
      disconnect: jest.fn(() => { mockSocket.connected = false; }),
    };

    socketService = {
      async connect(userId) {
        mockSocket.join(`user-${userId}`);
        return { connected: true, socketId: mockSocket.id };
      },

      async joinCommunity(communityId) {
        mockSocket.join(`community-${communityId}`);
        return { joined: true };
      },

      async sendMessage(roomId, message) {
        if (!mockSocket.connected) throw new Error('Socket no conectado');
        mockSocket.emit('message', { room: roomId, ...message });
        return { sent: true, messageId: `msg-${Date.now()}` };
      },

      async leaveCommunity(communityId) {
        mockSocket.leave(`community-${communityId}`);
        return { left: true };
      },

      async disconnect() {
        mockSocket.disconnect();
        return { disconnected: true };
      },

      isInRoom: (room) => mockSocket.rooms.has(room),
    };
  });

  test('conecta y une al usuario a su sala personal', async () => {
    const result = await socketService.connect('user-001');
    expect(result.connected).toBe(true);
    expect(socketService.isInRoom('user-user-001')).toBe(true);
  });

  test('une al usuario a sala de comunidad', async () => {
    await socketService.connect('user-001');
    await socketService.joinCommunity('community-001');
    expect(socketService.isInRoom('community-community-001')).toBe(true);
  });

  test('envía mensaje a sala de comunidad', async () => {
    await socketService.connect('user-001');
    const msg = { texto: 'Hola a todos!', userId: 'user-001' };
    const result = await socketService.sendMessage('community-001', msg);
    expect(result.sent).toBe(true);
    expect(mockSocket.emit).toHaveBeenCalledWith('message', expect.objectContaining({ texto: 'Hola a todos!' }));
  });

  test('abandona sala de comunidad', async () => {
    await socketService.connect('user-001');
    await socketService.joinCommunity('community-001');
    await socketService.leaveCommunity('community-001');
    expect(socketService.isInRoom('community-community-001')).toBe(false);
  });

  test('falla al enviar mensaje si socket está desconectado', async () => {
    await socketService.disconnect();
    await expect(socketService.sendMessage('room-001', { texto: 'Test' })).rejects.toThrow('Socket no conectado');
  });

  test('desconexión limpia el estado del socket', async () => {
    await socketService.connect('user-001');
    await socketService.disconnect();
    expect(mockSocket.connected).toBe(false);
  });
});
