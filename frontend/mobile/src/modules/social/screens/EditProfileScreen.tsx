import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Modal, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import { getProfile } from '../../../services/authService';
import api from '../../../services/api';

const PRONOMBRES = ['Él', 'Ella', 'Elle'];

export default function EditProfileScreen({ navigation }: any) {
  const [apodo, setApodo]             = useState('');
  const [pronombre, setPronombre]     = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [showPronPicker, setShowPronPicker] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setApodo(data.apodo || '');
      setPronombre(data.pronombre || '');
      setDescripcion(data.descripcion || ''); 
    } catch (err) {
      console.log('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { fetchProfile(); }, [fetchProfile])
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/user/profile', {
        apodo:       apodo.trim()       || undefined,
        pronombre:   pronombre.trim()   || undefined,
        descripcion: descripcion.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo guardar.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.label}>Apodo</Text>
        <TextInput
          style={styles.input}
          value={apodo}
          onChangeText={setApodo}
          placeholder="Tu apodo..."
          placeholderTextColor={colors.border}
        />

        <Text style={styles.label}>Pronombre</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowPronPicker(true)}
        >
          <Text style={[styles.inputText, !pronombre && { color: colors.border }]}>
            {pronombre || 'Seleccionar pronombre...'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.textArea}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Cuéntanos algo sobre ti..."
          placeholderTextColor={colors.border}
          multiline
          textAlignVertical="top"
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.saveButtonText}>Guardar</Text>
        }
      </TouchableOpacity>

      {/* Pronombre picker */}
      <Modal visible={showPronPicker} transparent animationType="slide" statusBarTranslucent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPronPicker(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pronombre</Text>
            {PRONOMBRES.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.modalOption}
                onPress={() => { setPronombre(p); setShowPronPicker(false); }}
              >
                <Text style={[styles.modalOptionText, pronombre === p && styles.modalOptionSelected]}>
                  {p}
                </Text>
                {pronombre === p && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  scroll:      { paddingHorizontal: spacing.xl },
  label: {
    fontSize: fontSizes.sm, fontWeight: '700', color: colors.text,
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  input: {
    backgroundColor: '#F0F0F0', borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSizes.md, color: colors.text,
  },
  inputRow: {
    backgroundColor: '#F0F0F0', borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputText:   { fontSize: fontSizes.md, color: colors.text },
  textArea: {
    backgroundColor: '#F0F0F0', borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSizes.md, color: colors.text, height: 120,
  },
  saveButton: {
    position: 'absolute', bottom: 32, left: spacing.xl, right: spacing.xl,
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, alignItems: 'center', elevation: 4,
  },
  saveButtonText:      { color: colors.white, fontSize: fontSizes.lg, fontWeight: '700' },
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xl, gap: spacing.sm,
  },
  modalTitle:          { fontSize: fontSizes.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalOptionText:     { fontSize: fontSizes.md, color: colors.text },
  modalOptionSelected: { fontWeight: '700', color: colors.primary },
});