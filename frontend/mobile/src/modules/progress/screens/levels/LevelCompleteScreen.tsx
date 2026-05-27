import React from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';
import { useBottomInset } from '../../../../hooks/useBottomInset';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  LevelComplete: {
    levelNumber: number;
    message: string;
  };
  Path: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'LevelComplete'>;

export default function LevelCompleteScreen({ navigation, route }: any) {
  const { message } = route.params;
  const bottomInset = useBottomInset(48);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/images/congratulations.jpg')}
        style={styles.background}
        resizeMode="cover"
      />

      <Text style={styles.title}>¡Un paso más logrado!</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <TouchableOpacity
        style={[styles.button, { bottom: bottomInset }]}
        onPress={() => navigation.navigate('Path')}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>Salir</Text>
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
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 24,
  },
  button: {
    position: 'absolute',
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