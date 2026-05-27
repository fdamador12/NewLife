import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { analytics, EVENT_TYPES } from './src/services/analytics';
import { cacheService } from './src/services/cacheService';
import { CACHE_KEYS } from './src/services/cacheKeys';
import { setupNotificationHandler } from './src/services/setupNotifications';
import { registerPushToken } from './src/services/pushNotifications';

export default function App() {
  useEffect(() => {
    cacheService.warmUp([CACHE_KEYS.PROFILE]);
    analytics.track(EVENT_TYPES.APP_OPENED);
    setupNotificationHandler();

    // Registrar push token despues de 2s para dar tiempo a que el auth
    // este listo. Si no hay JWT, el backend devuelve 401 y se ignora.
    const timeout = setTimeout(() => {
      registerPushToken().catch(() => {});
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}