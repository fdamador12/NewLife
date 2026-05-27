import Constants from 'expo-constants';

/**
 * Configura el handler global de notificaciones para que las notificaciones
 * se muestren como banner INCLUSO cuando la app esta abierta (foreground).
 *
 * Sin esto, las notificaciones solo se ven cuando la app esta en background
 * o cerrada. Con esto, se ven SIEMPRE — mejor UX para demos y testing.
 *
 * Llamar UNA VEZ al iniciar la app, desde App.tsx en un useEffect.
 * En Expo Go hace skip silencioso.
 */
export async function setupNotificationHandler(): Promise<void> {
  // Skip en Expo Go — expo-notifications no esta disponible
  if (Constants.executionEnvironment === 'storeClient') {
    return;
  }

  try {
    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        // Mostrar banner visible cuando app esta en foreground (Android/iOS)
        shouldShowBanner: true,
        // Mostrar en la lista de notificaciones del sistema
        shouldShowList: true,
        // Compatibilidad con expo-notifications versiones < SDK 51
        shouldShowAlert: true,
        // Sonido al recibir (respeta volumen del telefono)
        shouldPlaySound: true,
        // No incrementar contador del icono (no es chat)
        shouldSetBadge: false,
      }),
    });

    console.log('[Notifications] Handler global configurado');
  } catch (error: any) {
    console.log('[Notifications] No se pudo configurar handler:', error?.message);
  }
}