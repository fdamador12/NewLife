import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import {
  changeMemberAccess, suspendMember, requestBan, removeMember,
} from '../../../services/communityService';
import { apiError } from '../../../utils/apiError';

type Props = {
  visible: boolean;
  onClose: () => void;
  communityId: string;
  targetUser: { id: string; nombre: string } | null;
};

type SubModal = 'none' | 'access' | 'suspend' | 'ban';

const ACCESS_OPTIONS = [
  { key: 'SOLO_VER', label: 'Solo ver' },
  { key: 'POSTEAR_COMENTAR', label: 'Postear y comentar' },
  { key: 'CHAT_COMPLETO', label: 'Chat completo' },
] as const;

/**
 * Bottom sheet de acciones de moderacion.
 *
 * Diseño:
 *  - El sheet se ancla al borde inferior real de la pantalla.
 *  - paddingBottom usa safeAreaInsets.bottom para respetar barra de
 *    navegacion del sistema (home/back en Android) y home indicator (iOS).
 *  - Minimo 24px de paddingBottom para que los botones no peguen al borde.
 *  - Se cierra al tocar fuera del sheet.
 */
export default function ModerationActionsModal({ visible, onClose, communityId, targetUser }: Props) {
  const [sub, setSub] = useState<SubModal>('none');
  const [suspendDays, setSuspendDays] = useState('');
  const [banReason, setBanReason] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const reset = () => {
    setSub('none');
    setSuspendDays('');
    setBanReason('');
    setLoading(false);
  };

  const closeAll = () => { reset(); onClose(); };

  const handleAccessChange = async (tipoAcceso: string) => {
    if (!targetUser) return;
    setLoading(true);
    try {
      await changeMemberAccess(communityId, targetUser.id, tipoAcceso);
      closeAll();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo cambiar el acceso.'));
    } finally { setLoading(false); }
  };

  const handleSuspend = async () => {
    if (!targetUser) return;
    const dias = parseInt(suspendDays, 10);
    if (!dias || dias < 1) return;
    setLoading(true);
    try {
      await suspendMember(communityId, targetUser.id, dias);
      closeAll();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo suspender al usuario.'));
    } finally { setLoading(false); }
  };

  const handleBan = async () => {
    if (!targetUser || !banReason.trim()) return;
    setLoading(true);
    try {
      await requestBan(communityId, targetUser.id, banReason.trim());
      closeAll();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo solicitar el baneo.'));
    } finally { setLoading(false); }
  };

  const handleRemove = () => {
    if (!targetUser) return;
    Alert.alert(`Expulsar a ${targetUser.nombre}`, '¿Confirmas expulsarlo de la comunidad?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Expulsar', style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await removeMember(communityId, targetUser.id);
            closeAll();
          } catch (err: any) {
            Alert.alert('Error', apiError(err, 'No se pudo expulsar al usuario.'));
          } finally { setLoading(false); }
        },
      },
    ]);
  };

  if (!visible || !targetUser) return null;

  // Padding inferior: safe area + extra para botones home/back del sistema
  const sheetPaddingBottom = Math.max(insets.bottom + 16, 32);

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={closeAll}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeAll} />

        <View style={[styles.sheet, { paddingBottom: sheetPaddingBottom }]}>
          <View style={styles.handle} />

          {sub === 'none' && (
            <>
              <Text style={styles.title}>{targetUser.nombre}</Text>
              <Text style={styles.subtitle}>Acciones de moderación</Text>

              <TouchableOpacity style={styles.row} onPress={() => setSub('access')}>
                <Feather name="shield" size={20} color={colors.text} />
                <Text style={styles.rowText}>Cambiar tipo de acceso</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.row} onPress={() => setSub('suspend')}>
                <Feather name="clock" size={20} color={colors.text} />
                <Text style={styles.rowText}>Suspender usuario</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.row} onPress={() => setSub('ban')}>
                <Feather name="slash" size={20} color="#FF6B6B" />
                <Text style={[styles.rowText, styles.danger]}>Solicitar baneo</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleRemove}>
                <Feather name="user-x" size={20} color="#FF6B6B" />
                <Text style={[styles.rowText, styles.danger]}>Expulsar de la comunidad</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelRow} onPress={closeAll}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          )}

          {sub === 'access' && (
            <>
              <Text style={styles.title}>Tipo de acceso</Text>
              <Text style={styles.subtitle}>Nuevo acceso para {targetUser.nombre}</Text>

              {ACCESS_OPTIONS.map(({ key, label }) => (
                <TouchableOpacity key={key} style={styles.row} onPress={() => handleAccessChange(key)} disabled={loading}>
                  <Text style={styles.rowText}>{label}</Text>
                  {loading && <ActivityIndicator size="small" color={colors.primary} />}
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.cancelRow} onPress={() => setSub('none')}>
                <Text style={styles.cancelText}>Volver</Text>
              </TouchableOpacity>
            </>
          )}

          {sub === 'suspend' && (
            <>
              <Text style={styles.title}>Suspender usuario</Text>
              <Text style={styles.subtitle}>¿Cuántos días para {targetUser.nombre}?</Text>

              <TextInput
                style={styles.input}
                placeholder="Número de días (ej: 7)"
                placeholderTextColor={colors.textMuted}
                value={suspendDays} onChangeText={setSuspendDays}
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={[styles.confirmBtn, (!suspendDays.trim() || loading) && styles.disabledBtn]}
                onPress={handleSuspend}
                disabled={!suspendDays.trim() || loading}
              >
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.confirmBtnText}>Suspender</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelRow} onPress={() => setSub('none')}>
                <Text style={styles.cancelText}>Volver</Text>
              </TouchableOpacity>
            </>
          )}

          {sub === 'ban' && (
            <>
              <Text style={styles.title}>Solicitar baneo</Text>
              <Text style={styles.subtitle}>Motivo para banear a {targetUser.nombre}</Text>

              <TextInput
                style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Describe el motivo del baneo..."
                placeholderTextColor={colors.textMuted}
                value={banReason} onChangeText={setBanReason}
                multiline
              />

              <TouchableOpacity
                style={[styles.confirmBtn, (!banReason.trim() || loading) && styles.disabledBtn]}
                onPress={handleBan}
                disabled={!banReason.trim() || loading}
              >
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.confirmBtnText}>Solicitar baneo</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelRow} onPress={() => setSub('none')}>
                <Text style={styles.cancelText}>Volver</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Container ocupa toda la pantalla y ancla el sheet al borde inferior
  container: { flex: 1, justifyContent: 'flex-end' },
  // Overlay oscuro detras del sheet, cubre TODO incluyendo statusbar
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  // Sheet anclado al borde inferior REAL del telefono
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    // paddingBottom se setea inline con safeAreaInsets
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md,
  },
  title: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1, fontSize: fontSizes.md, color: colors.text },
  danger: { color: '#FF6B6B' },
  cancelRow: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  cancelText: { fontSize: fontSizes.md, color: colors.textMuted, fontWeight: '600' },
  input: {
    backgroundColor: colors.background, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSizes.sm, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
    marginVertical: spacing.sm,
  },
  confirmBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  disabledBtn: { opacity: 0.4 },
  confirmBtnText: { color: colors.white, fontSize: fontSizes.md, fontWeight: '700' },
});