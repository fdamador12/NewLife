import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { analytics, EVENT_TYPES, SOS_OPTIONS } from '../../../services/analytics';

export default function SOSScreen({ navigation }: any) {

  // Analytics: trackear cual de las 2 opciones del menu SOS eligio.
  // El navigate va sin extras: EmergencyContactsScreen hardcodea su propio
  // source='sos' internamente porque sabe que solo se accede desde aqui.
  const handleEmergencyContactsPress = () => {
    analytics.track(EVENT_TYPES.SOS_OPTION_SELECTED, {
      option: SOS_OPTIONS.EMERGENCY_CONTACTS,
    });
    navigation.navigate('EmergencyContacts');
  };

  const handleCrisisModePress = () => {
    analytics.track(EVENT_TYPES.SOS_OPTION_SELECTED, {
      option: SOS_OPTIONS.CRISIS_MODE,
    });
    navigation.navigate('CrisisMode');
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Icon name="chevron-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Contactos de emergencia */}
        <View style={styles.optionBlock}>
          <View style={[styles.iconCircle, { backgroundColor: '#FF6B6B' }]}>
            <Icon name="users" size={28} color={colors.white} />
          </View>
          <Text style={styles.optionTitle}>Contactos de emergencia</Text>
          <Text style={styles.optionSubtitle}>Habla con alguien que te apoya.</Text>
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: '#FF6B6B' }]}
            onPress={handleEmergencyContactsPress}
          >
            <Text style={styles.optionButtonText}>Ver contactos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Modo crisis */}
        <View style={styles.optionBlock}>
          <View style={[styles.iconCircle, { backgroundColor: '#5C6BC0' }]}>
            <Icon name="heart" size={28} color={colors.white} />
          </View>
          <Text style={styles.optionTitle}>Modo crisis</Text>
          <Text style={styles.optionSubtitle}>Calma rápida cuando la necesites.</Text>
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: '#5C6BC0' }]}
            onPress={handleCrisisModePress}
          >
            <Text style={styles.optionButtonText}>Entrar al modo</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  optionBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  optionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  optionSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  optionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  optionButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xl,
  },
});