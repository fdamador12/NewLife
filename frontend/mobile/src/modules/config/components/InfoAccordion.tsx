import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator,
  TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { updateProfile } from '../../../services/authService';
import { useToast } from '../../../feedback/ToastContext';
import { isGuestMode, getGuestProfile, saveGuestProfile } from '../../../services/guestService';

type Props = {
  apodo: string;
  pronombre: string;
  motivoSobrio: string;
  gastoSemanal: string;
  readOnly?: boolean;
  onUpdated: (data: {
    apodo: string;
    pronombre: string;
    motivoSobrio: string;
    gastoSemanal: string;
  }) => void;
};

// ✅ Formatea número con comas: 50000 → 50,000
const formatNumber = (value: string): string => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (!numbers) return '';
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// ✅ Quita comas para guardar: 50,000 → 50000
const parseNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

export default function InfoAccordion({
  apodo: initialApodo,
  pronombre: initialPronombre,
  motivoSobrio: initialMotivo,
  gastoSemanal: initialGasto,
  readOnly = false,
  onUpdated,
}: Props) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [apodo, setApodo] = useState(initialApodo);
  const [pronombre, setPronombre] = useState(initialPronombre);
  const [motivoSobrio, setMotivoSobrio] = useState(initialMotivo);

  // ✅ gastoSemanal guarda el valor sin comas (número real)
  // gastoSemanalDisplay es lo que ve el usuario (con comas)
  const [gastoSemanal, setGastoSemanal] = useState(initialGasto);
  const [gastoSemanalDisplay, setGastoSemanalDisplay] = useState(
    initialGasto ? formatNumber(initialGasto) : ''
  );

  const handleGastoChange = (text: string) => {
    const formatted = formatNumber(text);
    const raw = parseNumber(formatted);
    setGastoSemanalDisplay(formatted);
    setGastoSemanal(raw);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const guest = await isGuestMode();

      if (guest) {
        const currentProfile = await getGuestProfile();
        await saveGuestProfile({
          ...currentProfile,
          apodo: apodo.trim() || currentProfile.apodo,
          pronombre: pronombre.trim() || currentProfile.pronombre,
          motivo_sobrio: motivoSobrio.trim() || currentProfile.motivo_sobrio,
          gasto_semana: gastoSemanal.trim() ? Number(gastoSemanal.trim()) : currentProfile.gasto_semana,
        });
      } else {
        const updates: any = {};
        if (apodo.trim()) updates.apodo = apodo.trim();
        if (pronombre.trim()) updates.pronombre = pronombre.trim();
        if (motivoSobrio.trim()) updates.motivo_sobrio = motivoSobrio.trim();
        if (gastoSemanal.trim()) updates.gasto_semanal = Number(gastoSemanal.trim());
        await updateProfile(updates);
      }

      onUpdated({ apodo, pronombre, motivoSobrio, gastoSemanal });
      setEditing(false);
      showToast('Perfil actualizado correctamente', 'success');
    } catch (e: any) {
      showToast(e?.message || 'No se pudo actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setApodo(initialApodo);
    setPronombre(initialPronombre);
    setMotivoSobrio(initialMotivo);
    setGastoSemanal(initialGasto);
    setGastoSemanalDisplay(initialGasto ? formatNumber(initialGasto) : '');
    setEditing(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpanded(prev => !prev)}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <Feather name="user" size={20} color={colors.text} />
            <Text style={styles.headerLabel}>Mi información</Text>
          </View>
          <Feather
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.body}>
            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Apodo</Text>
              {editing && !readOnly
                ? <TextInput style={styles.fieldInput} value={apodo} onChangeText={setApodo} placeholder="Tu apodo" placeholderTextColor={colors.textMuted} />
                : <Text style={styles.fieldValue}>{apodo || '—'}</Text>
              }
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Pronombre</Text>
              {editing && !readOnly
                ? <TextInput style={styles.fieldInput} value={pronombre} onChangeText={setPronombre} placeholder="Él, Ella, Elle..." placeholderTextColor={colors.textMuted} />
                : <Text style={styles.fieldValue}>{pronombre || '—'}</Text>
              }
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Mi motivación</Text>
              {editing && !readOnly
                ? <TextInput style={styles.fieldInput} value={motivoSobrio} onChangeText={setMotivoSobrio} placeholder="¿Por qué quieres mantenerte sobrio?" placeholderTextColor={colors.textMuted} multiline />
                : <Text style={styles.fieldValue}>{motivoSobrio || '—'}</Text>
              }
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Gasto semanal estimado</Text>
              {editing && !readOnly
                ? (
                  <View style={styles.gastoRow}>
                    <Text style={styles.gastoCurrency}>$</Text>
                    <TextInput
                      style={[styles.fieldInput, { flex: 1 }]}
                      value={gastoSemanalDisplay}
                      onChangeText={handleGastoChange}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                )
                : <Text style={styles.fieldValue}>
                    {gastoSemanal ? `$${Number(gastoSemanal).toLocaleString()}` : '—'}
                  </Text>
              }
            </View>

            <View style={styles.divider} />

            {editing ? (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={saving}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color={colors.white} />
                    : <Text style={styles.saveText}>Guardar cambios</Text>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                <Feather name="edit-2" size={16} color={colors.primary} />
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white, borderRadius: borderRadius.md,
    overflow: 'hidden', elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: spacing.lg,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerLabel: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border || '#F0F0F0', marginVertical: spacing.sm },
  field: { gap: 4, paddingVertical: spacing.xs },
  fieldLabel: {
    fontSize: fontSizes.xs, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  fieldValue: { fontSize: fontSizes.md, color: colors.text, paddingVertical: 2 },
  fieldInput: {
    fontSize: fontSizes.md, color: colors.text,
    borderBottomWidth: 1, borderBottomColor: colors.primary, paddingVertical: 4,
  },
  gastoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gastoCurrency: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.xs, alignSelf: 'flex-end', marginTop: spacing.sm,
  },
  editText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  cancelButton: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border || '#E0E0E0', alignItems: 'center',
  },
  cancelText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textMuted },
  saveButton: {
    flex: 1, paddingVertical: spacing.md,
    borderRadius: borderRadius.md, backgroundColor: colors.primary, alignItems: 'center',
  },
  saveText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.white },
});