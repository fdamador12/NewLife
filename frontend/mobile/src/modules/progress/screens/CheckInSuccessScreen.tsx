import React from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { PetForm } from '../../pet/types/pet.types';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: any;
  route: any;
};

export default function CheckInSuccessScreen({ navigation, route }: Props) {
  const { xp_gained, evolved, new_form } = route.params as {
    xp_gained: number;
    evolved: boolean;
    new_form: PetForm;
  };

  const handleContinue = () => {
    if (evolved && new_form) {
      navigation.navigate('PetEvolution', {
        newForm: new_form,
        xp: route.params?.xp ?? 0,
        destination: 'Home',
      });
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Feather name="chevron-left" size={24} color={colors.white} />
      </TouchableOpacity>

      <Image
        source={require('../../../assets/images/congratulations.jpg')}
        style={styles.background}
        resizeMode="cover"
      />

      <Text style={styles.title}>¡Todo está listo!</Text>
      <Text style={styles.subtitle}>Gracias por darte este momento.</Text>

      {xp_gained > 0 && (
        <View style={styles.xpBadge}>
          <Feather name="zap" size={16} color="#F5A623" />
          <Text style={styles.xpText}>+{xp_gained} XP</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>
          {evolved ? '¡Ver evolución!' : 'Salir'}
        </Text>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: spacing.xl,
    zIndex: 10,
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
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  xpText: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: '#F5A623',
  },
  button: {
    position: 'absolute',
    bottom: 48,
    width: width - spacing.xl * 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#F5A623',
  },
});