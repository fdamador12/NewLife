import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api, { authEventEmitter } from './api';

/**
 * Servicio de manejo de imagenes desde mobile.
 *
 * IMPORTANTE — POR QUE NO USAMOS AXIOS PARA UPLOADS:
 * Axios + FormData en React Native tiene problemas con el Content-Type.
 * Usamos fetch nativo que maneja FormData correctamente.
 *
 * IMPORTANTE — RETRY AUTOMATICO:
 * 1. Si falla con "Network request failed" (TCP frio en Android),
 *    reintentamos hasta 3 veces con delay.
 * 2. Si falla con 401 (token expirado), refrescamos el token con
 *    el refresh-token y reintentamos UNA vez.
 *
 * Asi el usuario nunca ve errores transitorios — todo es transparente.
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

const getBaseURL = (): string => {
  return (api.defaults.baseURL || '').replace(/\/$/, '');
};

const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('accessToken');
};

const inferFileMeta = (uri: string): { type: string; name: string } => {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png'))  return { type: 'image/png',  name: 'image.png' };
  if (lower.endsWith('.webp')) return { type: 'image/webp', name: 'image.webp' };
  return { type: 'image/jpeg', name: 'image.jpg' };
};

const sleep = (ms: number): Promise<void> => new Promise<void>((resolve) => {
  setTimeout(() => resolve(), ms);
});

/**
 * Refresca el access token usando el refresh token guardado.
 * Devuelve el nuevo token o null si fallo.
 *
 * Implementacion paralela al interceptor de axios para que fetch tambien
 * pueda recuperarse de 401.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn('[mediaService] no hay refreshToken');
      return null;
    }

    const baseURL = getBaseURL();
    const { data } = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
    const newAccessToken: string = data?.accessToken;

    if (!newAccessToken) {
      console.warn('[mediaService] refresh-token no devolvio accessToken');
      return null;
    }

    await AsyncStorage.setItem('accessToken', newAccessToken);
    console.log('[mediaService] ✅ Token refrescado correctamente');
    return newAccessToken;
  } catch (err: any) {
    console.error('[mediaService] no se pudo refrescar token:', err?.message);
    // Limpiar tokens y avisar a la app que la sesion expiro
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    authEventEmitter.emit();
    return null;
  }
};

/**
 * Ejecuta el upload con retry automatico.
 * Maneja dos tipos de error:
 *  - Network request failed → reintenta hasta 3 veces (TCP frio)
 *  - 401 → refresca token y reintenta una vez
 */
const uploadWithRetry = async (
  endpoint: 'upload-avatar' | 'upload',
  imageUri: string,
): Promise<string> => {
  let token = await getAuthToken();
  if (!token) {
    throw new Error('No hay sesion activa.');
  }

  const meta = inferFileMeta(imageUri);
  const url = `${getBaseURL()}/media/${endpoint}`;
  let alreadyRefreshed = false;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`[uploadWithRetry] attempt ${attempt}/${MAX_RETRIES} to ${url}`);

    // Crear FormData nuevo en cada intento (FormData no es reusable en RN)
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: meta.type,
      name: meta.name,
    } as any);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log(`[uploadWithRetry] attempt ${attempt} response status:`, response.status);

      // 401 → token expirado, refrescar y reintentar
      if (response.status === 401 && !alreadyRefreshed) {
        console.log('[uploadWithRetry] 401 recibido, intentando refresh de token...');
        const newToken = await refreshAccessToken();
        if (newToken) {
          token = newToken;
          alreadyRefreshed = true;
          // No incrementar el contador real — este intento "no cuenta"
          attempt--;
          continue;
        }
        // No se pudo refrescar — abortar
        throw new Error('Sesion expirada. Inicia sesion nuevamente.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        // Error del servidor — no reintentar
        throw new Error(`Upload fallo (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`[uploadWithRetry] attempt ${attempt} SUCCESS, url:`, data?.url);
      return data.url;
    } catch (err: any) {
      lastError = err;
      const message = err?.message || String(err);
      console.warn(`[uploadWithRetry] attempt ${attempt} failed:`, message);

      // Si es error de red, reintentar
      const isNetworkError = message.includes('Network request failed') ||
                             message.includes('Failed to fetch');

      if (!isNetworkError) {
        // Error real del servidor — no tiene caso reintentar
        throw err;
      }

      // Era error de red. Si quedan intentos, esperar y reintentar
      if (attempt < MAX_RETRIES) {
        console.log(`[uploadWithRetry] waiting ${RETRY_DELAY_MS}ms before retry...`);
        await sleep(RETRY_DELAY_MS);
        continue;
      }
    }
  }

  // Se agotaron los reintentos
  throw lastError || new Error('Upload fallo despues de varios intentos');
};

/**
 * Sube una imagen al endpoint /media/upload-avatar (con retry + refresh automatico).
 */
export const uploadAvatar = async (imageUri: string): Promise<string> => {
  console.log('[uploadAvatar] starting, uri:', imageUri);
  return uploadWithRetry('upload-avatar', imageUri);
};

/**
 * Sube una imagen al endpoint /media/upload (para posts de comunidad).
 */
export const uploadPostImage = async (imageUri: string): Promise<string> => {
  console.log('[uploadPostImage] starting, uri:', imageUri);
  return uploadWithRetry('upload', imageUri);
};

/**
 * Actualiza el campo avatar_url del usuario en la tabla `usuarios`.
 */
export const updateAvatarUrl = async (avatarUrl: string | null): Promise<void> => {
  console.log('[updateAvatarUrl] setting to:', avatarUrl);
  try {
    await api.patch('/user/avatar', { avatar_url: avatarUrl });
    console.log('[updateAvatarUrl] success');
  } catch (err: any) {
    console.error('[updateAvatarUrl] FAILED:', JSON.stringify({
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    }, null, 2));
    throw err;
  }
};

/**
 * Elimina el avatar del usuario.
 */
export const removeAvatar = async (): Promise<void> => {
  await api.patch('/user/avatar', { avatar_url: null });
};

/**
 * Flujo completo: sube imagen + actualiza perfil en una sola llamada.
 */
export const uploadAndSetAvatar = async (imageUri: string): Promise<string> => {
  const url = await uploadAvatar(imageUri);
  await updateAvatarUrl(url);
  return url;
};