import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

export default function Step4_Motivo({ navigation }: any) {
  const [motivo, setMotivo] = useState('');

  return (
    <StepLayout
      currentStep={4}
      question="¿Cuál es tu mayor motivo para estar sobrio? ❤︎"
      characterImage={require('../../../../assets/images/character5.png')}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Step5')}
      showButton={true}
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