import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { analytics, EVENT_TYPES } from './src/services/analytics';
import { cacheService } from './src/services/cacheService';
import { CACHE_KEYS } from './src/services/cacheKeys';
import { setupNotificationHandler } from './src/services/setupNotifications';

export default function App() {
  useEffect(() => {
    cacheService.warmUp([CACHE_KEYS.PROFILE]);
    analytics.track(EVENT_TYPES.APP_OPENED);
    setupNotificationHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}