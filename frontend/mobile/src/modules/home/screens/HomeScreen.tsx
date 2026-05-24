import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getProfile, getSobrietyTime, getHomeSummary, logoutUser } from '../../../services/authService';
import { useCacheQuery } from '../../../hooks/useCacheQuery';
import { CACHE_KEYS } from '../../../services/cacheKeys';
import { authEventEmitter } from '../../../services/api';
import {
  isGuestMode,
  clearGuestData,
  getGuestProfile,
  getGuestSobrietyTime,
  getGuestAhorro,
} from '../../../services/guestService';
import SobrietyCard from './components/SobrietyCard';
import SavingsCard from './components/SavingsCard';
import PetWidget from '../../pet/components/PetWidget';
import { usePet } from '../../pet/hooks/usePet';
import { getAhorro } from '../../../services/progressService';
import { analytics, EVENT_TYPES } from '../../../services/analytics';
import { useBottomInset } from '../../../hooks/useBottomInset';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }: any) {
  const [sobriety, setSobriety] = useState({ dias: 0, horas: 0, minutos: 0 });
  const [ahorro, setAhorro] = useState({ ahorro_total: 0, dias_limpios: 0 });
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [guestApodo, setGuestApodo] = useState('');
  const { resetPet, fetchPet } = usePet();
  const bottomInset = useBottomInset(spacing.xl);
  const insets = useSafeAreaInsets();
  const hasNavBar = insets.bottom >= 48;

  const { data: userProfile } = useCacheQuery(
    CACHE_KEYS.PROFILE,
    30,
    getProfile,
    { enabled: isGuest === false },
  );

  const apodo = isGuest === true ? guestApodo : (userProfile?.apodo ?? '');

  useEffect(() => { fetchPet(); }, []);

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
    let cancelled = false;
    (async () => {
      try {
        const guest = await isGuestMode();
        if (cancelled) return;
        setIsGuest(guest);
        if (guest) {
          const profile = await getGuestProfile();
          if (!cancelled) setGuestApodo(profile.apodo || '');
        }
      } catch (e) {
        console.log('Error verificando modo invitado:', e);
      }
    })();
    return () => { cancelled = true; };
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
    const unsubscribeFocus = navigation.addListener('focus', fetchSobriety);
    const interval = setInterval(() => {
      setSobriety(prev => {
        let { dias, horas, minutos } = prev;
        minutos += 1;
        if (minutos >= 60) { minutos = 0; horas += 1; }
        if (horas >= 24) { horas = 0; dias += 1; }
        return { dias, horas, minutos };
      });
    }, 60000);

    return () => {
      clearInterval(interval);
      unsubscribeFocus();
    };
  }, [navigation]);

  useEffect(() => {
    const fetchAhorro = async () => {
      try {
        const guest = await isGuestMode();
        if (guest) {
          const data = await getGuestAhorro();
          setAhorro({ ahorro_total: data.ahorro_total ?? 0, dias_limpios: data.dias_limpios ?? 0 });
        } else {
          const data = await getAhorro();
          setAhorro({ ahorro_total: data.ahorro_total ?? 0, dias_limpios: data.dias_limpios ?? 0 });
        }
      } catch (e) {
        console.log('Error obteniendo ahorro:', e);
      }
    };

    fetchAhorro();
    const unsubscribeFocus = navigation.addListener('focus', fetchAhorro);
    return () => { unsubscribeFocus(); };
  }, [navigation]);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias,';
    if (hour < 19) return 'Buenas tardes,';
    return 'Buenas noches,';
  };

  const handleSosPress = () => {
    analytics.track(EVENT_TYPES.SOS_TRIGGERED, { source: 'home_button' });
    navigation.navigate('SOS');
  };

  // ✅ Con 3 botones: SOS más compacto y spacer ajustado
  // Sin 3 botones: SOS normal, spacer normal
  const SOS_PADDING_BOTTOM = hasNavBar ? bottomInset + -30 : bottomInset + 0;
  const SPACER_HEIGHT = hasNavBar ? 80 : 120;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingTime}>{getGreetingTime()}</Text>
            <Text style={styles.greeting}>{apodo ? apodo : 'Amig@'}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Feather name="settings" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Mascota */}
        <PetWidget onPress={() => navigation.navigate('PetScreen')} />

        {/* Sobriedad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu progreso</Text>
          <SobrietyCard
            dias={sobriety.dias}
            horas={sobriety.horas}
            minutos={sobriety.minutos}
          />
        </View>

        {/* Ahorro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dinero ahorrado</Text>
          <SavingsCard
            ahorroTotal={ahorro.ahorro_total}
            diasLimpios={ahorro.dias_limpios}
            onPress={() => navigation.navigate('SavingsScreen')}
          />
        </View>

        <View style={{ height: SPACER_HEIGHT }} />
      </ScrollView>

      {/* SOS flotante */}
      <View style={[styles.sosWrapper, { paddingBottom: SOS_PADDING_BOTTOM }]}>
        <TouchableOpacity
          style={[styles.sosButton, hasNavBar && styles.sosButtonCompact]}
          onPress={handleSosPress}
          activeOpacity={0.85}
        >
          <View style={styles.sosInner}>
            <View style={[styles.sosIconContainer, hasNavBar && styles.sosIconContainerCompact]}>
              <Feather name="phone" size={hasNavBar ? 16 : 20} color={colors.white} />
            </View>
            <Text style={[styles.sosTitle, hasNavBar && styles.sosTitleCompact]}>SOS</Text>
          </View>
          <View style={[styles.sosArrow, hasNavBar && styles.sosArrowCompact]}>
            <Feather name="chevron-right" size={hasNavBar ? 18 : 24} color="rgba(255,255,255,0.8)" />
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
    paddingTop: 56,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    gap: 1,
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
    gap: 4,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  sosWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
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
  sosButtonCompact: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
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
  sosIconContainerCompact: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  sosTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  sosTitleCompact: {
    fontSize: fontSizes.md,
  },
  sosArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosArrowCompact: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
});