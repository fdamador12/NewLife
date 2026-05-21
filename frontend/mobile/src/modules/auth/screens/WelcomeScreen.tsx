import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { initGuest } from '../../../services/guestService';

const MIN_AGE = 18;
const PRIVACY_POLICY_URL = 'https://newlife.openlab.uninorte.edu.co/privacidad';

// JavaScript inyectado en el WebView para detectar cuando el usuario
// llega al final de la página. Envía un mensaje a React Native via postMessage.
const SCROLL_DETECTION_JS = `
  (function() {
    function checkScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      // Consideramos "llegó al final" si queda menos de 50px por hacer scroll
      if (scrollHeight - scrollTop - clientHeight < 50) {
        window.ReactNativeWebView.postMessage('REACHED_BOTTOM');
      }
    }
    window.addEventListener('scroll', checkScroll);
    // También verificamos al cargar por si la página es muy corta
    setTimeout(checkScroll, 1000);
  })();
  true;
`;

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getMaxAllowedDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
}

function getMinAllowedDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - 100, 0, 1);
}

export default function WelcomeScreen({ navigation }: any) {
  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>(getMaxAllowedDate());

  // El picker NO se abre automáticamente — solo cuando el usuario toca el campo
  const [showPicker, setShowPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Paso 2: políticas
  const [ageVerified, setAgeVerified] = useState(false);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);

  // WebView
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  // El botón de "He leído" solo se habilita cuando el usuario llega al final
  const [reachedBottom, setReachedBottom] = useState(false);

  const handleGuest = async () => {
    await initGuest();
    navigation.navigate('Story');
  };

  const handleRegisterPress = () => {
    setErrorMessage('');
    setBirthDate(getMaxAllowedDate());
    setAgeVerified(false);
    setPoliciesAccepted(false);
    // El picker NO se abre aquí — espera a que el usuario toque el campo
    setShowPicker(false);
    setAgeModalVisible(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed') return;
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
      if (errorMessage) setErrorMessage('');
    }
  };

  const handleConfirmAge = () => {
    const age = calculateAge(birthDate);
    if (age < MIN_AGE) {
      setErrorMessage(
        `Lo sentimos. NewLife está dirigida exclusivamente a personas mayores de ${MIN_AGE} años. Si necesitas apoyo, por favor habla con un adulto de confianza o llama a la línea de salud mental 106.`
      );
      return;
    }
    setAgeVerified(true);
    setErrorMessage('');
  };

  const handleConfirmPolicies = () => {
    setAgeModalVisible(false);
    navigation.navigate('Register');
  };

  const handleCancelAge = () => {
    setAgeModalVisible(false);
    setErrorMessage('');
    setAgeVerified(false);
    setPoliciesAccepted(false);
    setShowPicker(false);
  };

  // Recibe mensajes del JavaScript inyectado en el WebView
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === 'REACHED_BOTTOM') {
      setReachedBottom(true);
    }
  };

  const handleOpenWebView = () => {
    setWebViewLoading(true);
    setReachedBottom(false);
    setWebViewVisible(true);
  };

  const handleWebViewAccept = () => {
    setPoliciesAccepted(true);
    setWebViewVisible(false);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/images/character.png')}
          style={styles.character}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>
        New <Text style={styles.titleBold}>Life</Text>
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonPrimaryText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={handleRegisterPress}
        >
          <Text style={styles.buttonSecondaryText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGuest}>
          <Text style={styles.guestText}>Continuar como invitadx</Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal WebView: política de privacidad a pantalla completa ── */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setWebViewVisible(false)}
      >
        <View style={styles.webViewContainer}>
          {/* Header */}
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Política de Privacidad</Text>
            <TouchableOpacity
              style={styles.webViewCloseButton}
              onPress={() => setWebViewVisible(false)}
            >
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Indicador de carga */}
          {webViewLoading && (
            <View style={styles.webViewLoader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.webViewLoaderText}>Cargando política...</Text>
            </View>
          )}

          <WebView
            source={{ uri: PRIVACY_POLICY_URL }}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onMessage={handleWebViewMessage}
            injectedJavaScript={SCROLL_DETECTION_JS}
            style={styles.webView}
          />

          {/* Footer con indicación y botón */}
          <View style={styles.webViewFooter}>
            {!reachedBottom && (
              <View style={styles.scrollHint}>
                <Feather name="arrow-down" size={14} color={colors.textMuted} />
                <Text style={styles.scrollHintText}>
                  Desplázate hasta el final para continuar
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.webViewAcceptButton,
                !reachedBottom && styles.webViewAcceptButtonDisabled,
              ]}
              onPress={handleWebViewAccept}
              disabled={!reachedBottom}
            >
              <Feather name="check" size={18} color={colors.white} />
              <Text style={styles.webViewAcceptText}>He leído la política</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal principal: verificación de edad + políticas ── */}
      <Modal
        visible={ageModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleCancelAge}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* PASO 1: Verificación de edad */}
            {!ageVerified && (
              <>
                <View style={styles.modalIconWrapper}>
                  <Feather name="shield" size={28} color={colors.primary} />
                </View>

                <Text style={styles.modalTitle}>Verificación de edad</Text>
                <Text style={styles.modalSubtitle}>
                  NewLife está dirigida exclusivamente a personas mayores de {MIN_AGE} años.
                  Por favor confirma tu fecha de nacimiento.
                </Text>

                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>Fecha de nacimiento</Text>
                  {/* El picker se abre SOLO cuando el usuario toca este botón */}
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Feather name="calendar" size={18} color={colors.text} />
                    <Text style={styles.dateValue}>{formatDate(birthDate)}</Text>
                    <Feather name="chevron-down" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {showPicker && (
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={getMaxAllowedDate()}
                    minimumDate={getMinAllowedDate()}
                    onChange={handleDateChange}
                    locale="es-ES"
                  />
                )}

                {errorMessage ? (
                  <View style={styles.errorBox}>
                    <Feather name="alert-circle" size={18} color="#FF6B6B" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleCancelAge}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleConfirmAge}
                  >
                    <Text style={styles.modalConfirmText}>Continuar</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.legalNote}>
                  Tu fecha de nacimiento se usa únicamente para verificar tu edad
                  y no se almacena en nuestros servidores.
                </Text>
              </>
            )}

            {/* PASO 2: Aceptación de políticas */}
            {ageVerified && (
              <>
                <View style={styles.modalIconWrapper}>
                  <Feather name="file-text" size={28} color={colors.primary} />
                </View>

                <Text style={styles.modalTitle}>Política de Privacidad</Text>
                <Text style={styles.modalSubtitle}>
                  Antes de crear tu cuenta, lee nuestra Política de Privacidad.
                  Debes llegar al final del documento para poder aceptar.
                </Text>

                <TouchableOpacity
                  style={styles.policyLinkButton}
                  onPress={handleOpenWebView}
                  activeOpacity={0.7}
                >
                  <Feather name="book-open" size={16} color={colors.primary} />
                  <Text style={styles.policyLinkText}>
                    {policiesAccepted ? 'Ver Política de Privacidad' : 'Leer Política de Privacidad'}
                  </Text>
                  {policiesAccepted
                    ? <Feather name="check-circle" size={16} color={colors.primary} />
                    : <Feather name="chevron-right" size={16} color={colors.primary} />
                  }
                </TouchableOpacity>

                {/* Checkbox — solo se puede marcar después de leer */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    if (policiesAccepted) {
                      // Permite desmarcar si quiere releer
                      setPoliciesAccepted(false);
                    } else {
                      // Si no ha leído, lo invita a abrir el WebView primero
                      handleOpenWebView();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, policiesAccepted && styles.checkboxChecked]}>
                    {policiesAccepted && (
                      <Feather name="check" size={14} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    He leído y acepto la Política de Privacidad de NewLife y doy mi
                    consentimiento para el tratamiento de mis datos personales conforme
                    a la Ley 1581 de 2012.
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleCancelAge}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      !policiesAccepted && styles.modalConfirmButtonDisabled,
                    ]}
                    onPress={handleConfirmPolicies}
                    disabled={!policiesAccepted}
                  >
                    <Text style={styles.modalConfirmText}>Crear cuenta</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  imageContainer: {
    marginBottom: spacing.lg,
  },
  character: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: fontSizes.xxl - 2,
    fontWeight: '300',
    color: colors.text,
    marginBottom: spacing.xxl,
  },
  titleBold: {
    fontWeight: '700',
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
  },
  buttonPrimary: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  buttonSecondary: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: '500',
  },
  guestText: {
    color: colors.accent,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
    textDecorationLine: 'underline',
  },

  // WebView
  webViewContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.xxl,
  },
  webViewTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  webViewCloseButton: {
    padding: spacing.xs,
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    zIndex: 10,
  },
  webViewLoaderText: {
    marginTop: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  webView: {
    flex: 1,
  },
  webViewFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  scrollHintText: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  webViewAcceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  webViewAcceptButtonDisabled: {
    opacity: 0.4,
  },
  webViewAcceptText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.md * 2,
    borderTopRightRadius: borderRadius.md * 2,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  modalIconWrapper: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  dateField: {
    gap: spacing.xs,
  },
  dateLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateValue: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FFF0F0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: '#B72E2E',
    lineHeight: 20,
  },
  policyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  policyLinkText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  modalCancelText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalConfirmButtonDisabled: {
    opacity: 0.4,
  },
  modalConfirmText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  legalNote: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});