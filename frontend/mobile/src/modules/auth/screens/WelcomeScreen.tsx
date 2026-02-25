import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/images/character.png')}
          style={styles.character}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>New <Text style={styles.titleBold}>Life</Text></Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonPrimaryText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonSecondaryText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.guestText}>Continuar como invitadx</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  imageContainer: {
    marginBottom: spacing.lg,
  },
  character: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: fontSizes.xxl - 2,
    fontWeight: '300',
    color: colors.text,
    marginBottom: spacing.xxl,
  },
  titleBold: {
    fontWeight: '700',
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
  },
  buttonPrimary: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  buttonSecondary: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: '500',
  },
  guestText: {
    color: colors.accent,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    textDecorationLine: 'underline',
  },
});