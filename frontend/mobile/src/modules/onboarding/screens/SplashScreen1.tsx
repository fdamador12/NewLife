import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

type Props = {
  navigation: any;
};

export default function SplashScreen1({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Splash2');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#C8845A" barStyle="light-content" />
      <Text style={styles.text}>
        New <Text style={styles.bold}>life</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8845A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
  bold: {
    fontWeight: '700',
  },
});