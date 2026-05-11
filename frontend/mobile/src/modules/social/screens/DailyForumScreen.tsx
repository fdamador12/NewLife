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

const COLORS = {
  background: '#F7F7F7',
  text: '#404040',
  accent: '#D38A58',
  white: '#FFFFFF',
  muted: '#A0A0A0',
  lightMuted: '#E8E8E8',
  cream: '#FDF8F5',
  dark: '#404040',
};

type Forum = {
  id: string;
  pregunta: string;
  descripcion?: string;
  fecha: string;
  created_at: string;
  es_hoy: boolean;
};

export default function DailyForumScreen({ navigation, route }: any) {
  const { communities = [], fixedCommunity } = route.params || {};

  const cachedForums = communityCache.peek<any>(CK.allForums);
  const [forums, setForums] = useState<Forum[]>(cachedForums?.foros ?? []);
  const [allCommunities, setAllCommunities] = useState<any[]>(
    cachedForums?.comunidades?.length > 0 ? cachedForums.comunidades : communities,
  );
  const [loading, setLoading] = useState(!cachedForums);
  const [refreshing, setRefreshing] = useState(false);

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
    if (fixedCommunity || allCommunities.length === 1) {
      navigation.navigate('DailyForumDetail', {
        foro: forum,
        community: fixedCommunity ?? allCommunities[0],
      });
    } else {
      navigation.navigate('DailyForumCommunityPicker', {
        foro: forum,
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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foros</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchForums(true); }}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
      >
        {forums.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="edit-3" size={32} color={COLORS.muted} />
            </View>
            <Text style={styles.emptyTitle}>Sin foros aun</Text>
            <Text style={styles.emptyText}>
              Los administradores crearan foros del dia proximamente.
            </Text>
          </View>
        ) : (
          forums.map((forum) => {
            const isTodayForum = forum.es_hoy;
            return isTodayForum ? (
              <TouchableOpacity
                key={forum.id}
                style={styles.forumCardTodayLarge}
                onPress={() => handleForumPress(forum)}
                activeOpacity={0.8}
              >
                <View style={styles.forumIconRow}>
                  <View style={styles.forumIconTodayLarge}>
                    <Feather name="message-square" size={20} color={COLORS.white} />
                  </View>
                  <View style={styles.forumLabelRow}>
                    <Text style={styles.forumLabel}>Foro del dia</Text>
                    <View style={styles.todayBadgeLarge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.todayBadgeTextLarge}>Activo</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.forumQuestionLarge}>
                  {forum.pregunta}
                </Text>
                <View style={styles.forumFooter}>
                  <View style={{ flex: 1 }} />
                  <Feather name="chevron-right" size={20} color={COLORS.accent} />
                </View>
              </TouchableOpacity>
            ) : (
              <>
                {forums.find(f => !f.es_hoy) &&
                  forums.indexOf(forum) === forums.findIndex(f => !f.es_hoy) && (
                    <Text style={styles.sectionTitle}>
                      Foros de días anteriores
                    </Text>
                  )}

                <TouchableOpacity
                  key={forum.id}
                  style={styles.forumCard}
                  onPress={() => handleForumPress(forum)}
                  activeOpacity={0.9}
                >
                  <View style={styles.forumIconWrapper}>
                    <Feather name="message-square" size={20} color={COLORS.muted} />
                  </View>

                  <View style={styles.forumContent}>
                    <View style={styles.forumMeta}>
                      <Text style={styles.forumDate}>
                        {formatDate(forum.fecha)}
                      </Text>
                    </View>

                    <Text
                      style={styles.forumQuestion}
                      numberOfLines={2}
                    >
                      {forum.pregunta}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={18}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.white },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },

  // Estilos para el foro de hoy (oscuro, como en SocialScreen)
  forumCardTodayLarge: {
    backgroundColor: COLORS.dark,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'column',
    gap: 12,
    marginBottom: 12,
  },
  forumIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  forumIconTodayLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  forumLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  forumLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  todayBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  todayBadgeTextLarge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  forumQuestionLarge: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
    lineHeight: 22,
  },
  forumFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  forumCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  forumIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forumContent: { flex: 1, gap: 4 },
  forumMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  forumDate: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  forumQuestion: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },

  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.lightMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
});