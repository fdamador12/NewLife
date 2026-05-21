import React from 'react';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  // ✅ SIEMPRE iniciar en Splash1
  return <AppNavigator initialRoute="Splash1" />;
}
