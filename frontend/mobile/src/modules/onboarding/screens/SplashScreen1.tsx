import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { colors, fontSizes } from '../../../constants/theme';

export default function SplashScreen1({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Splash2');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.accent} barStyle="light-content" />
      <Text style={styles.text}>
        New <Text style={styles.bold}>life</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: fontSizes.xxl,
    fontWeight: '300',
  },
  bold: {
    fontWeight: '700',
  },
});