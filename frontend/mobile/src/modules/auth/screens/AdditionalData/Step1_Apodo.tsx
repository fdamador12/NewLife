import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const INPUT_HEIGHT = 52;

export default function Step1_Apodo({ navigation }: any) {
  const [apodo, setApodo] = useState('');

  return (
    <StepLayout
      currentStep={1}
      question="Dime cómo quieres que te llame"
      characterImage={require('../../../../assets/images/character1.png')}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Step2')}
      showButton={true}
    >
      <TextInput
        style={styles.input}
        placeholder="Escribir apodo o nombre..."
        placeholderTextColor={colors.border}
        value={apodo}
        onChangeText={setApodo}
        autoCapitalize="words"
      />
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.md,
    color: colors.text,
  },
});