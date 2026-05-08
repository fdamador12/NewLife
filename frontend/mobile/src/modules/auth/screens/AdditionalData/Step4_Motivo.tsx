import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useOnboarding } from '../../../../context/OnboardingContext';

export default function Step4_Motivo({ navigation }: any) {
  const [motivo, setMotivo] = useState('');
  const { setField } = useOnboarding();

  return (
    <StepLayout
      currentStep={4}
      question="¿Cuál es tu mayor motivo para estar sobrio? ❤️"
      characterImage={require('../../../../assets/images/character5.png')}
      onBack={() => navigation.goBack()}
      onContinue={() => {
        setField('motivo_sobrio', motivo);
        navigation.navigate('Step5');
      }}
      showButton={true}
      disabled={!motivo.trim()}
    >
      <TextInput
        style={styles.input}
        placeholder="Escribir un breve motivo..."
        placeholderTextColor={colors.border}
        value={motivo}
        onChangeText={setMotivo}
        multiline
        textAlignVertical="top"
      />
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 140,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
  },
});