import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { hasCompletedOnboardingSlides } from '../services/onboarding-storage';
import { getOnboardingStatus } from '../services/authService';
import {
  isGuestMode,
  getGuestOnboardingStatus,
  isGuestTourCompleted,
  hasGuestCompletedProfile,
} from '../services/guestService';
import { syncNotificationsOnLogin } from '../services/notificationSync';

export default function LoaderScreen({ navigation }: any) {
  useEffect(() => {
    const resolveNavigation = async () => {
      try {
        // ── 1. Onboarding informativo (3 slides) ───────────────────
        const completedSlides = await hasCompletedOnboardingSlides();

        if (!completedSlides) {
          navigation.replace('Onboarding');
          return;
        }

        // ── 2. Usuario autenticado ────────────────────────────────
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          try {
            // Validamos sesion contra backend. Si la cuenta fue eliminada
            // o los tokens son invalidos, esto lanza 401.
            const status = await getOnboardingStatus();

            if (!status.completed) {
              navigation.replace('Story');
              return;
            }

            // 🔔 Sincronizar notificaciones locales con la preferencia del usuario.
            // Fire-and-forget: no bloquea la navegacion si falla.
            syncNotificationsOnLogin().catch((err) => {
              console.log('⚠️ No se pudieron sincronizar notificaciones:', err);
            });

            const email = await AsyncStorage.getItem('userEmail');
            const tourCompleted = await AsyncStorage.getItem(`tourCompleted_${email}`);

            navigation.replace(tourCompleted === 'true' ? 'Home' : 'AppTour');
            return;
          } catch (err: any) {
            // FIX CRITICO: si la validacion de sesion falla, NO mandar a Home.
            //
            // Antes este catch hacia navigation.replace('Home'), lo cual
            // causaba que cuentas eliminadas o con tokens corruptos entraran
            // igual al Home con un usuario fantasma que no existe en backend.
            console.warn(
              '⚠️ Sesion invalida o cuenta eliminada, limpiando tokens y redirigiendo a Welcome',
              err?.response?.status,
            );

            await AsyncStorage.multiRemove([
              'accessToken',
              'refreshToken',
              'userEmail',
            ]);

            navigation.replace('Welcome');
            return;
          }
        }

        // ── 3. Modo invitado ─────────────────────────────────────
        const guest = await isGuestMode();

        if (guest) {
          // Validar si el guest ya completo Story
          const completedProfile = await hasGuestCompletedProfile();

          if (!completedProfile) {
            navigation.replace('Story');
            return;
          }

          // Guest completo Story → ir al Tour o Home
          const tourCompleted = await isGuestTourCompleted();
          navigation.replace(tourCompleted ? 'Home' : 'AppTour');
          return;
        }

        // ── 4. Sin sesion ────────────────────────────────────────
        navigation.replace('Welcome');

      } catch (error) {
        console.error('LoaderScreen error:', error);
        navigation.replace('Welcome');
      }
    };

    resolveNavigation();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}