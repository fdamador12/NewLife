import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getProfile, getSobrietyTime, getHomeSummary, getProfileSync, logoutUser } from '../../../services/authService';
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
import { usePet } from '../../pet/hooks/usePet';
import { getAhorro } from '../../../services/progressService';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

export default function HomeScreen({ navigation }: any) {
  const [apodo, setApodo] = useState(() => getProfileSync()?.apodo || '');
  const [sobriety, setSobriety] = useState({ dias: 0, horas: 0, minutos: 0 });
  const [ahorro, setAhorro] = useState({ ahorro_total: 0, dias_limpios: 0 });
  const [isGuest, setIsGuest] = useState(false);
  const { resetPet, fetchPet } = usePet();

  useEffect(() => {
    fetchPet();
  }, []);

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
    const fetchAhorro = async () => {
      try {
        const guest = await isGuestMode();
        if (!guest) {
          const data = await getAhorro();
          setAhorro({
            ahorro_total: data.ahorro_total ?? 0,
            dias_limpios: data.dias_limpios ?? 0,
          });
        }
      } catch (e) {
        console.log('Error obteniendo ahorro:', e);
      }
    };
    fetchAhorro();
  }, []);

  const handleLogout = async () => {
    try {
      // 📊 Analytics: AWAITEAMOS el track antes de borrar el token.
      // Si no lo awaitamos, multiRemove borraría el token mientras el track
      // está leyéndolo y el evento se perdería silenciosamente.
      // El track NUNCA rechaza la Promise (todos los errores son atrapados internamente),
      // así que es seguro awaitarlo sin riesgo.
      if (!isGuest) {
        await analytics.track(EVENT_TYPES.USER_LOGGED_OUT);
      }

      resetPet();
      if (isGuest) {
        await clearGuestData();
      } else {
        await logoutUser();
      }

      // 📊 Analytics: limpiar la sesión para que el próximo usuario tenga session_id nuevo
      analytics.reset();

      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (e) {
      console.log('Error cerrando sesion:', e);
    }
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias,';
    if (hour < 19) return 'Buenas tardes,';
    return 'Buenas noches,';
  };

  // 📊 Analytics: trackear el SOS y luego navegar
  const handleSosPress = () => {
    analytics.track(EVENT_TYPES.SOS_TRIGGERED, { source: 'home_button' });
    navigation.navigate('SOS');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header mejorado */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingTime}>{getGreetingTime()}</Text>
            <Text style={styles.greeting}>
              {apodo ? apodo : 'Amigo'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Feather name="settings" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Pet Widget */}
        <PetWidget onPress={() => navigation.navigate('PetScreen')} />

        {/* Seccion de logros */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tu progreso</Text>
          </View>
          <SobrietyCard
            dias={sobriety.dias}
            horas={sobriety.horas}
            minutos={sobriety.minutos}
          />
        </View>

        {/* Seccion de ahorro */}
        {!isGuest && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dinero ahorrado</Text>
            </View>
            <SavingsCard
              ahorroTotal={ahorro.ahorro_total}
              diasLimpios={ahorro.dias_limpios}
              onPress={() => navigation.navigate('SavingsScreen')}
            />
          </View>
        )}

        {/* Banner de invitado o logout */}
        {isGuest ? (
          <GuestBanner
            onCreateAccount={() => navigation.navigate('Register')}
            onLogout={handleLogout}
          />
        ) : (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#443e3e" />
            <Text style={styles.logoutText}>Cerrar sesion</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Boton SOS flotante mejorado */}
      <View style={styles.sosWrapper}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSosPress}
          activeOpacity={0.85}
        >
          <View style={styles.sosInner}>
            <View style={styles.sosIconContainer}>
              <Feather name="phone" size={20} color={colors.white} />
            </View>
            <View style={styles.sosTextContainer}>
              <Text style={styles.sosTitle}>SOS</Text>
            </View>
          </View>
          <View style={styles.sosArrow}>
            <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.8)" />
          </View>
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
    padding: spacing.xl,
    paddingTop: 60,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    gap: 2,
  },
  greetingTime: {
    fontSize: fontSizes.lg,
    color: colors.textMuted,
    fontWeight: '500',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  wave: {
    fontSize: 26,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fdfdfd',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#a5a2a2',
  },
  logoutText: {
    color: '#443e3e',
    fontWeight: '600',
    fontSize: fontSizes.md,
  },
  sosWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: 'transparent',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  sosInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sosIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTextContainer: {
    gap: 2,
  },
  sosTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  sosSubtitle: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  sosArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});