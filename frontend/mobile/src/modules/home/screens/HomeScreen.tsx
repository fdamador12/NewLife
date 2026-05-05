import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { colors, fontSizes, spacing } from '../../../constants/theme';
import { getProfile, getSobrietyTime, getHomeSummary } from '../../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authEventEmitter } from '../../../services/api';
import {
  isGuestMode,
  clearGuestData,
  getGuestProfile,
  getGuestSobrietyTime,
} from '../../../services/guestService';
import SobrietyCard from './components/SobrietyCard';
import SavingsCard from './components/SavingsCard';
import GuestBanner from './components/GuestBanner';
import PetWidget from '../../pet/components/PetWidget';

export default function HomeScreen({ navigation }: any) {
  const [apodo, setApodo] = useState('');
  const [sobriety, setSobriety] = useState({ dias: 0, horas: 0, minutos: 0 });
  const [gastoSemanal, setGastoSemanal] = useState(0);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkGuest = async () => {
      const guest = await isGuestMode();
      setIsGuest(guest);
    };
    checkGuest();
  }, []);

  useEffect(() => {
    const unsubscribe = authEventEmitter.on(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    });
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const guest = await isGuestMode();
        if (guest) {
          const profile = await getGuestProfile();
          setApodo(profile.apodo || '');
        } else {
          const profile = await getProfile();
          setApodo(profile.apodo);
        }
      } catch (e) {
        console.log('Error obteniendo perfil:', e);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSobriety = async () => {
      try {
        const guest = await isGuestMode();
        if (guest) {
          const data = await getGuestSobrietyTime();
          setSobriety(data.contador);
        } else {
          const data = await getSobrietyTime();
          setSobriety(data.contador);
        }
      } catch (e) {
        console.log('Error obteniendo sobriedad:', e);
      }
    };

    fetchSobriety();

    const interval = setInterval(() => {
      setSobriety(prev => {
        let { dias, horas, minutos } = prev;
        minutos += 1;
        if (minutos >= 60) { minutos = 0; horas += 1; }
        if (horas >= 24) { horas = 0; dias += 1; }
        return { dias, horas, minutos };
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchGastoSemanal = async () => {
      try {
        const guest = await isGuestMode();
        if (!guest) {
          const data = await getHomeSummary();
          setGastoSemanal(data.gasto_semanal || 0);
        }
      } catch (e) {
        console.log('Error obteniendo gasto semanal:', e);
      }
    };
    fetchGastoSemanal();
  }, []);

  const handleLogout = async () => {
    try {
      if (isGuest) {
        await clearGuestData();
      } else {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userEmail']);
      }
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (e) {
      console.log('Error cerrando sesión:', e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header saludo */}
        <Text style={styles.greeting}>¡Hola {apodo ? apodo : ''}!</Text>

        {/* Mascota */}
        <PetWidget onPress={() => navigation.navigate('PetScreen')} />

        {/* Lo que has logrado */}
        <Text style={styles.sectionTitle}>Lo que has logrado</Text>
        <SobrietyCard
          dias={sobriety.dias}
          horas={sobriety.horas}
          minutos={sobriety.minutos}
        />

        {/* Dinero ahorrado */}
        {!isGuest && (
          <>
            <Text style={styles.sectionTitle}>Dinero ahorrado</Text>
            <SavingsCard gastoSemanal={gastoSemanal} />
          </>
        )}

        {/* Banner invitado o cerrar sesión */}
        {isGuest ? (
          <GuestBanner
            onCreateAccount={() => navigation.navigate('Register')}
            onLogout={handleLogout}
          />
        ) : (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* SOS fijo abajo */}
      <View style={styles.sosWrapper}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => navigation.navigate('SOS')}
          activeOpacity={0.85}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xxl,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  greeting: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSizes.md,
  },
  sosWrapper: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  sosButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 50,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    elevation: 120,
    shadowColor: '#FF9AA2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
  sosText: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 3,
  },
});