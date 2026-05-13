import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useToast } from '../../../feedback/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePet } from '../../pet/hooks/usePet';

export default function DeleteAccountScreen({ navigation }: any) {
  const { showToast } = useToast();
  const { resetPet } = usePet();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: llamar endpoint DELETE /user/account cuando esté implementado
      resetPet();
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userEmail']);
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (e: any) {
      showToast(e?.message || 'No se pudo eliminar la cuenta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eliminar cuenta</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Feather name="alert-triangle" size={48} color="#FF6B6B" />
        </View>

        <Text style={styles.title}>¿Estás seguro?</Text>

        <Text style={styles.description}>
          Esta acción es permanente e irreversible. Al eliminar tu cuenta:
        </Text>

        <View style={styles.warningList}>
          <View style={styles.warningItem}>
            <Feather name="x-circle" size={16} color="#FF6B6B" />
            <Text style={styles.warningText}>Se borrarán todos tus registros diarios</Text>
          </View>
          <View style={styles.warningItem}>
            <Feather name="x-circle" size={16} color="#FF6B6B" />
            <Text style={styles.warningText}>Perderás tu progreso en el camino</Text>
          </View>
          <View style={styles.warningItem}>
            <Feather name="x-circle" size={16} color="#FF6B6B" />
            <Text style={styles.warningText}>Se eliminarán tus retos y medallas</Text>
          </View>
          <View style={styles.warningItem}>
            <Feather name="x-circle" size={16} color="#FF6B6B" />
            <Text style={styles.warningText}>Tu mascota y todo su progreso desaparecerá</Text>
          </View>
          <View style={styles.warningItem}>
            <Feather name="x-circle" size={16} color="#FF6B6B" />
            <Text style={styles.warningText}>No podrás recuperar ningún dato</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Feather name="trash-2" size={18} color={colors.white} />
              <Text style={styles.deleteButtonText}>Eliminar mi cuenta</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  content: {
    flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl,
    alignItems: 'center', gap: spacing.lg,
  },
  iconWrapper: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.text, textAlign: 'center' },
  description: { fontSize: fontSizes.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  warningList: {
    width: '100%', gap: spacing.sm, backgroundColor: colors.white,
    borderRadius: borderRadius.md, padding: spacing.lg,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  warningItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  warningText: { fontSize: fontSizes.sm, color: colors.text, flex: 1, lineHeight: 20 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: '#FF6B6B',
    borderRadius: borderRadius.md, paddingVertical: spacing.md, width: '100%',
  },
  deleteButtonText: { color: colors.white, fontSize: fontSizes.md, fontWeight: '700' },
  cancelButton: { paddingVertical: spacing.md, width: '100%', alignItems: 'center' },
  cancelButtonText: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textMuted },
});