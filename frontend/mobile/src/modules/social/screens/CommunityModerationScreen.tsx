import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { apiError } from '../../../utils/apiError';
import {
  getMembers,
  changeMemberAccess,
  suspendMember,
  requestBan,
  removeMember,
  addMember,
} from '../../../services/communityService';
import { communityCache, CK, TTL } from '../../../services/communityCache';

const ACCESS_LABELS: Record<string, string> = {
  SOLO_VER: 'Solo ver',
  POSTEAR_COMENTAR: 'Postear y comentar',
  CHAT_COMPLETO: 'Chat completo',
};

const ACCESS_OPTIONS = [
  { value: 'SOLO_VER', label: 'Solo ver' },
  { value: 'POSTEAR_COMENTAR', label: 'Postear y comentar' },
  { value: 'CHAT_COMPLETO', label: 'Chat completo' },
];

const ESTADO_COLOR: Record<string, string> = {
  ACTIVO: '#22C55E',
  SUSPENDIDO: '#F59E0B',
  BANEADO: '#EF4444',
};

type Member = {
  id: string;
  usuario_id: string;
  nombre: string;
  email: string;
  estado: string;
  tipo_acceso: string;
  es_moderador: boolean;
  joined_at: string;
};

function MemberCard({ member, onMenu }: { member: Member; onMenu: () => void }) {
  return (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Feather name="user" size={18} color={colors.textMuted} />
      </View>
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName} numberOfLines={1}>{member.nombre}</Text>
          {member.es_moderador && (
            <View style={styles.modBadge}>
              <Text style={styles.modBadgeText}>MOD</Text>
            </View>
          )}
          {member.estado !== 'ACTIVO' && (
            <View style={[styles.estadoBadge, { backgroundColor: ESTADO_COLOR[member.estado] + '20' }]}>
              <Text style={[styles.estadoBadgeText, { color: ESTADO_COLOR[member.estado] }]}>
                {member.estado}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.memberEmail} numberOfLines={1}>{member.email}</Text>
        <Text style={styles.memberAccess}>{ACCESS_LABELS[member.tipo_acceso] || member.tipo_acceso}</Text>
      </View>
      <TouchableOpacity onPress={onMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="more-vertical" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

export default function CommunityModerationScreen({ navigation, route }: any) {
  const { community } = route.params;
  const communityId: string = community.id;

  const [members, setMembers] = useState<Member[]>(
    () => communityCache.peek<Member[]>(CK.members(communityId)) ?? [],
  );
  const [loading, setLoading] = useState(!communityCache.peek(CK.members(communityId)));
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Add member
  const [addEmail, setAddEmail] = useState('');
  const [addAccess, setAddAccess] = useState('POSTEAR_COMENTAR');
  const [adding, setAdding] = useState(false);

  // Member action menu modal
  const [menuModal, setMenuModal] = useState(false);
  const [menuTarget, setMenuTarget] = useState<Member | null>(null);

  // Suspend modal
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<Member | null>(null);
  const [suspendDays, setSuspendDays] = useState('');
  const [suspending, setSuspending] = useState(false);

  // Ban modal
  const [banModal, setBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState<Member | null>(null);
  const [banMotivo, setBanMotivo] = useState('');
  const [banning, setBanning] = useState(false);

  const fetchMembers = useCallback(async (force = false) => {
    if (!force) {
      const fresh = communityCache.get<Member[]>(CK.members(communityId), TTL.members);
      if (fresh) {
        setMembers(fresh);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    }
    try {
      const data = await getMembers(communityId, force);
      setMembers(data);
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'Error al cargar miembros.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [communityId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const filteredMembers = members.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddMember = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      await addMember(communityId, addEmail.trim(), addAccess);
      setAddEmail('');
      await fetchMembers(true);
      Alert.alert('Éxito', 'Miembro agregado correctamente.');
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo agregar el miembro.'));
    } finally {
      setAdding(false);
    }
  };

  const handleChangeAccess = (member: Member) => {
    const options = ACCESS_OPTIONS.filter(o => o.value !== member.tipo_acceso);
    Alert.alert(
      'Cambiar acceso',
      `Acceso actual: ${ACCESS_LABELS[member.tipo_acceso]}`,
      [
        ...options.map(o => ({
          text: o.label,
          onPress: async () => {
            try {
              await changeMemberAccess(communityId, member.usuario_id, o.value);
              await fetchMembers(true);
            } catch (err: any) {
              Alert.alert('Error', apiError(err, 'No se pudo cambiar el acceso.'));
            }
          },
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    );
  };

  const handleRemove = (member: Member) => {
    Alert.alert(
      'Expulsar miembro',
      `¿Expulsar a ${member.nombre} de la comunidad?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Expulsar', style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(communityId, member.usuario_id);
              await fetchMembers(true);
            } catch (err: any) {
              Alert.alert('Error', apiError(err, 'No se pudo expulsar.'));
            }
          },
        },
      ],
    );
  };

  const handleSuspend = async () => {
    const days = parseInt(suspendDays, 10);
    if (!days || days <= 0) {
      Alert.alert('Error', 'Ingresa un número de días válido.');
      return;
    }
    setSuspending(true);
    try {
      await suspendMember(communityId, suspendTarget!.usuario_id, days);
      setSuspendModal(false);
      await fetchMembers(true);
      Alert.alert('Éxito', `${suspendTarget!.nombre} suspendido por ${days} días.`);
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo suspender.'));
    } finally {
      setSuspending(false);
    }
  };

  const handleBan = async () => {
    if (!banMotivo.trim()) {
      Alert.alert('Error', 'Debes ingresar un motivo.');
      return;
    }
    setBanning(true);
    try {
      await requestBan(communityId, banTarget!.usuario_id, banMotivo.trim());
      setBanModal(false);
      Alert.alert('Solicitud enviada', 'La solicitud de baneo fue enviada al administrador.');
    } catch (err: any) {
      Alert.alert('Error', apiError(err, 'No se pudo enviar la solicitud.'));
    } finally {
      setBanning(false);
    }
  };

  const showMemberMenu = (member: Member) => {
    setMenuTarget(member);
    setMenuModal(true);
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
        <Text style={styles.headerTitle}>Moderación</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchMembers(true); }}
            colors={[colors.primary]}
          />
        }
      >
        {/* Add member card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Agregar miembro</Text>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={colors.textMuted}
            value={addEmail}
            onChangeText={setAddEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.fieldLabel}>Tipo de acceso</Text>
          <View style={styles.accessOptions}>
            {ACCESS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.accessChip, addAccess === opt.value && styles.accessChipActive]}
                onPress={() => setAddAccess(opt.value)}
              >
                <Text style={[styles.accessChipText, addAccess === opt.value && styles.accessChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, (!addEmail.trim() || adding) && styles.btnDisabled]}
            onPress={handleAddMember}
            disabled={!addEmail.trim() || adding}
          >
            {adding
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={styles.addBtnText}>Agregar</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar miembro..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionLabel}>
          {filteredMembers.length} miembro{filteredMembers.length !== 1 ? 's' : ''}
        </Text>

        {filteredMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={36} color={colors.border} />
            <Text style={styles.emptyText}>No se encontraron miembros</Text>
          </View>
        ) : (
          filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onMenu={() => showMemberMenu(member)}
            />
          ))
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Suspend Modal */}
      <Modal visible={suspendModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Suspender usuario</Text>
            <Text style={styles.modalSubtitle}>{suspendTarget?.nombre}</Text>
            <TextInput
              style={styles.input}
              placeholder="Número de días"
              placeholderTextColor={colors.textMuted}
              value={suspendDays}
              onChangeText={setSuspendDays}
              keyboardType="number-pad"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSuspendModal(false)}
                disabled={suspending}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, suspending && styles.btnDisabled]}
                onPress={handleSuspend}
                disabled={suspending}
              >
                {suspending
                  ? <ActivityIndicator size="small" color={colors.white} />
                  : <Text style={styles.modalConfirmText}>Suspender</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ban Modal */}
      <Modal visible={banModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitar baneo</Text>
            <Text style={styles.modalSubtitle}>{banTarget?.nombre}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Motivo del baneo..."
              placeholderTextColor={colors.textMuted}
              value={banMotivo}
              onChangeText={setBanMotivo}
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBanModal(false)}
                disabled={banning}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, styles.banBtn, banning && styles.btnDisabled]}
                onPress={handleBan}
                disabled={banning}
              >
                {banning
                  ? <ActivityIndicator size="small" color={colors.white} />
                  : <Text style={styles.modalConfirmText}>Solicitar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Member action menu */}
      <Modal visible={menuModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuModal(false)}
        >
          <View style={styles.menuSheet}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuMemberName} numberOfLines={1}>{menuTarget?.nombre}</Text>
              <Text style={styles.menuMemberEmail} numberOfLines={1}>{menuTarget?.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setMenuModal(false); menuTarget && handleChangeAccess(menuTarget); }}
            >
              <Feather name="shield" size={18} color={colors.text} />
              <Text style={styles.menuItemText}>Cambiar acceso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModal(false);
                if (menuTarget) { setSuspendTarget(menuTarget); setSuspendDays(''); setSuspendModal(true); }
              }}
            >
              <Feather name="clock" size={18} color={colors.text} />
              <Text style={styles.menuItemText}>Suspender</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModal(false);
                if (menuTarget) { setBanTarget(menuTarget); setBanMotivo(''); setBanModal(true); }
              }}
            >
              <Feather name="alert-triangle" size={18} color="#F59E0B" />
              <Text style={[styles.menuItemText, { color: '#F59E0B' }]}>Solicitar baneo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => { setMenuModal(false); menuTarget && handleRemove(menuTarget); }}
            >
              <Feather name="user-x" size={18} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Expulsar de la comunidad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs }]}
              onPress={() => setMenuModal(false)}
            >
              <Text style={[styles.menuItemText, { textAlign: 'center', flex: 1 }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg,
  },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },

  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },

  card: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.lg,
    gap: spacing.sm, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },

  input: {
    backgroundColor: colors.background, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSizes.sm, color: colors.text,
    borderWidth: 1, borderColor: colors.border,
  },
  textArea: { height: 80, textAlignVertical: 'top' },

  fieldLabel: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textMuted, marginTop: spacing.xs },

  accessOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  accessChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  accessChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  accessChipText: { fontSize: fontSizes.xs, color: colors.textMuted, fontWeight: '500' },
  accessChipTextActive: { color: colors.primary, fontWeight: '700' },

  addBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs,
  },
  addBtnText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.white },
  btnDisabled: { opacity: 0.4 },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSizes.sm, color: colors.text, padding: 0 },

  sectionLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textMuted },

  memberCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  memberInfo: { flex: 1, gap: 2 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  memberName: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.text, flexShrink: 1 },
  memberEmail: { fontSize: fontSizes.xs, color: colors.textMuted },
  memberAccess: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },

  modBadge: {
    backgroundColor: colors.primary + '20', borderRadius: borderRadius.full,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  modBadgeText: { fontSize: 9, fontWeight: '800', color: colors.primary },

  estadoBadge: { borderRadius: borderRadius.full, paddingHorizontal: 6, paddingVertical: 1 },
  estadoBadgeText: { fontSize: 9, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingTop: spacing.xl * 2, gap: spacing.md },
  emptyText: { fontSize: fontSizes.md, color: colors.textMuted },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.xl, width: '100%', gap: spacing.md,
  },
  modalTitle: { fontSize: fontSizes.md, fontWeight: '800', color: colors.text },
  modalSubtitle: { fontSize: fontSizes.sm, color: colors.textMuted, marginTop: -spacing.xs },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  modalCancelBtn: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm, alignItems: 'center',
  },
  modalCancelText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
  modalConfirmBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm, alignItems: 'center',
  },
  modalConfirmText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.white },
  banBtn: { backgroundColor: '#EF4444' },

  // Member action menu (bottom sheet)
  menuOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingBottom: 32,
  },
  menuHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuMemberName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  menuMemberEmail: { fontSize: fontSizes.sm, color: colors.textMuted, marginTop: 2 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
  },
  menuItemDanger: {},
  menuItemText: { fontSize: fontSizes.md, color: colors.text },
});
