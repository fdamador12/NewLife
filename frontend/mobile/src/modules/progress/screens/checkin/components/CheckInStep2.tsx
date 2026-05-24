import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Keyboard,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';
import BlobCard from './BlobCard';
import { FormData } from '../../checkin/types';

const LOCATIONS = [
  { id: '1', emoji: '🏠', label: 'En mi casa' },
  { id: '2', emoji: '🏡', label: 'En casa de un amigo' },
  { id: '3', emoji: '🏙️', label: 'En el barrio / calle' },
  { id: '4', emoji: '🎓', label: 'En la universidad' },
  { id: '5', emoji: '🪩', label: 'En un bar o disco' },
];

const SOCIALS = [
  { id: '1', emoji: '🧍', label: 'Solo' },
  { id: '2', emoji: '👫', label: 'Con amigos' },
  { id: '3', emoji: '💝', label: 'Con mi pareja' },
  { id: '4', emoji: '👥', label: 'Con gente del trabajo' },
  { id: '5', emoji: '🎒', label: 'Con gente de la uni' },
  { id: '6', emoji: '👤', label: 'Con desconocidos' },
];

type Props = {
  onContinue: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
};

export default function CheckInStep2({ onContinue, formData, setFormData }: Props) {
  const [selectedLocation, setSelectedLocation] = useState<string>(formData.ubicacion);
  const [selectedSocial, setSelectedSocial] = useState<string>(formData.social);
  const isValid = selectedLocation !== '' && selectedSocial !== '' && formData.reflexion.trim() !== '';

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <BlobCard badge="Ubicacion">
        <Text style={styles.cardQuestion}>¿Dónde estabas?</Text>
        {LOCATIONS.map((l) => (
          <TouchableOpacity
            key={l.id}
            style={[styles.optionRow, selectedLocation === l.id && styles.optionRowSelected]}
            onPress={() => {
              Keyboard.dismiss();
              setSelectedLocation(l.id);
              setFormData({ ...formData, ubicacion: l.label });
            }}
          >
            <Text style={styles.optionEmoji}>{l.emoji}</Text>
            <Text style={[styles.optionLabel, selectedLocation === l.id && styles.optionLabelSelected]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </BlobCard>

      <BlobCard badge="Social">
        <Text style={styles.cardQuestion}>¿Con quién estabas?</Text>
        {SOCIALS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.optionRow, selectedSocial === s.id && styles.optionRowSelected]}
            onPress={() => {
              Keyboard.dismiss();
              setSelectedSocial(s.id);
              setFormData({ ...formData, social: s.label });
            }}
          >
            <Text style={styles.optionEmoji}>{s.emoji}</Text>
            <Text style={[styles.optionLabel, selectedSocial === s.id && styles.optionLabelSelected]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </BlobCard>

      <BlobCard badge="Reflexión">
        <Text style={styles.cardQuestion}>¿Qué podrías hacer diferente la próxima vez?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Escribir aquí..."
          placeholderTextColor={colors.border}
          value={formData.reflexion}
          onChangeText={(text) => setFormData({ ...formData, reflexion: text })}
          multiline
          textAlignVertical="top"
        />
      </BlobCard>

      {isValid ? (
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => {
            Keyboard.dismiss();
            onContinue();
          }}
        >
          <Text style={styles.mainButtonText}>Continuar</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.mainButton, styles.mainButtonDisabled]}>
          <Text style={styles.mainButtonText}>Continuar</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 80,
    paddingTop: spacing.lg,
  },
  cardQuestion: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.xs,
  },
  optionRowSelected: { borderColor: colors.accent, backgroundColor: '#FDF3EC' },
  optionEmoji: { fontSize: 20 },
  optionLabel: { fontSize: fontSizes.md, color: colors.text },
  optionLabelSelected: { color: colors.accent, fontWeight: '600' },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    height: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  mainButtonDisabled: { opacity: 0.4 },
  mainButtonText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '700' },
});