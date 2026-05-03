import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5181';

// Event emitter para notificar sesión expirada
type Listener = () => void;
export const authEventEmitter = {
  listeners: new Set<Listener>(),
  emit() { this.listeners.forEach((l) => l()); },
  on(l: Listener): () => void {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  },
};

const api = axios.create({
  baseURL: BASE_URL,
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function resolveQueue(newToken: string) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

// REQUEST INTERCEPTOR
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No hay refresh token');

      const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
      const newAccessToken: string = data.accessToken;

      await AsyncStorage.setItem('accessToken', newAccessToken);
      resolveQueue(newAccessToken);

      console.log('✅ Token refrescado correctamente');

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      authEventEmitter.emit();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;