import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const INPUT_HEIGHT = 52;

const CURRENCIES = [
  { code: 'COP', symbol: '$', separator: '.' },
  { code: 'USD', symbol: '$', separator: ',' },
  { code: 'EUR', symbol: '€', separator: '.' },
];

const formatAmount = (value: string, separator: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

export default function Step5_Dinero({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (text: string) => {
    const formatted = formatAmount(text, currency.separator);
    setAmount(formatted);
  };

  return (
    <>
      <StepLayout
        currentStep={5}
        question="¿Cuánto gastabas más o menos en alcohol a la semana?"
        characterImage={require('../../../../assets/images/character6.png')}
        onBack={() => navigation.goBack()}
        onContinue={() => navigation.navigate('Step6')}
        showButton={true}
      >
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.currencySelector} onPress={() => setShowPicker(true)}>
            <Text style={styles.currencyText}>{currency.code}</Text>
            <Icon name="chevron-down" size={14} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.symbol}>{currency.symbol}</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.border}
            value={amount}
            onChangeText={handleChange}
            keyboardType="numeric"
          />
        </View>
      </StepLayout>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <TouchableOpacity style={styles.overlay} onPress={() => setShowPicker(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Selecciona la moneda</Text>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.modalOption, currency.code === c.code && styles.modalOptionSelected]}
                onPress={() => {
                  setCurrency(c);
                  setAmount('');
                  setShowPicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, currency.code === c.code && styles.modalOptionTextSelected]}>
                  {c.symbol} {c.code}
                </Text>
                {currency.code === c.code && (
                  <Icon name="check" size={16} color={colors.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    height: INPUT_HEIGHT,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencyText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  symbol: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    height: INPUT_HEIGHT,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    width: '75%',
    gap: spacing.sm,
  },
  modalTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalOptionText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: colors.white,
  },
});