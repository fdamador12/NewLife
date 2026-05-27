import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, RefreshControl, Pressable,
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
import { Avatar } from '../components/Avatar';

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
  green: '#4CAF7A',
  greenLight: '#E8F5EE',
  yellow: '#F59E0B',
  yellowLight: '#FEF3C7',
  overlay: 'rgba(64, 64, 64, 0.5)',
};

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

const ESTADO_STYLES: Record<string, { bg: string; text: string }> = {
  ACTIVO: { bg: COLORS.greenLight, text: COLORS.green },
  SUSPENDIDO: { bg: COLORS.yellowLight, text: COLORS.yellow },
  BANEADO: { bg: COLORS.redLight, text: COLORS.red },
};

type Member = {
  id: string;
  usuario_id: string;
  nombre: string;
  email: string;
  avatar_url?: string | null;
  estado: string;
  tipo_acceso: string;
  es_moderador: boolean;
  joined_at: string;
};

function CustomModal({
  visible, title, message, buttons, onClose,
}: {
  visible: boolean; title: string; message?: string;
  buttons: { text: string; style?: 'default' | 'destructive' | 'cancel'; onPress?: () => void }[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          {message && <Text style={styles.modalMessage}>{message}</Text>}
          <View style={styles.modalButtons}>
            {buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.modalBtn, btn.style === 'destructive' && styles.modalBtnDestructive, btn.style === 'cancel' && styles.modalBtnCancel]}
                onPress={() => { onClose(); btn.onPress?.(); }}
              >
                <Text style={[styles.modalBtnText, btn.style === 'destructive' && styles.modalBtnTextDestructive, btn.style === 'cancel' && styles.modalBtnTextCancel]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MemberCard({ member, onMenu }: { member: Member; onMenu: () => void }) {
  const estadoStyle = ESTADO_STYLES[member.estado] || ESTADO_STYLES.ACTIVO;

  return (
    <View style={styles.memberCard}>
      <Avatar url={member.avatar_url} name={member.nombre} size={48} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName} numberOfLines={1}>{member.nombre}</Text>
          {member.es_moderador && (
            <View style={styles.modBadge}>
              <Text style={styles.modBadgeText}>MOD</Text>
            </View>
          )}
          {member.estado !== 'ACTIVO' && (
            <View style={[styles.estadoBadge, { backgroundColor: estadoStyle.bg }]}>
              <Text style={[styles.estadoBadgeText, { color: estadoStyle.text }]}>
                {member.estado}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.memberEmail} numberOfLines={1}>{member.email}</Text>
        <Text style={styles.memberAccess}>{ACCESS_LABELS[member.tipo_acceso] || member.tipo_acceso}</Text>
      </View>
      <TouchableOpacity onPress={onMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="more-vertical" size={20} color={COLORS.muted} />
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

  const [addEmail, setAddEmail] = useState('');
  const [addAccess, setAddAccess] = useState('POSTEAR_COMENTAR');
  const [adding, setAdding] = useState(false);

  const [menuModal, setMenuModal] = useState(false);
  const [menuTarget, setMenuTarget] = useState<Member | null>(null);

  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<Member | null>(null);
  const [suspendDays, setSuspendDays] = useState('');
  const [suspending, setSuspending] = useState(false);

  const [banModal, setBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState<Member | null>(null);
  const [banMotivo, setBanMotivo] = useState('');
  const [banning, setBanning] = useState(false);

  const [accessModal, setAccessModal] = useState(false);
  const [accessTarget, setAccessTarget] = useState<Member | null>(null);

  const [removeModal, setRemoveModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const [successModal, setSuccessModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const fetchMembers = async (force = false) => {
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
      setErrorModal({ visible: true, message: apiError(err, 'Error al cargar miembros.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFetchMembers = useCallback((force = false) => {
    return fetchMembers(force);
  }, [communityId]);

  useEffect(() => {
    handleFetchMembers();
  }, [handleFetchMembers]);

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
      setSuccessModal({ visible: true, message: 'Miembro agregado correctamente.' });
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo agregar el miembro.') });
    } finally {
      setAdding(false);
    }
  };

  const handleChangeAccess = async (newAccess: string) => {
    if (!accessTarget) return;
    setAccessModal(false);
    try {
      await changeMemberAccess(communityId, accessTarget.usuario_id, newAccess);
      await fetchMembers(true);
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo cambiar el acceso.') });
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoveModal(false);
    try {
      await removeMember(communityId, removeTarget.usuario_id);
      await fetchMembers(true);
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo expulsar.') });
    }
  };

  const handleSuspend = async () => {
    const days = parseInt(suspendDays, 10);
    if (!days || days <= 0) {
      setErrorModal({ visible: true, message: 'Ingresa un numero de dias valido.' });
      return;
    }
    setSuspending(true);
    try {
      await suspendMember(communityId, suspendTarget!.usuario_id, days);
      setSuspendModal(false);
      await fetchMembers(true);
      setSuccessModal({ visible: true, message: `${suspendTarget!.nombre} suspendido por ${days} dias.` });
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo suspender.') });
    } finally {
      setSuspending(false);
    }
  };

  const handleBan = async () => {
    if (!banMotivo.trim()) {
      setErrorModal({ visible: true, message: 'Debes ingresar un motivo.' });
      return;
    }
    setBanning(true);
    try {
      await requestBan(communityId, banTarget!.usuario_id, banMotivo.trim());
      setBanModal(false);
      setSuccessModal({ visible: true, message: 'La solicitud de baneo fue enviada al administrador.' });
    } catch (err: any) {
      setErrorModal({ visible: true, message: apiError(err, 'No se pudo enviar la solicitud.') });
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
        <Text style={styles.headerTitle}>Moderacion</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchMembers(true); }}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapper}>
              <Feather name="user-plus" size={18} color={COLORS.muted} />
            </View>
            <Text style={styles.cardTitle}>Agregar miembro</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Correo electronico"
            placeholderTextColor={COLORS.muted}
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
              ? <ActivityIndicator size="small" color={COLORS.white} />
              : <Text style={styles.addBtnText}>Agregar</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar miembro..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Miembros</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filteredMembers.length}</Text>
          </View>
        </View>

        {filteredMembers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Feather name="users" size={32} color={COLORS.muted} />
            </View>
            <Text style={styles.emptyTitle}>Sin miembros</Text>
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

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={suspendModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSuspendModal(false)}>
          <Pressable style={styles.formModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.formModalTitle}>Suspender usuario</Text>
            <Text style={styles.formModalSubtitle}>{suspendTarget?.nombre}</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Numero de dias"
              placeholderTextColor={COLORS.muted}
              value={suspendDays}
              onChangeText={setSuspendDays}
              keyboardType="number-pad"
              autoFocus
            />
            <View style={styles.formModalActions}>
              <TouchableOpacity
                style={styles.formCancelBtn}
                onPress={() => setSuspendModal(false)}
                disabled={suspending}
              >
                <Text style={styles.formCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formConfirmBtn, suspending && styles.btnDisabled]}
                onPress={handleSuspend}
                disabled={suspending}
              >
                {suspending
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={styles.formConfirmText}>Suspender</Text>
                }
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={banModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setBanModal(false)}>
          <Pressable style={styles.formModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.formModalTitle}>Solicitar baneo</Text>
            <Text style={styles.formModalSubtitle}>{banTarget?.nombre}</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Motivo del baneo..."
              placeholderTextColor={COLORS.muted}
              value={banMotivo}
              onChangeText={setBanMotivo}
              multiline
              autoFocus
            />
            <View style={styles.formModalActions}>
              <TouchableOpacity
                style={styles.formCancelBtn}
                onPress={() => setBanModal(false)}
                disabled={banning}
              >
                <Text style={styles.formCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formConfirmBtn, styles.banBtn, banning && styles.btnDisabled]}
                onPress={handleBan}
                disabled={banning}
              >
                {banning
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={styles.formConfirmText}>Solicitar</Text>
                }
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={accessModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setAccessModal(false)}>
          <Pressable style={styles.formModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.formModalTitle}>Cambiar acceso</Text>
            <Text style={styles.formModalSubtitle}>
              Acceso actual: {ACCESS_LABELS[accessTarget?.tipo_acceso || '']}
            </Text>
            <View style={styles.accessModalOptions}>
              {ACCESS_OPTIONS.filter(o => o.value !== accessTarget?.tipo_acceso).map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.accessModalOption}
                  onPress={() => handleChangeAccess(opt.value)}
                >
                  <Feather name="shield" size={18} color={COLORS.muted} />
                  <Text style={styles.accessModalOptionText}>{opt.label}</Text>
                  <Feather name="chevron-right" size={16} color={COLORS.muted} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.formCancelBtnFull}
              onPress={() => setAccessModal(false)}
            >
              <Text style={styles.formCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <CustomModal
        visible={removeModal}
        title="Expulsar miembro"
        message={`Expulsar a ${removeTarget?.nombre} de la comunidad?`}
        buttons={[
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Expulsar', style: 'destructive', onPress: handleRemove },
        ]}
        onClose={() => setRemoveModal(false)}
      />

      <Modal visible={menuModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuModal(false)}
        >
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            <View style={styles.menuHeader}>
              {menuTarget && (
                <Avatar url={menuTarget.avatar_url} name={menuTarget.nombre} size={48} />
              )}
              <View style={styles.menuHeaderInfo}>
                <Text style={styles.menuMemberName} numberOfLines={1}>{menuTarget?.nombre}</Text>
                <Text style={styles.menuMemberEmail} numberOfLines={1}>{menuTarget?.email}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModal(false);
                if (menuTarget) { setAccessTarget(menuTarget); setAccessModal(true); }
              }}
            >
              <View style={styles.menuItemIcon}>
                <Feather name="shield" size={18} color={COLORS.muted} />
              </View>
              <Text style={styles.menuItemText}>Cambiar acceso</Text>
              <Feather name="chevron-right" size={16} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModal(false);
                if (menuTarget) { setSuspendTarget(menuTarget); setSuspendDays(''); setSuspendModal(true); }
              }}
            >
              <View style={styles.menuItemIcon}>
                <Feather name="clock" size={18} color={COLORS.muted} />
              </View>
              <Text style={styles.menuItemText}>Suspender</Text>
              <Feather name="chevron-right" size={16} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModal(false);
                if (menuTarget) { setBanTarget(menuTarget); setBanMotivo(''); setBanModal(true); }
              }}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: COLORS.yellowLight }]}>
                <Feather name="alert-triangle" size={18} color={COLORS.yellow} />
              </View>
              <Text style={[styles.menuItemText, { color: COLORS.yellow }]}>Solicitar baneo</Text>
              <Feather name="chevron-right" size={16} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuModal(false);
                if (menuTarget) { setRemoveTarget(menuTarget); setRemoveModal(true); }
              }}
            >
              <View style={[styles.menuItemIcon, { backgroundColor: COLORS.redLight }]}>
                <Feather name="user-x" size={18} color={COLORS.red} />
              </View>
              <Text style={[styles.menuItemText, { color: COLORS.red }]}>Expulsar de la comunidad</Text>
              <Feather name="chevron-right" size={16} color={COLORS.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCancelBtn}
              onPress={() => setMenuModal(false)}
            >
              <Text style={styles.menuCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <CustomModal
        visible={successModal.visible}
        title="Exito"
        message={successModal.message}
        buttons={[{ text: 'Aceptar', style: 'default' }]}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
      />

      <CustomModal
        visible={errorModal.visible}
        title="Error"
        message={errorModal.message}
        buttons={[{ text: 'Aceptar', style: 'default' }]}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.white },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  cardIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  input: { backgroundColor: COLORS.background, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  accessOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accessChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background },
  accessChipActive: { backgroundColor: COLORS.accent },
  accessChipText: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  accessChipTextActive: { color: COLORS.white, fontWeight: '600' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  btnDisabled: { opacity: 0.5 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, padding: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  badge: { backgroundColor: COLORS.lightMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  memberCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  memberInfo: { flex: 1, gap: 2 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  memberName: { fontSize: 15, fontWeight: '600', color: COLORS.text, flexShrink: 1 },
  memberEmail: { fontSize: 13, color: COLORS.muted },
  memberAccess: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  modBadge: { backgroundColor: COLORS.cream, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  modBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.accent },
  estadoBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  estadoBadgeText: { fontSize: 10, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.lightMuted, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 320 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  modalMessage: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalButtons: { gap: 10 },
  modalBtn: { backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnDestructive: { backgroundColor: COLORS.red },
  modalBtnCancel: { backgroundColor: COLORS.background },
  modalBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  modalBtnTextDestructive: { color: COLORS.white },
  modalBtnTextCancel: { color: COLORS.text },
  formModalContent: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 320, gap: 12 },
  formModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  formModalSubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: -4 },
  formInput: { backgroundColor: COLORS.background, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  formModalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  formCancelBtn: { flex: 1, backgroundColor: COLORS.background, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  formCancelBtnFull: { backgroundColor: COLORS.background, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  formCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  formConfirmBtn: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  formConfirmText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  banBtn: { backgroundColor: COLORS.red },
  accessModalOptions: { gap: 8 },
  accessModalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.background, borderRadius: 14, padding: 14 },
  accessModalOptionText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  menuOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  menuSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  menuHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.lightMuted, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.lightMuted },
  menuHeaderInfo: { flex: 1 },
  menuMemberName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  menuMemberEmail: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 20 },
  menuItemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  menuItemText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  menuCancelBtn: { backgroundColor: COLORS.background, marginHorizontal: 20, marginTop: 12, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  menuCancelText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
});