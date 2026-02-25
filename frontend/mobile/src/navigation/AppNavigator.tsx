import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen1 from '../modules/onboarding/screens/SplashScreen1';
import SplashScreen2 from '../modules/onboarding/screens/SplashScreen2';
import OnboardingScreen from '../modules/onboarding/screens/OnboardingScreen';
import WelcomeScreen from '../modules/auth/screens/WelcomeScreen';
import LoginScreen from '../modules/auth/screens/LoginScreen';
import RegisterScreen from '../modules/auth/screens/RegisterScreen';
import StoryScreen from '../modules/auth/screens/StoryScreen';
import Step1_Apodo from '../modules/auth/screens/additionalData/Step1_Apodo';
import Step2_Pronombres from '../modules/auth/screens/additionalData/Step2_Pronombres';
import Step3_UltimoConsumo from '../modules/auth/screens/additionalData/Step3_UltimoConsumo';
import Step4_Motivo from '../modules/auth/screens/additionalData/Step4_Motivo';
import Step5_Dinero from '../modules/auth/screens/additionalData/Step5_Dinero';
import Step6_Telefono from '../modules/auth/screens/additionalData/Step6_Telefono';
import Step7_LugaresRiesgo from '../modules/auth/screens/additionalData/Step7_LugaresRiesgo';
import Step9_Privacidad from '../modules/auth/screens/additionalData/Step9_Privacidad';
import Step10_Horario from '../modules/auth/screens/additionalData/Step10_Horario';
import Step8_PuntosDebiles from '../modules/auth/screens/additionalData/Step8_PuntosDebiles';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash1" component={SplashScreen1} />
        <Stack.Screen name="Splash2" component={SplashScreen2} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Story" component={StoryScreen} />
        <Stack.Screen name="Step1" component={Step1_Apodo} />
        <Stack.Screen name="Step2" component={Step2_Pronombres} />
        <Stack.Screen name="Step3" component={Step3_UltimoConsumo} />
        <Stack.Screen name="Step4" component={Step4_Motivo} />
        <Stack.Screen name="Step5" component={Step5_Dinero} />
        <Stack.Screen name="Step6" component={Step6_Telefono} />
        <Stack.Screen name="Step7" component={Step7_LugaresRiesgo} />
        <Stack.Screen name="Step9" component={Step9_Privacidad} />
        <Stack.Screen name="Step10" component={Step10_Horario} />
        <Stack.Screen name="Step8" component={Step8_PuntosDebiles} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}