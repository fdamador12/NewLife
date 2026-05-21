import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';
import BlobCard from './BlobCard';
import { FormData } from '../../checkin/types';

const EMOTIONS = [
  { id: '1', emoji: '😇', label: 'Tranquilo' },
  { id: '2', emoji: '😄', label: 'Animado' },
  { id: '3', emoji: '😐', label: 'Normal' },
  { id: '4', emoji: '😔', label: 'Bajoneado' },
  { id: '5', emoji: '😰', label: 'Ansioso' },
  { id: '6', emoji: '🤯', label: 'Saturado' },
  { id: '7', emoji: '😡', label: 'Irritado' },
];

type Props = {
  onNo: () => void;
  onYes: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
};

export default function CheckInStep1({ onNo, onYes, formData, setFormData }: Props) {
  const [selectedEmotion, setSelectedEmotion] = useState<string>(formData.emocion);
  const isValid = selectedEmotion !== '' && formData.consumo !== null;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <BlobCard badge="Emociones">
        <Text style={styles.cardQuestion}>¿Cómo te sientes hoy?</Text>
        {EMOTIONS.map((e) => (
          <TouchableOpacity
            key={e.id}
            style={[styles.optionRow, selectedEmotion === e.id && styles.optionRowSelected]}
            onPress={() => {
              setSelectedEmotion(e.id);
              setFormData({ ...formData, emocion: e.label });
            }}
          >
            <Text style={styles.optionEmoji}>{e.emoji}</Text>
            <Text style={[styles.optionLabel, selectedEmotion === e.id && styles.optionLabelSelected]}>
              {e.label}
            </Text>
          </TouchableOpacity>
        ))}
      </BlobCard>

      <BlobCard badge="Consumo">
        <Text style={styles.cardQuestion}>¿Consumiste hoy?</Text>
        <View style={styles.yesNoRow}>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.consumo === true && styles.yesNoSelected]}
            onPress={() => setFormData({ ...formData, consumo: true })}
          >
            <Text style={[styles.yesNoText, formData.consumo === true && styles.yesNoTextSelected]}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.yesNoButton, formData.consumo === false && styles.yesNoSelected]}
            onPress={() => setFormData({ ...formData, consumo: false })}
          >
            <Text style={[styles.yesNoText, formData.consumo === false && styles.yesNoTextSelected]}>No</Text>
          </TouchableOpacity>
        </View>
      </BlobCard>

      {isValid ? (
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => (formData.consumo ? onYes() : onNo())}
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
    paddingBottom: 40,
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
  optionRowSelected: {
    borderColor: colors.accent,
    backgroundColor: '#FDF3EC',
  },
  optionEmoji: { fontSize: 20 },
  optionLabel: { fontSize: fontSizes.md, color: colors.text },
  optionLabelSelected: { color: colors.accent, fontWeight: '600' },
  yesNoRow: { flexDirection: 'row', gap: spacing.md },
  yesNoButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  yesNoSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  yesNoText: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  yesNoTextSelected: { color: colors.white },
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