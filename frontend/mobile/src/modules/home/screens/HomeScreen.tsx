import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { Animated } from 'react-native';
import { getProfile, getSobrietyTime, getHomeSummary } from '../../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { authEventEmitter } from '../../../services/api';
import {
  isGuestMode,
  clearGuestData,
  getGuestProfile,
  getGuestSobrietyTime,
} from '../../../services/guestService';

const { width } = Dimensions.get('window');
const RING_SIZE = 72;

type RingProps = {
  value: number;
  label: string;
  max: number;
};

function Ring({ value, label, max }: RingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progress = value / max;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const size = RING_SIZE;
  const strokeWidth = 5;

  return (
    <View style={styles.ringWrapper}>
      <View style={{ width: size, height: size }}>
        <View style={[styles.ringTrack, { width: size, height: size, borderRadius: size / 2 }]} />
        <Animated.View
          style={[
            styles.ringFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: '#00BCD4',
              transform: [
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-90deg', '270deg'],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.ringCenter}>
          <Text style={styles.ringValue}>{value}</Text>
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

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

  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.bubbleWrapper}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleTitle}>¡Hola {apodo ? apodo : '...'}!</Text>
              <Text style={styles.bubbleSubtitle}>¡Haz clic en mi!</Text>
            </View>
            <View style={styles.bubbleTail} />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Plant')} activeOpacity={0.8}>
            <Image
              source={require('../../../assets/images/character_home.png')}
              style={styles.character}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Lo que has logrado */}
        <Text style={styles.sectionTitle}>Lo que has logrado</Text>
        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>Has estado sobrio:</Text>
          <View style={styles.ringsRow}>
            <Ring value={sobriety.dias} label="Días" max={30} />
            <Ring value={sobriety.horas} label="Horas" max={24} />
            <Ring value={sobriety.minutos} label="Mins" max={60} />
          </View>
        </View>

        {/* Dinero ahorrado */}
        <Text style={styles.sectionTitle}>Dinero ahorrado</Text>
        <View style={styles.card}>
          <View style={styles.moneyRow}>
            <View style={styles.moneyIcon}>
              <Icon name="dollar-sign" size={22} color="#F5A623" />
            </View>
            <View>
              <Text style={styles.moneyAmount}>${gastoSemanal.toLocaleString()}</Text>
              <Text style={styles.moneySub}>Ahorro semanal promedio</Text>
            </View>
          </View>
        </View>

        {/* Botón crear cuenta — solo invitados */}
        {isGuest && (
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginBottom: 12, alignItems: 'center' }}
            onPress={handleCreateAccount}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: fontSizes.md }}>
              Crear cuenta y guardar progreso
            </Text>
          </TouchableOpacity>
        )}

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={{ backgroundColor: '#FF6B6B', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center' }}
          onPress={handleLogout}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: fontSizes.md }}>
            {isGuest ? 'Salir' : 'Cerrar sesión'}
          </Text>
        </TouchableOpacity>

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  bubble: {
    backgroundColor: '#D38A58',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D38A58',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bubbleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  bubbleSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
  },
  bubbleTail: {
    width: 16,
    height: 16,
    backgroundColor: '#D38A58',
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#D38A58',
    transform: [{ rotate: '45deg' }],
    marginLeft: -10,
  },
  character: {
    width: 140,
    height: 140,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardSubtitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ringWrapper: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  ringTrack: {
    position: 'absolute',
    borderWidth: 5,
    borderColor: '#E8F4F8',
  },
  ringFill: {
    position: 'absolute',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringCenter: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  ringLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 4,
    borderColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  moneyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyAmount: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  moneySub: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  sosWrapper: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  sosButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: borderRadius.full,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.md * 2,
    borderTopRightRadius: borderRadius.md * 2,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  modalIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionText: { flex: 1 },
  modalOptionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  modalOptionSub: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  modalCancelText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
});