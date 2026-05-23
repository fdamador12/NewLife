import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { hasCompletedOnboardingSlides } from '../services/onboarding-storage';
import { getOnboardingStatus, migrateGuestToUser } from '../services/authService';
import {
  isGuestMode,
  isGuestTourCompleted,
  hasGuestCompletedProfile,
  getPendingMigration,
} from '../services/guestService';

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
            const status = await getOnboardingStatus();

            if (!status.completed) {
              navigation.replace('Story');
              return;
            }

            // ✅ Verificar si hay migración pendiente y reintentar
            const pendingMigration = await getPendingMigration();
            if (pendingMigration) {
              console.log('🔄 Reintentando migración pendiente...');
              try {
                await migrateGuestToUser();
                console.log('✅ Migración pendiente completada');
              } catch (err) {
                console.log('⚠️ Migración pendiente falló de nuevo — se reintentará');
              }
            }

            const email = await AsyncStorage.getItem('userEmail');
            const tourCompleted = await AsyncStorage.getItem(`tourCompleted_${email}`);
            navigation.replace(tourCompleted === 'true' ? 'Home' : 'AppTour');
          } catch {
            navigation.replace('Home');
          }
          return;
        }

        // ── 3. Modo invitado ─────────────────────────────────────
        const guest = await isGuestMode();
        if (guest) {
          const completedProfile = await hasGuestCompletedProfile();
          if (!completedProfile) {
            navigation.replace('Story');
            return;
          }
          const tourCompleted = await isGuestTourCompleted();
          navigation.replace(tourCompleted ? 'Home' : 'AppTour');
          return;
        }

        // ── 4. Sin sesión ────────────────────────────────────────
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