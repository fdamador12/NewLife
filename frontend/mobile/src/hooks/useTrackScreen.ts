import { useEffect, useRef } from 'react';
import { analytics } from '../services/analytics';

/**
 * Hook que automáticamente trackea la vista de una pantalla.
 *
 * Diseño:
 * - Se llama en el cuerpo del componente Screen
 * - Trackea `screen_viewed` UNA SOLA VEZ al montarse (no en cada re-render)
 * - Acepta `screenName` para identificar la pantalla
 *
 * Uso típico:
 * ```typescript
 * export default function ContentScreen() {
 *   useTrackScreen('ContentScreen');
 *   // ... resto del componente
 * }
 * ```
 *
 * Para casos donde el nombre de la pantalla cambia dinámicamente (ej: detalle
 * de un contenido específico), pasa el dependency array:
 * ```typescript
 * useTrackScreen(`ArticleScreen:${article.id}`, [article.id]);
 * ```
 *
 * NOTE: este hook NO usa el `previous_screen` automáticamente porque eso
 * requeriría integración con react-navigation. Si en el futuro lo quieren,
 * se puede agregar usando el listener `state` de NavigationContainer.
 */
export function useTrackScreen(screenName: string, deps: any[] = []): void {
  // Usamos un ref para asegurar que solo se trackea una vez por instancia
  // de la pantalla, incluso si React monta/desmonta en strict mode (dev).
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    analytics.trackScreen(screenName);

    // Reset al desmontar para que si la pantalla vuelve a montarse, se trackee
    return () => {
      hasTrackedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenName, ...deps]);
}