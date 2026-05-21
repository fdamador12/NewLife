import { useState, useEffect, useCallback } from 'react';
import {
  contentService,
  ContenidoFrontend,
  CategoriaBackend,
} from '../services/contentService';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

export const useContent = () => {
  const [contenido, setContenido] = useState<ContenidoFrontend[]>([]);
  const [categorias, setCategorias] = useState<CategoriaBackend[]>([]);
  const [favoritos, setFavoritos] = useState<ContenidoFrontend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CARGAR TODO EL CONTENIDO
  const fetchContenido = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.getContenido();
      setContenido(data);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo contenido');
      console.error('❌ Error fetchContenido:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CARGAR CATEGORÍAS
  const fetchCategorias = useCallback(async () => {
    try {
      const data = await contentService.getCategorias();
      setCategorias(data);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo categorías');
      console.error('❌ Error fetchCategorias:', err);
    }
  }, []);

  // ✅ CARGAR FAVORITOS
  const fetchFavoritos = useCallback(async () => {
    try {
      const data = await contentService.getFavoritos();
      setFavoritos(data);
    } catch (err: any) {
      setError(err.message || 'Error obteniendo favoritos');
      console.error('❌ Error fetchFavoritos:', err);
    }
  }, []);

  // ✅ TOGGLE FAVORITO
  const toggleFavorito = useCallback(
    async (contenidoId: string) => {
      try {
        setError(null);

        // Verificar si está en favoritos
        const isFavorite = contenido.some((c) => c.id === contenidoId && c.liked);

        if (isFavorite) {
          // Eliminar de favoritos
          setContenido((prev) =>
            prev.map((c) =>
              c.id === contenidoId ? { ...c, liked: false } : c
            )
          );
          setFavoritos((prev) => prev.filter((f) => f.id !== contenidoId));

          await contentService.removeFavorito(contenidoId);
        } else {
          // Agregar a favoritos
          setContenido((prev) =>
            prev.map((c) =>
              c.id === contenidoId ? { ...c, liked: true } : c
            )
          );

          const item = contenido.find((c) => c.id === contenidoId);
          if (item) {
            setFavoritos((prev) => [...prev, { ...item, liked: true }]);
          }

          await contentService.addFavorito(contenidoId);

          // 📊 Analytics: trackear solo cuando AGREGAN a favoritos (no cuando quitan).
          // Si quitar también es interesante, podemos agregar un evento aparte después.
          analytics.track(EVENT_TYPES.CONTENT_FAVORITED, {
            content_id: contenidoId,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Error al actualizar favorito');
        console.error('❌ Error toggleFavorito:', err);
        // Refetch para sincronizar
        await fetchContenido();
        await fetchFavoritos();
      }
    },
    [contenido, fetchContenido, fetchFavoritos]
  );

  // ✅ CARGAR AL MONTAR
  useEffect(() => {
    fetchContenido();
    fetchCategorias();
    fetchFavoritos();
  }, [fetchContenido, fetchCategorias, fetchFavoritos]);

  // ✅ AGRUPAR POR CATEGORÍA (OPTIMIZADO)
  const groupByCategory = useCallback((): Record<string, ContenidoFrontend[]> => {
    const grouped: Record<string, ContenidoFrontend[]> = {};

    // Primero agrupar por categoría real
    contenido.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // Ordenar cada grupo por fecha (más reciente primero)
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return grouped;
  }, [contenido]);

  // ✅ OBTENER MÁS LEÍDO (TOP 3)
  const getMostRead = useCallback((): ContenidoFrontend[] => {
    return contenido
      .sort((a, b) => b.vistas - a.vistas) // Ordenar por vistas descendente
      .slice(0, 3);
  }, [contenido]);

  // ✅ OBTENER ITEMS LIMITADOS POR CATEGORÍA
  const getItemsByCategory = useCallback(
    (categoryName: string, limit: number = 3): ContenidoFrontend[] => {
      const grouped = groupByCategory();
      return (grouped[categoryName] || []).slice(0, limit);
    },
    [groupByCategory]
  );

  return {
    contenido,
    categorias,
    favoritos,
    loading,
    error,
    fetchContenido,
    fetchCategorias,
    fetchFavoritos,
    toggleFavorito,
    groupByCategory,
    getMostRead,
    getItemsByCategory,
  };
};