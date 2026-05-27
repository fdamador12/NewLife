import React from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useBottomInset } from '../../../../hooks/useBottomInset';

const { width, height } = Dimensions.get('window');

export default function CongratulationsScreen({ navigation }: any) {
  const bottomInset = useBottomInset(48);

  return (
    <View style={styles.container}>

      <Image
        source={require('../../../../assets/images/congratulations.jpg')}
        style={styles.background}
        resizeMode="cover"
      />

      <Text style={styles.title}>¡Todo está listo!</Text>
      <Text style={styles.subtitle}>Desde hoy, cada día limpio{'\n'}nos hará crecer.</Text>

      <TouchableOpacity
        style={[styles.button, { bottom: bottomInset }]}
        onPress={() => navigation.replace('AppTour')}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>¡Comenzar ahora!</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  background: {
    position: 'absolute',
    width,
    height,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginTop: height * 0.12,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    position: 'absolute',
    width: width - spacing.xl * 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#F5A623',
  },
});