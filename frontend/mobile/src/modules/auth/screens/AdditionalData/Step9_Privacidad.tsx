import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const OPTIONS = [
  { label: 'Compartir (visible en muro)', value: 'public' },
  { label: 'Privado (solo tú)', value: 'private' },
];

export default function Step9_Privacidad({ navigation }: any) {
  const [selected, setSelected] = useState('');

  return (
    <StepLayout
      currentStep={9}
      question="¿Quieres compartir tus logros con la comunidad o mantenerlos privados?"
      characterImage={require('../../../../assets/images/character10.png')}
      onBack={() => navigation.goBack()}
      showButton={false}
    >
      <View style={styles.optionsContainer}>
        {OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, selected === option.value && styles.optionSelected]}
            onPress={() => {
              setSelected(option.value);
              setTimeout(() => navigation.navigate('Step10'), 300);
            }}
          >
            <Text style={[styles.optionText, selected === option.value && styles.optionTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: fontSizes.lg,
    color: colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.white,
  },
});