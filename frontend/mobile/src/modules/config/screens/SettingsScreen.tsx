import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getProfile, logoutUser, requestPasswordChange, migrateGuestToUser } from '../../../services/authService';
import { usePet } from '../../pet/hooks/usePet';
import { useToast } from '../../../feedback/ToastContext';
import { useConfirm } from '../../../feedback/ConfirmContext';
import InfoAccordion from '../components/InfoAccordion';
import SettingsRow from '../components/SettingsRow';
import NotificationSettingsCard from '../components/NotificationSettingsCard';
import { analytics, EVENT_TYPES } from '../../../services/analytics';
import { isGuestMode, clearGuestData, getGuestProfile, getPendingMigration } from '../../../services/guestService';
import { cancelAllLocalNotifications } from '../../../services/notificationSync';

export default function SettingsScreen({ navigation }: any) {
  const { showToast } = useToast();
  const { resetPet } = usePet();
  const { showConfirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isPendingMigration, setIsPendingMigration] = useState(false);
  const [apodo, setApodo] = useState('');
  const [pronombre, setPronombre] = useState('');
  const [motivoSobrio, setMotivoSobrio] = useState('');
  const [gastoSemanal, setGastoSemanal] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const guest = await isGuestMode();
        setIsGuest(guest);

        if (guest) {
          const data = await getGuestProfile();
          setApodo(data?.apodo || '');
          setPronombre(data?.pronombre || '');
          setMotivoSobrio(data?.motivo_sobrio || '');
          setGastoSemanal(
            data?.gasto_semana?.toString() ||
            data?.gasto_semanal?.toString() ||
            ''
          );
        } else {
          // Usuario logueado: verificar migracion pendiente
          const pending = await getPendingMigration();
          setIsPendingMigration(pending);

          const data = await getProfile();
          setApodo(data?.apodo || '');
          setPronombre(data?.pronombre || '');
          setMotivoSobrio(data?.motivo_sobrio || '');
          setGastoSemanal(data?.gasto_semanal?.toString() || '');
        }
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

      // 🔔 Cancelar TODAS las notificaciones locales antes de cerrar sesion.
      // Razon: si el usuario cierra sesion y otro usuario entra en el mismo
      // dispositivo, no queremos que sigan llegando notificaciones del usuario
      // anterior. Las del nuevo usuario se reagendaran en su proximo login.
      await cancelAllLocalNotifications();

      resetPet();
      if (guest) {
        await clearGuestData();
      } else {
        await logoutUser();
      }
      analytics.reset();
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (e) {
      console.log('Error cerrando sesión:', e);
    }
  };

  const handleDeleteGuestData = () => {
    showConfirm({
      title: 'Borrar todos mis datos',
      message: 'Esta acción es permanente. Se borrarán todos tus registros, progreso, mascota y configuración. No podrás recuperarlos.',
      confirmText: 'Borrar todo',
      cancelText: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          // 🔔 Cancelar notificaciones del guest tambien
          await cancelAllLocalNotifications();
          resetPet();
          await clearGuestData();
          analytics.reset();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        } catch (e) {
          console.log('Error borrando datos guest:', e);
        }
      },
    });
  };

  const handleRetryMigration = async () => {
    try {
      showToast('Sincronizando tus datos...', 'info');
      await migrateGuestToUser();
      setIsPendingMigration(false);
      showToast('¡Datos sincronizados correctamente!', 'success');
    } catch (e) {
      showToast('No se pudo sincronizar. Intenta de nuevo más tarde.', 'error');
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
          readOnly={false}
          onUpdated={(data) => {
            setApodo(data.apodo);
            setPronombre(data.pronombre);
            setMotivoSobrio(data.motivoSobrio);
            setGastoSemanal(data.gastoSemanal);
          }}
        />

        <View style={styles.gap} />

        {/* Notificaciones - solo para usuarios registrados (no guest) */}
        {!isGuest && (
          <>
            <NotificationSettingsCard />
            <View style={styles.gap} />
          </>
        )}

        <SettingsRow
          icon="shield"
          label="Políticas de privacidad"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />

        <View style={styles.gap} />

        {isGuest ? (
          // Guest: crear cuenta y migrar
          <SettingsRow
            icon="upload"
            label="Crear cuenta y guardar progreso"
            onPress={() => navigation.navigate('Register')}
          />
        ) : isPendingMigration ? (
          // Usuario logueado con migracion pendiente
          <SettingsRow
            icon="refresh-cw"
            label="Sincronizar datos pendientes"
            onPress={handleRetryMigration}
          />
        ) : (
          // Usuario normal: cambiar contrasena y eliminar cuenta
          <>
            <SettingsRow
              icon="lock"
              label="Cambiar contraseña"
              onPress={async () => {
                try {
                  await requestPasswordChange();
                  showToast('Te enviamos un enlace a tu correo para cambiar la contraseña', 'success');
                } catch {
                  showToast('No se pudo enviar el correo. Intenta de nuevo.', 'error');
                }
              }}
            />
            <View style={styles.gap} />
            <SettingsRow
              icon="trash-2"
              label="Eliminar cuenta"
              onPress={() => navigation.navigate('DeleteAccount')}
              danger
            />
          </>
        )}

        <View style={styles.gap} />

        {isGuest ? (
          // Guest: borrar todos los datos
          <TouchableOpacity
            style={styles.deleteGuestButton}
            onPress={handleDeleteGuestData}
            activeOpacity={0.8}
          >
            <Feather name="trash-2" size={20} color="#FF6B6B" />
            <Text style={styles.deleteGuestText}>Borrar todos mis datos</Text>
          </TouchableOpacity>
        ) : (
          // Usuario normal: cerrar sesion
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}

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
  deleteGuestButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: '#FFF5F5', padding: spacing.md,
    borderRadius: 12, borderWidth: 1, borderColor: '#FFCCCC',
  },
  deleteGuestText: { color: '#FF6B6B', fontWeight: '700', fontSize: fontSizes.md },
});