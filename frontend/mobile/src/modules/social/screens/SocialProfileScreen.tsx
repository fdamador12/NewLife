import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import {
  getProfile,
  getSobrietyTime,
} from '../../../services/authService';
import { getCamino } from '../../../services/progressService';
import {
  getUserPosts,
  getUserPostsById,
  getUserPublicProfile,
  getMyCommunities,
} from '../../../services/communityService';
import { Avatar } from '../components/Avatar';
import { ExpandableImage } from '../components/ExpandableImage';

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

function PostCard({
  post,
  authorName,
  authorAvatar,
  onPress,
}: {
  post: any;
  authorName: string;
  authorAvatar?: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.postCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.postHeader}>
        <Avatar url={authorAvatar} name={authorName} size={44} />
        <View style={styles.postAuthorInfo}>
          <Text style={styles.postAuthor}>{post.autor_nombre || authorName}</Text>
          {post.comunidad_nombre ? (
            <Text style={styles.postCommunity}>{post.comunidad_nombre}</Text>
          ) : null}
        </View>
        <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
      </View>
      {post.titulo ? <Text style={styles.postTitle}>{post.titulo}</Text> : null}
      {post.contenido ? <Text style={styles.postBody}>{post.contenido}</Text> : null}

      {/* Imagen del post — NUEVO */}
      {post.imagen_url ? (
        <View style={{ marginBottom: 14 }}>
          <ExpandableImage uri={post.imagen_url} />
        </View>
      ) : null}

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


/**
 * Pantalla de perfil social. Se usa para dos cosas:
 *
 *  1. Ver MI propio perfil publico (tal como me ven otros) — params: { isOwn: true }
 *  2. Ver perfil de OTRO usuario — params: { isOwn: false, robleId, name }
 *
 * IMPORTANTE — Deteccion automatica de "mi propio perfil":
 * El navigator tiene dos rutas (SocialProfile y UserProfile) que apuntan
 * al mismo componente. Dependiendo de donde se accede, puede llegar
 * isOwn=true o el robleId del propio usuario logueado.
 *
 * Para que el boton "Editar perfil" SIEMPRE aparezca cuando el perfil
 * mostrado es el propio, comparamos el robleId recibido contra el
 * robleId del usuario logueado. Si coinciden, forzamos modo "isOwn".
 */
export default function SocialProfileScreen({ navigation, route }: any) {
  const paramIsOwn = route?.params?.isOwn === true;
  const robleIdParam: string | undefined = route?.params?.robleId;
  const initialName: string = route?.params?.name || '';

  // isOwn dinamico: se ajusta despues de cargar profile (si el robleId
  // coincide con el del usuario logueado)
  const [isOwn, setIsOwn] = useState<boolean>(paramIsOwn);
  const [posts, setPosts] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysClean, setDaysClean] = useState<number>(0);
  const [nivel, setNivel] = useState<number>(0);
  const [medallasCount, setMedallasCount] = useState<number>(0);
  const [communityCount, setCommunityCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        // Primero, siempre cargar MI propio profile para saber mi robleId.
        // Asi puedo detectar si estamos viendo mi propio perfil.
        const myProfile = await getProfile().catch(() => null);
        const myRobleId = myProfile?.robleId || myProfile?._id;

        // Detectar si el robleId recibido es el mio
        const accessingOwnProfile = paramIsOwn ||
          (robleIdParam && myRobleId && robleIdParam === myRobleId);

        setIsOwn(accessingOwnProfile === true);

        if (accessingOwnProfile) {
          // MI perfil: cargar datos completos
          const [postsRes, sobriety, camino, myComms] = await Promise.all([
            getUserPosts(),
            getSobrietyTime().catch(() => null),
            getCamino().catch(() => null),
            getMyCommunities(false).catch(() => []),
          ]);
          setProfileData({ ...myProfile, publications: postsRes.length });
          setPosts(postsRes);
          setDaysClean(sobriety?.contador?.dias ?? 0);
          setNivel(camino?.nivel ?? 0);
          setCommunityCount(Array.isArray(myComms) ? myComms.length : 0);
          // Para mi propio perfil, las medallas se cargarian con
          // getMisMedallas que esta en otro service. Por ahora el contador
          // se carga desde la misma vista publica usando getUserPublicProfile
          // SI tengo mi robleId.
          if (myRobleId) {
            try {
              const myPublic = await getUserPublicProfile(myRobleId);
              setMedallasCount(myPublic?.total_medallas ?? 0);
            } catch {
              setMedallasCount(0);
            }
          }
        } else if (robleIdParam) {
          // Perfil PUBLICO de OTRO usuario
          const [publicProfile, postsRes] = await Promise.all([
            getUserPublicProfile(robleIdParam).catch(() => null),
            getUserPostsById(robleIdParam).catch(() => []),
          ]);
          setProfileData({
            ...(publicProfile || {}),
            publications: postsRes.length,
          });
          setPosts(postsRes);
          setDaysClean(publicProfile?.dias_sobrio ?? 0);
          setNivel(publicProfile?.nivel ?? 0);
          setMedallasCount(publicProfile?.total_medallas ?? 0);
          setCommunityCount(publicProfile?.total_comunidades ?? 0);
        }
      } catch (err) {
        console.log('Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [paramIsOwn, robleIdParam]);

  const name = profileData?.nombre || profileData?.name || initialName;
  const rawApodo = profileData?.apodo || '';
  const displayUsername = rawApodo
    ? `@${rawApodo}`
    : `@${(name || 'usuario').toLowerCase().replace(/\s+/g, '')}`;
  const bio = profileData?.descripcion || profileData?.bio || '';
  const avatarUrl = profileData?.avatar_url || null;
  const publications = profileData?.publications ?? 0;
  const levelName = LEVEL_NAMES[nivel] || '';

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
          <Avatar url={avatarUrl} name={name || 'U'} size={88} expandable />
          <Text style={styles.profileName}>{name || 'Usuario'}</Text>
          <Text style={styles.profileUsername}>{displayUsername}</Text>
          {!!bio && <Text style={styles.bio}>{bio}</Text>}

          {isOwn && (
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => navigation.navigate('EditProfileScreen')}
              activeOpacity={0.85}
            >
              <Feather name="edit-2" size={14} color={COLORS.text} />
              <Text style={styles.editProfileBtnText}>Editar perfil</Text>
            </TouchableOpacity>
          )}
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

        {/* Tarjeta motivacional con nivel + dias + medallas */}
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
                <Text style={styles.levelStatNumber}>{daysClean} días</Text>
                <Text style={styles.levelStatLabel}>sin consumo</Text>
              </View>
            </View>
            <View style={styles.levelStatDivider} />
            <View style={styles.levelStat}>
              <View style={[styles.levelStatIconWrapper, { backgroundColor: COLORS.goldLight }]}>
                <Feather name="award" size={20} color={COLORS.gold} />
              </View>
              <View>
                <Text style={styles.levelStatNumber}>{medallasCount} logros</Text>
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
              authorName={name || 'Usuario'}
              authorAvatar={avatarUrl}
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
  profileSection: { alignItems: 'center', marginBottom: 24, gap: 8 },
  profileName: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  profileUsername: { fontSize: 15, color: COLORS.muted },
  bio: { fontSize: 15, color: COLORS.text, lineHeight: 22, textAlign: 'center', paddingHorizontal: 16, marginTop: 8 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.lightMuted, marginTop: 12 },
  editProfileBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  statsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.lightMuted },
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
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
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