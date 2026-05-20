import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useToast } from '../../../feedback/ToastContext';
import { usePet } from '../../pet/hooks/usePet';
import { deleteAllData } from '../../../services/authService';

// Limite consistente con la landing web (/eliminar-cuenta)
const MAX_MOTIVO_LENGTH = 500;

export default function DeleteAccountScreen({ navigation }: any) {
  const { showToast } = useToast();
  const { resetPet } = usePet();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Motivo opcional: feedback voluntario del usuario sobre por que se va.
  // Mismo limite (500 chars) que el formulario de eliminacion de la landing
  // para mantener consistencia entre canales.
  const [motivo, setMotivo] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Trim para no enviar solo espacios en blanco. Si queda vacio mandamos
      // undefined para no guardar strings vacios en delete_motivo del backend.
      const motivoTrimmed = motivo.trim();
      await deleteAllData(motivoTrimmed.length > 0 ? motivoTrimmed : undefined);
      resetPet();
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (e: any) {
      setShowModal(false);
      showToast(e?.message || 'No se pudo eliminar la cuenta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (loading) return;
    setShowModal(false);
    // Limpiar motivo al cerrar para que no quede al reabrir
    setMotivo('');
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
          onPress={() => setShowModal(true)}
          activeOpacity={0.85}
        >
          <Feather name="trash-2" size={18} color={colors.white} />
          <Text style={styles.deleteButtonText}>Eliminar mi cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación con campo de motivo opcional */}
      <Modal visible={showModal} transparent animationType="fade" statusBarTranslucent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modal}>

              <View style={styles.modalIconWrapper}>
                <Feather name="trash-2" size={32} color="#FF6B6B" />
              </View>

              <Text style={styles.modalTitle}>Eliminar todos mis datos</Text>
              <Text style={styles.modalDescription}>
                Esta acción es irreversible. Todos tus datos, historial y progreso serán eliminados permanentemente.
              </Text>

              {/* Campo de motivo opcional */}
              <View style={styles.motivoWrapper}>
                <Text style={styles.motivoLabel}>
                  Cuéntanos por qué (opcional)
                </Text>
                <TextInput
                  style={styles.motivoInput}
                  value={motivo}
                  onChangeText={setMotivo}
                  placeholder="Tu opinión nos ayuda a mejorar..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  maxLength={MAX_MOTIVO_LENGTH}
                  editable={!loading}
                  textAlignVertical="top"
                />
                <Text style={styles.motivoCounter}>
                  {motivo.length} / {MAX_MOTIVO_LENGTH}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalDeleteButton, loading && { opacity: 0.7 }]}
                onPress={handleDelete}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator size="small" color={colors.white} />
                  : <Text style={styles.modalDeleteButtonText}>Sí, eliminar definitivamente</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseModal}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  modal: {
    backgroundColor: colors.white, borderRadius: 24,
    padding: spacing.xl, width: '100%', alignItems: 'center', gap: spacing.md,
  },
  modalIconWrapper: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, textAlign: 'center' },
  modalDescription: {
    fontSize: fontSizes.sm, color: colors.textMuted,
    textAlign: 'center', lineHeight: 20,
  },

  // Campo de motivo opcional
  motivoWrapper: {
    width: '100%',
    marginTop: spacing.xs,
  },
  motivoLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  motivoInput: {
    width: '100%',
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  motivoCounter: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },

  modalDeleteButton: {
    backgroundColor: '#FF6B6B', borderRadius: borderRadius.md,
    paddingVertical: spacing.md, width: '100%', alignItems: 'center', marginTop: spacing.sm,
  },
  modalDeleteButtonText: { color: colors.white, fontSize: fontSizes.md, fontWeight: '700' },
  modalCancelButton: { paddingVertical: spacing.sm, width: '100%', alignItems: 'center' },
  modalCancelButtonText: { fontSize: fontSizes.md, fontWeight: '600', color: colors.textMuted },
});