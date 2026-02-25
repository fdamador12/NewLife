import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const OPTIONS = [
  { label: 'Sí', value: 'yes' },
  { label: 'No por ahora', value: 'no' },
];

export default function Step7_LugaresRiesgo({ navigation }: any) {
  const [selected, setSelected] = useState('');

  return (
    <StepLayout
      currentStep={7}
      question="¿Quieres registrar lugares de riesgo (bares, tiendas) para recibir alertas discretas?"
      characterImage={require('../../../../assets/images/character8.png')}
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
              setTimeout(() => {
                if (option.value === 'yes') {
                  navigation.navigate('Step8');
                } else {
                  navigation.navigate('Step9');
                }
              }, 300);
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