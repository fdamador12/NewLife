import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import TimePickerModal from './TimePickerModal';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  background: '#FAFAFA',
  border: '#E8E8E8',
};

interface TimeInputFieldProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
}

export default function TimeInputField({
  label,
  value,
  onChange,
}: TimeInputFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowPicker(true)}
        >
          <Feather name="clock" size={18} color={COLORS.primary} />
          <Text style={styles.timeValue}>{value}</Text>
          <Feather name="chevron-down" size={18} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <TimePickerModal
        visible={showPicker}
        currentTime={value}
        onTimeSelect={onChange}
        onClose={() => setShowPicker(false)}
        title={`Selecciona ${label.toLowerCase()}`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 6,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  timeValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
});