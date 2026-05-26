import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../../../constants/theme';
import { useToast } from '../../../feedback/ToastContext';
import { FormData } from './checkin/types';
import CheckInStep1 from './checkin/components/CheckInStep1';
import CheckInStep2 from './checkin/components/CheckInStep2';
import CheckInStep3 from './checkin/components/CheckInStep3';
import { analytics, EVENT_TYPES } from '../../../services/analytics';

export default function DailyCheckInScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    emocion: '',
    consumo: null,
    ubicacion: '',
    social: '',
    reflexion: '',
    gratitud: '',
  });

  const { showToast } = useToast();

  const completedRef = useRef(false);

  useEffect(() => {
    analytics.track(EVENT_TYPES.DAILY_CHECKIN_STARTED);

    return () => {
      if (!completedRef.current) {
        analytics.track(EVENT_TYPES.DAILY_CHECKIN_ABANDONED);
      }
    };
  }, []);

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else if (step === 3 && formData.consumo === false) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const handleSuccess = (params: {
    xp_gained: number;
    evolved: boolean;
    new_form: string | null;
    xp: number;
  }) => {
    completedRef.current = true;
    analytics.track(EVENT_TYPES.DAILY_CHECKIN_COMPLETED);
    navigation.navigate('CheckInSuccess', {
      xp_gained: params.xp_gained,
      evolved: params.evolved,
      new_form: params.new_form,
      xp: params.xp,
    });
  };

  return (
    <View style={styles.container}>
      {/* ✅ zIndex para que el header no intercepte toques del contenido */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Feather name="chevron-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <CheckInStep1
            onNo={() => {
              setFormData({ ...formData, consumo: false });
              setStep(3);
            }}
            onYes={() => {
              setFormData({ ...formData, consumo: true });
              setStep(2);
            }}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {step === 2 && (
          <CheckInStep2
            onContinue={() => setStep(3)}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {step === 3 && (
          <CheckInStep3
            formData={formData}
            showToast={showToast}
            onSuccess={handleSuccess}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: '#303030',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    // ✅ zIndex bajo para no interceptar toques del contenido debajo
    zIndex: 0,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginRight: 24,
  },
  // ✅ contenido por encima del header con zIndex mayor
  content: {
    flex: 1,
    zIndex: 1,
  },
});