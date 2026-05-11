import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
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
  dark: '#404040',
};

const COMMUNITY_EMOJIS = ['🌸', '🌼', '🌻', '🌷', '🌺', '🪻', '🌹'];

export default function DailyForumCommunityPickerScreen({ navigation, route }: any) {
  const { foro, communities = [] } = route.params || {};

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
        <Text style={styles.headerTitle}>Foro del dia</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.forumCard}>
        <View style={styles.forumIconWrapper}>
          <Feather name="message-square" size={20} color={COLORS.white} />
        </View>
        <View style={styles.forumContent}>
          <Text style={styles.forumLabel}>
            {foro?.es_hoy ? 'Hoy' : foro?.fecha || ''}
          </Text>
          <Text style={styles.forumQuestion}>{foro?.pregunta}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        En cual comunidad quieres participar?
      </Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {communities.map((community: any) => (
          <TouchableOpacity
            key={community.id}
            style={styles.communityCard}
            onPress={() => navigation.navigate('DailyForumDetail', { foro, community })}
            activeOpacity={0.9}
          >
            <View style={styles.communityAvatar}>
              <Text style={styles.communityEmoji}>{getEmoji(community.id)}</Text>
            </View>
            <View style={styles.communityInfo}>
              <Text style={styles.communityName}>{community.nombre}</Text>
              <View style={styles.accessRow}>
                <Feather
                  name={community.tipo_acceso === 'SOLO_VER' ? 'eye' : community.tipo_acceso === 'POSTEAR_COMENTAR' ? 'edit-2' : 'message-circle'}
                  size={12}
                  color={COLORS.muted}
                />
                <Text style={styles.communityAccess}>
                  {community.tipo_acceso === 'SOLO_VER'
                    ? 'Solo lectura'
                    : community.tipo_acceso === 'POSTEAR_COMENTAR'
                    ? 'Puede responder'
                    : 'Acceso completo'}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.white },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  forumCard: { backgroundColor: COLORS.dark, marginHorizontal: 20, marginTop: 20, marginBottom: 24, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  forumIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  forumContent: { flex: 1, gap: 6 },
  forumLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
  forumQuestion: { fontSize: 14, fontWeight: '500', color: COLORS.white, lineHeight: 22 },
  sectionTitle: { fontSize: 14, fontWeight: '500', color: COLORS.muted, paddingHorizontal: 20, marginBottom: 12 },
  scroll: { paddingHorizontal: 20, gap: 12 },
  communityCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  communityAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' },
  communityEmoji: { fontSize: 28 },
  communityInfo: { flex: 1 },
  communityName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  accessRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  communityAccess: { fontSize: 13, color: COLORS.muted },
});