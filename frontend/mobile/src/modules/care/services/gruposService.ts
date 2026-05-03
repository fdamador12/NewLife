import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5181';

export interface Grupo {
  grupo_id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  lugar: string;
  email?: string;
  sitio_web?: string;
  instagram?: string;
  facebook?: string;
  telefonos?: string[];
  whatsapp?: string[];
  comunidad_url?: string;
  logo_url?: string;
}

export interface GruposResponse {
  data: Grupo[];
}

export const gruposService = {
  async getGrupos(): Promise<Grupo[]> {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${BASE_URL}/care/grupos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GruposResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching grupos:', error);
      throw error;
    }
  },
};