import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { PetForm } from '../types/pet.types';
import { PET_IMAGES } from '../utils/petHelpers';

type Props = {
  form: PetForm;
  size?: number;
};

export default function PetAvatar({ form, size = 120 }: Props) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={PET_IMAGES[form]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});