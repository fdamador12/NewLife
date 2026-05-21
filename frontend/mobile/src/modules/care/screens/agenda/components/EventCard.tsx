import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  red: '#FF6B6B',
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

interface EventCardProps {
  id: string;
  title: string;
  category: string;
  timeFrom: string;
  timeTo: string;
  reminder: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventCard({
  title,
  category,
  timeFrom,
  timeTo,
  reminder,
  onEdit,
  onDelete,
}: EventCardProps) {
  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventColorBar, { backgroundColor: CATEGORY_COLORS[category] }]} />
      <View style={styles.eventContent}>
        <View style={styles.eventTop}>
          <View style={[styles.categoryBadge, { backgroundColor: `${CATEGORY_COLORS[category]}15` }]}>
            <Feather name={CATEGORY_ICONS[category] as any} size={12} color={CATEGORY_COLORS[category]} />
            <Text style={[styles.categoryText, { color: CATEGORY_COLORS[category] }]}>{category}</Text>
          </View>
          <View style={styles.eventActions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
              <Feather name="edit-2" size={14} color={COLORS.gray} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
              <Feather name="trash-2" size={14} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.eventTitle}>{title}</Text>
        <View style={styles.eventTimeRow}>
          <Feather name="clock" size={13} color={COLORS.gray} />
          <Text style={styles.eventTime}>{timeFrom} - {timeTo}</Text>
          {reminder && (
            <View style={styles.reminderIcon}>
              <Feather name="bell" size={10} color={COLORS.primary} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  eventColorBar: { width: 4 },
  eventContent: { flex: 1, padding: 16 },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: { fontSize: 11, fontWeight: '600' },
  eventActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 4 },
  eventTitle: { fontSize: 15, fontWeight: '600', color: COLORS.darkGray, marginBottom: 8 },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventTime: { fontSize: 13, color: COLORS.gray },
  reminderIcon: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});