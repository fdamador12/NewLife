import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import RootNavigator from './src/navigation/RootNavigator';
import { analytics, EVENT_TYPES } from './src/services/analytics';

export default function App() {
  useEffect(() => {
    // Trackea la apertura de la app (cold start).
    // Si el usuario no está logueado, el service silenciosamente no hace nada.
    analytics.track(EVENT_TYPES.APP_OPENED);
  }, []);

  return <RootNavigator />;
}