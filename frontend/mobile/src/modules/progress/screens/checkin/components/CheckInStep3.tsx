import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../../constants/theme';
import BlobCard from './BlobCard';
import { FormData } from '../../checkin/types';
import { saveDailyCheckin } from '../../../../../services/progressService';
import { usePet } from '../../../../pet/hooks/usePet';

type Props = {
  formData: FormData;
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  onSuccess: (params: {
    xp_gained: number;
    evolved: boolean;
    new_form: string | null;
    xp: number;
  }) => void;
};

export default function CheckInStep3({ formData, showToast, onSuccess }: Props) {
  const [gratitude, setGratitude] = useState(formData.gratitud);
  const [loading, setLoading] = useState(false);
  const isValid = gratitude.trim() !== '';
  const { addXp } = usePet();

  const handleFinish = async () => {
    setLoading(true);
    try {
      const checkinPayload = {
        emocion: formData.emocion,
        consumo: formData.consumo || false,
        gratitud: gratitude,
        ...(formData.consumo && {
          ubicacion: formData.ubicacion,
          social: formData.social,
          reflexion: formData.reflexion,
        }),
      };

      console.log('📤 Preparando envío de daily-checkin:', JSON.stringify(checkinPayload, null, 2));
      await saveDailyCheckin(checkinPayload);
      console.log('✅ Registro diario guardado exitosamente');

      let totalXpGained = 0;
      let evolved = false;
      let newForm: string | null = null;
      let finalXp = 0;

      const checkinResponse = await addXp('checkin');
      if (checkinResponse && !checkinResponse.already_given) {
        totalXpGained += checkinResponse.xp_gained;
        finalXp = checkinResponse.xp;
        if (checkinResponse.evolved) {
          evolved = true;
          newForm = checkinResponse.selected_form;
        }
      }

      if (!formData.consumo) {
        const soberResponse = await addXp('sober_day');
        if (soberResponse && !soberResponse.already_given) {
          totalXpGained += soberResponse.xp_gained;
          finalXp = soberResponse.xp;
          if (soberResponse.evolved) {
            evolved = true;
            newForm = soberResponse.selected_form;
          }
        }
      }

      onSuccess({
        xp_gained: totalXpGained,
        evolved,
        new_form: newForm,
        xp: finalXp,
      });

    } catch (error: any) {
      console.log('❌ Error al guardar:', error);
      if (!error.response) {
        showToast('Sin conexión. Verifica tu internet e intenta de nuevo.', 'error');
      } else if (error.response.status === 401) {
        showToast('Tu sesión expiró. Por favor vuelve a iniciar sesión.', 'error');
      } else {
        showToast('No se pudo guardar el registro. Intenta de nuevo.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <BlobCard badge="Gratitud">
        <Text style={styles.cardQuestion}>¿Qué agradeces hoy, por pequeño que sea?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Escribe algo bueno del día, aunque sea mínimo..."
          placeholderTextColor={colors.border}
          value={gratitude}
          onChangeText={setGratitude}
          multiline
          textAlignVertical="top"
          editable={!loading}
        />
      </BlobCard>

      {isValid ? (
        <TouchableOpacity
          style={[styles.mainButton, loading && styles.mainButtonDisabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          <Text style={styles.mainButtonText}>
            {loading ? 'Guardando...' : 'Finalizar'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.mainButton, styles.mainButtonDisabled]}>
          <Text style={styles.mainButtonText}>Finalizar</Text>
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