import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../../../constants/theme';
import { getProfile } from '../../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePet } from '../../pet/hooks/usePet';
import { useToast } from '../../../feedback/ToastContext';
import InfoAccordion from '../components/InfoAccordion';
import SettingsRow from '../components/SettingsRow';
import { analytics, EVENT_TYPES } from '../../../services/analytics';
import { isGuestMode, clearGuestData } from '../../../services/guestService';

export default function SettingsScreen({ navigation }: any) {
  const { showToast } = useToast();
  const { resetPet } = usePet();
  const [loading, setLoading] = useState(true);
  const [apodo, setApodo] = useState('');
  const [pronombre, setPronombre] = useState('');
  const [motivoSobrio, setMotivoSobrio] = useState('');
  const [gastoSemanal, setGastoSemanal] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setApodo(data?.apodo || '');
        setPronombre(data?.pronombre || '');
        setMotivoSobrio(data?.motivo_sobrio || '');
        setGastoSemanal(data?.gasto_semanal?.toString() || '');
      } catch (e) {
        console.log('Error obteniendo perfil:', e);
        showToast('No se pudo cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const guest = await isGuestMode();
      if (!guest) {
        await analytics.track(EVENT_TYPES.USER_LOGGED_OUT);
      }
      resetPet();
      if (guest) {
        await clearGuestData();
      } else {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userEmail']);
      }
      analytics.reset();
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (e) {
      console.log('Error cerrando sesión:', e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <InfoAccordion
          apodo={apodo}
          pronombre={pronombre}
          motivoSobrio={motivoSobrio}
          gastoSemanal={gastoSemanal}
          onUpdated={(data) => {
            setApodo(data.apodo);
            setPronombre(data.pronombre);
            setMotivoSobrio(data.motivoSobrio);
            setGastoSemanal(data.gastoSemanal);
          }}
        />

        <View style={styles.gap} />

        <SettingsRow
          icon="shield"
          label="Políticas de privacidad"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />

        <View style={styles.gap} />

        <SettingsRow
          icon="trash-2"
          label="Eliminar cuenta"
          onPress={() => navigation.navigate('DeleteAccount')}
          danger
        />

        <View style={styles.gap} />

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl },
  gap: { height: spacing.md },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: '#FFF5F5', padding: spacing.md,
    borderRadius: 12, borderWidth: 1, borderColor: '#FFCCCC',
  },
  logoutText: { color: '#FF6B6B', fontWeight: '700', fontSize: fontSizes.md },
});