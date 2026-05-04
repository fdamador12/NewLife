import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontSizes } from '../constants/theme';

interface Props {
  message?: string;
  type?: 'error' | 'success';
}

export default function FieldError({ message, type = 'error' }: Props) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <View style={styles.row}>
      <View style={[styles.dot, isError ? styles.dotError : styles.dotSuccess]} />
      <Text style={[styles.text, isError ? styles.textError : styles.textSuccess]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 16,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotError: {
    backgroundColor: '#E24B4A',
  },
  dotSuccess: {
    backgroundColor: '#3B6D11',
  },
  text: {
    fontSize: fontSizes.xs,
    flex: 1,
  },
  textError: {
    color: '#A32D2D',
  },
  textSuccess: {
    color: '#3B6D11',
  },
});