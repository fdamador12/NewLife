import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  background: '#F7F7F7',
  text: '#404040',
  accent: '#D38A58',
  white: '#FFFFFF',
  muted: '#A0A0A0',
  lightMuted: '#E8E8E8',
  cream: '#FDF8F5',
};

const COMMUNITY_EMOJIS = ['🌸', '🌼', '🌻', '🌷', '🌺', '🪻', '🌹'];

export default function MyCommunitiesScreen({ navigation, route }: any) {
  const { communities = [] } = route.params || {};
  const [search, setSearch] = useState('');

  const filtered = communities.filter((c: any) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const getEmoji = (id: string) => {
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COMMUNITY_EMOJIS[index % COMMUNITY_EMOJIS.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis comunidades</Text>
      </View>

      <View style={styles.searchWrapper}>
        <Feather name="search" size={18} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar comunidad..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="users" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'Sin resultados' : 'Sin comunidades'}
            </Text>
            <Text style={styles.emptyText}>
              {search ? 'No se encontraron comunidades con ese nombre' : 'No perteneces a ninguna comunidad todavia'}
            </Text>
          </View>
        ) : (
          filtered.map((community: any) => (
            <TouchableOpacity
              key={community.id}
              style={styles.communityCard}
              onPress={() => navigation.navigate('CommunityDetail', { community })}
              activeOpacity={0.7}
            >
              <View style={styles.communityAvatar}>
                <Text style={styles.communityEmoji}>{getEmoji(community.id)}</Text>
              </View>
              <View style={styles.communityInfo}>
                <View style={styles.communityNameRow}>
                  <Text style={styles.communityName}>{community.nombre}</Text>
                  {community.es_moderador && (
                    <View style={styles.modBadge}>
                      <Text style={styles.modBadgeText}>Mod</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.communityDescription} numberOfLines={2}>
                  {community.descripcion || 'Comunidad de apoyo y recuperacion.'}
                </Text>
                <View style={styles.accessBadge}>
                  <Feather 
                    name={community.tipo_acceso === 'SOLO_VER' ? 'eye' : community.tipo_acceso === 'POSTEAR_COMENTAR' ? 'edit-2' : 'message-circle'} 
                    size={12} 
                    color={COLORS.accent} 
                  />
                  <Text style={styles.accessText}>
                    {community.tipo_acceso === 'SOLO_VER'
                      ? 'Solo lectura'
                      : community.tipo_acceso === 'POSTEAR_COMENTAR'
                        ? 'Puede publicar'
                        : 'Acceso completo'}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.white,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 20, marginTop: 16, marginBottom: 20, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  scroll: { paddingHorizontal: 20, gap: 12 },
  communityCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  communityAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center',
  },
  communityEmoji: { fontSize: 28 },
  communityInfo: { flex: 1, gap: 4 },
  communityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  communityName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  communityDescription: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
  accessBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  accessText: { fontSize: 12, color: COLORS.accent, fontWeight: '500' },
  modBadge: { backgroundColor: COLORS.cream, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  modBadgeText: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
});