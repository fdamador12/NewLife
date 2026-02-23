import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen1 from '../modules/onboarding/screens/SplashScreen1';
import SplashScreen2 from '../modules/onboarding/screens/SplashScreen2';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash1" component={SplashScreen1} />
        <Stack.Screen name="Splash2" component={SplashScreen2} />
        {/* Aquí irán las demás pantallas después */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}