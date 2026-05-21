import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { colors, spacing } from '../../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen2({ navigation }: any) {
  useEffect(() => {
  const timer = setTimeout(async () => {

    // 🧹 SOLO PARA TESTING (BORRAR DESPUÉS)
     //await AsyncStorage.clear();
    // console.log('🧹 AsyncStorage limpio');

    // navegación normal
    navigation.replace('LoaderScreen');

  }, 2000);

  return () => clearTimeout(timer);
}, []);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />

      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.character}
        resizeMode="contain"
      />

      <Image
        source={require('../../../assets/images/logosplash2.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  character: {
    width: 130,
    height: 130,
  },
  logo: {
    width: 120,
    height: 45,
  },
});