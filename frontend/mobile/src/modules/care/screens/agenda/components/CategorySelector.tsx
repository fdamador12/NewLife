import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  background: '#FAFAFA',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Reunion': '#D38A58',
  'Grupo AA': '#7FB77E',
  'Fundación': '#00ADB5',
  'Otro': '#969696',
  'Lectura': '#406ADF',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Reunion': 'users',
  'Grupo AA': 'heart',
  'Fundación': 'home',
  'Otro': 'grid',
  'Lectura': 'book-open',
};

const CATEGORIES = ['Reunion', 'Grupo AA', 'Fundación', 'Otro', 'Lectura'];

interface CategorySelectorProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <View style={styles.categoryGrid}>
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              isActive && {
                backgroundColor: `${CATEGORY_COLORS[cat]}15`,
                borderColor: CATEGORY_COLORS[cat],
              },
            ]}
            onPress={() => onSelect(cat)}
          >
            <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
            <Text style={[styles.categoryLabel, isActive && { color: CATEGORY_COLORS[cat] }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryLabel: { fontSize: 13, color: COLORS.gray },
});