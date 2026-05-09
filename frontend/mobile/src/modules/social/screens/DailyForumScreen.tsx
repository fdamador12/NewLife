import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { getAllForums } from '../../../services/communityService';
import { communityCache, CK, TTL } from '../../../services/communityCache';

type Forum = {
  id: string;
  pregunta: string;
  descripcion?: string;
  fecha: string;
  created_at: string;
  es_hoy: boolean;
};

export default function DailyForumScreen({ navigation, route }: any) {
  const { communities = [] } = route.params || {};

  const cachedForums = communityCache.peek<any>(CK.allForums);
  const [forums, setForums]             = useState<Forum[]>(cachedForums?.foros ?? []);
  const [allCommunities, setAllCommunities] = useState<any[]>(
    cachedForums?.comunidades?.length > 0 ? cachedForums.comunidades : communities,
  );
  const [loading, setLoading]           = useState(!cachedForums);
  const [refreshing, setRefreshing]     = useState(false);

  const fetchForums = useCallback(async (force = false) => {
    if (!force) {
      const fresh = communityCache.get<any>(CK.allForums, TTL.allForums);
      if (fresh) {
        setForums(fresh.foros || []);
        if (fresh.comunidades?.length > 0) setAllCommunities(fresh.comunidades);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }
    try {
      const data = await getAllForums(force);
      setForums(data.foros || []);
      if (data.comunidades?.length > 0) setAllCommunities(data.comunidades);
    } catch (err) {
      console.log('Error cargando foros:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchForums(); }, [fetchForums]));

  const handleForumPress = (forum: Forum) => {
    if (allCommunities.length === 1) {
      // Una sola comunidad → ir directo al detalle
      navigation.navigate('DailyForumDetail', {
        foro:      forum,
        community: allCommunities[0],
      });
    } else {
      // Varias comunidades → elegir en cuál interactuar
      navigation.navigate('DailyForumCommunityPicker', {
        foro:        forum,
        communities: allCommunities,
      });
    }
  };

  const formatDate = (fecha: string) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foros</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchForums(true); }}
            colors={[colors.primary]}
          />
        }
      >
        {forums.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="edit" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Sin foros aún</Text>
            <Text style={styles.emptySubtitle}>
              Los administradores crearán foros del día próximamente.
            </Text>
          </View>
        ) : (
          forums.map((forum) => (
            <TouchableOpacity
              key={forum.id}
              style={[styles.forumCard, forum.es_hoy && styles.forumCardToday]}
              onPress={() => handleForumPress(forum)}
              activeOpacity={0.9}
            >
              <Text style={styles.forumEmoji}>✏️</Text>
              <View style={styles.forumContent}>
                <View style={styles.forumMeta}>
                  <Text style={[styles.forumDate, forum.es_hoy && styles.forumDateToday]}>
                    {forum.es_hoy ? 'Foro del día' : formatDate(forum.fecha)}
                  </Text>
                  {forum.es_hoy && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>Hoy</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.forumQuestion, forum.es_hoy && styles.forumQuestionToday]}
                  numberOfLines={2}
                >
                  {forum.pregunta}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={18}
                color={forum.es_hoy ? 'rgba(255,255,255,0.6)' : colors.textMuted}
              />
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  scroll:      { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl },
  forumCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  forumCardToday:    { backgroundColor: colors.primary },
  forumEmoji:        { fontSize: 32 },
  forumContent:      { flex: 1, gap: 4 },
  forumMeta:         { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  forumDate:         { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text },
  forumDateToday:    { color: colors.white },
  todayBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  todayBadgeText:    { fontSize: 10, fontWeight: '700', color: colors.white },
  forumQuestion:     { fontSize: fontSizes.sm, color: colors.textMuted, lineHeight: 18 },
  forumQuestionToday:{ color: 'rgba(255,255,255,0.85)' },
  emptyState: {
    alignItems: 'center', paddingTop: spacing.xl * 2,
    gap: spacing.md, paddingHorizontal: spacing.xl,
  },
  emptyTitle:    { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: fontSizes.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});