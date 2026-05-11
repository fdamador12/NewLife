import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import {
  getProfile,
  getSobrietyTime,
  getSobrietyTimeById,
  getCamino,
  getCaminoById,
} from '../../../services/authService';
import { getUserPosts, getUserPostsById } from '../../../services/communityService';
import { getProfileById } from '../../../services/userService';

const COLORS = {
  background: '#F7F7F7',
  text: '#404040',
  accent: '#D38A58',
  white: '#FFFFFF',
  muted: '#A0A0A0',
  lightMuted: '#E8E8E8',
  cream: '#FDF8F5',
  red: '#E25C5C',
  redLight: '#FDF0F0',
  green: '#E25C5C',
  greenLight: '#f5e8e8',
  blue: '#5B8DEF',
  blueLight: '#EBF2FF',
  purple: '#406ADF',
  purpleLight: '#eff4fc',
  gold: '#E9B44C',
  goldLight: '#FDF6E3',
};

const LEVEL_NAMES: Record<number, string> = {
  1: 'Reconocer', 2: 'Confiar', 3: 'Entregar', 4: 'Explorar',
  5: 'Compartir', 6: 'Prepararme', 7: 'Pedir cambio', 8: 'Reparar',
  9: 'Actuar', 10: 'Reflexionar', 11: 'Conectar', 12: 'Compartir',
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Ahora';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const MEDAL_COLORS = [
  { bg: COLORS.goldLight, icon: COLORS.gold },
  { bg: COLORS.blueLight, icon: COLORS.blue },
  { bg: COLORS.greenLight, icon: COLORS.green },
  { bg: COLORS.purpleLight, icon: COLORS.purple },
];

function MedalIcon({ index }: { index: number }) {
  const colorSet = MEDAL_COLORS[index % MEDAL_COLORS.length];
  return (
    <View style={[styles.medalIcon, { backgroundColor: colorSet.bg }]}>
      <Feather name="award" size={18} color={colorSet.icon} />
    </View>
  );
}

function PostCard({ post, onPress }: { post: any; onPress: () => void }) {
  const authorInitial = (post.autor_nombre || post.nombre || 'U').charAt(0).toUpperCase();

  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{authorInitial}</Text>
        </View>
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{post.autor_nombre || post.nombre}</Text>
          {post.comunidad_nombre ? (
            <Text style={styles.postCommunity}>{post.comunidad_nombre}</Text>
          ) : null}
        </View>
        <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
      </View>
      {post.titulo ? <Text style={styles.postTitle}>{post.titulo}</Text> : null}
      {post.contenido ? <Text style={styles.postBody}>{post.contenido}</Text> : null}
      <View style={styles.postActions}>
        <View style={styles.actionPill}>
          <Feather name="heart" size={16} color={COLORS.muted} />
          <Text style={styles.actionPillText}>{post.total_reacciones ?? 0}</Text>
        </View>
        <View style={styles.actionPill}>
          <Feather name="message-circle" size={16} color={COLORS.muted} />
          <Text style={styles.actionPillText}>{post.total_comentarios ?? 0}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.shareBtn}>
          <Feather name="share" size={16} color={COLORS.muted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function SocialProfileScreen({ navigation, route }: any) {
  const isOwn = route?.params?.isOwn === true;
  const robleId: string | undefined = route?.params?.robleId;
  const initialName: string = route?.params?.name || '';

  const [posts, setPosts] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysClean, setDaysClean] = useState<number>(0);
  const [nivel, setNivel] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        if (isOwn) {
          const [profile, postsRes, sobriety, camino] = await Promise.all([
            getProfile(),
            getUserPosts(),
            getSobrietyTime().catch(() => null),
            getCamino().catch(() => null),
          ]);
          setProfileData({ ...profile, publications: postsRes.length });
          setPosts(postsRes);
          setDaysClean(sobriety?.contador?.dias ?? 0);
          setNivel(camino?.nivel ?? 0);
        } else if (robleId) {
          const [profile, postsRes, sobriety, camino] = await Promise.all([
            getProfileById(robleId).catch(() => null),
            getUserPostsById(robleId).catch(() => []),
            getSobrietyTimeById(robleId).catch(() => null),
            getCaminoById(robleId).catch(() => null),
          ]);
          setProfileData({ ...(profile || {}), publications: postsRes.length });
          setPosts(postsRes);
          setDaysClean(sobriety?.contador?.dias ?? 0);
          setNivel(camino?.nivel ?? 0);
        }
      } catch (err) {
        console.log('Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOwn, robleId]);

  const name = profileData?.nombre || profileData?.name || initialName;
  const rawApodo = profileData?.apodo || '';
  const displayUsername = rawApodo
    ? `@${rawApodo}`
    : `@${name.toLowerCase().replace(/\s+/g, '')}`;
  const bio = profileData?.descripcion || profileData?.bio || '';
  const publications = profileData?.publications ?? 0;
  const communityCount = profileData?.total_comunidades ?? (profileData?.communities?.length ?? 0);
  const levelName = LEVEL_NAMES[nivel] || '';
  const totalMedals = 4;
  const medalsAchieved = 4;

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
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileUsername}>{displayUsername}</Text>
          {!!bio && <Text style={styles.bio}>{bio}</Text>}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{publications}</Text>
            <Text style={styles.statLabel}>Publicaciones</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{communityCount}</Text>
            <Text style={styles.statLabel}>Comunidades</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelIconWrapper}>
              <Feather name="trending-up" size={20} color={COLORS.purple} />
            </View>
            <Text style={styles.levelTitle}>
              {nivel > 0 ? `Nivel ${nivel} — ${levelName}` : 'Sin nivel aun'}
            </Text>
          </View>
          <View style={styles.levelStats}>
            <View style={styles.levelStat}>
              <View style={[styles.levelStatIconWrapper, { backgroundColor: COLORS.greenLight }]}>
                <Feather name="calendar" size={20} color={COLORS.green} />
              </View>
              <View>
                <Text style={styles.levelStatNumber}>{daysClean} dias</Text>
                <Text style={styles.levelStatLabel}>sin consumo</Text>
              </View>
            </View>
            <View style={styles.levelStatDivider} />
            <View style={styles.levelStat}>
              <View style={[styles.levelStatIconWrapper, { backgroundColor: COLORS.goldLight }]}>
                <Feather name="award" size={20} color={COLORS.gold} />
              </View>
              <View>
                <Text style={styles.levelStatNumber}>{medalsAchieved} logros</Text>
                <Text style={styles.levelStatLabel}>alcanzados</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Publicaciones</Text>
          {posts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{posts.length}</Text>
            </View>
          )}
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="edit-3" size={32} color={COLORS.blue} />
            </View>
            <Text style={styles.emptyTitle}>Sin publicaciones</Text>
            <Text style={styles.emptyText}>
              {isOwn ? 'Aun no has publicado nada' : 'Este usuario no tiene publicaciones'}
            </Text>
          </View>
        ) : (
          posts.map((post: any) => (
            <PostCard
              key={post.id || post._id}
              post={{ ...post, autor_nombre: name }}
              onPress={() => navigation.navigate('PostDetail', { post, community: null })}
            />
          ))
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
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatarLarge: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarLargeText: { fontSize: 36, fontWeight: '700', color: COLORS.white },
  profileName: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  profileUsername: { fontSize: 15, color: COLORS.muted, marginBottom: 12 },
  bio: { fontSize: 15, color: COLORS.text, lineHeight: 22, textAlign: 'center', paddingHorizontal: 16 },
  statsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.lightMuted },
  medalsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 12 },
  medalsLeft: { flex: 1 },
  medalsIconsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  medalIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  medalsCount: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  levelCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 24 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  levelIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.purpleLight, alignItems: 'center', justifyContent: 'center' },
  levelTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1 },
  levelStats: { flexDirection: 'row', alignItems: 'center' },
  levelStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelStatIconWrapper: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  levelStatNumber: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  levelStatLabel: { fontSize: 13, color: COLORS.muted },
  levelStatDivider: { width: 1, height: 44, backgroundColor: COLORS.lightMuted, marginHorizontal: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  badge: { backgroundColor: COLORS.lightMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  emptyContainer: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.blueLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  postCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  postAvatarText: { fontSize: 17, fontWeight: '600', color: COLORS.white },
  postAuthorInfo: { flex: 1 },
  postAuthor: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  postCommunity: { fontSize: 13, color: COLORS.accent, marginTop: 2 },
  postTime: { fontSize: 13, color: COLORS.muted },
  postTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 6, lineHeight: 22 },
  postBody: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 14 },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  actionPillText: { fontSize: 14, color: COLORS.muted, fontWeight: '500' },
  shareBtn: { padding: 8 },
});