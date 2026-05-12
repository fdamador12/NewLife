import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { initGuest } from '../../../services/guestService';

// Edad minima requerida para registrarse en la app.
// Conforme a la politica de privacidad seccion 15.1 y a la Health App Policy
// de Google Play, NewLife esta dirigida exclusivamente a personas mayores de
// 18 anos por manejar datos sensibles de salud y consumo de sustancias.
const MIN_AGE = 18;

// Calcula la edad exacta a partir de la fecha de nacimiento.
// IMPORTANTE: hace el calculo considerando mes y dia, no solo el ano.
// Una persona nacida el 31 dic 2007 NO tiene 18 anos el 1 ene 2026,
// los cumple el 31 dic 2025. Esta funcion lo maneja correctamente.
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Si aun no ha cumplido este ano, restar 1 al age
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Fecha maxima permitida = hoy menos 18 anos.
// Esto evita que el picker permita seleccionar fechas que claramente serian
// de menores de edad. Es una pre-validacion visual en el picker.
function getMaxAllowedDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate());
}

// Fecha minima razonable: 100 anos atras. Evita fechas absurdas en el picker.
function getMinAllowedDate(): Date {
  const today = new Date();
  return new Date(today.getFullYear() - 100, 0, 1);
}

export default function WelcomeScreen({ navigation }: any) {
  // Estado del modal de verificacion de edad
  const [ageModalVisible, setAgeModalVisible] = useState(false);

  // Fecha seleccionada en el picker. Default: hace 18 anos exactos
  // (asi el usuario empieza desde una fecha valida y puede ajustar).
  const [birthDate, setBirthDate] = useState<Date>(getMaxAllowedDate());

  // Flag para mostrar el picker nativo en Android (se cierra al seleccionar)
  const [showPicker, setShowPicker] = useState(false);

  // Mensaje de error a mostrar si el usuario es menor de edad
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGuest = async () => {
    await initGuest();
    navigation.navigate('Story');
  };

  // Al tocar "Registrarse" abrimos el modal de verificacion antes de navegar
  const handleRegisterPress = () => {
    setErrorMessage('');
    setBirthDate(getMaxAllowedDate());
    setAgeModalVisible(true);
    // En Android el picker es un dialogo nativo que se abre directamente
    if (Platform.OS === 'android') {
      setShowPicker(true);
    }
  };

  // Handler del picker. En Android se llama una vez al seleccionar/cancelar.
  // En iOS se llama cada vez que el usuario gira la rueda, asi que solo
  // actualizamos el estado sin tomar accion final.
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      // Si el usuario cancela el picker en Android, event.type === 'dismissed'
      if (event.type === 'dismissed') {
        return;
      }
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
      // Si el usuario cambia la fecha, limpiamos el error previo
      if (errorMessage) setErrorMessage('');
    }
  };

  // Valida la edad y continua al registro si es mayor de 18
  const handleConfirmAge = () => {
    const age = calculateAge(birthDate);

    if (age < MIN_AGE) {
      // Mensaje amable, no acusatorio. Estos usuarios pueden ser ninos vulnerables
      // a quienes la app no esta dirigida pero podrian beneficiarse de apoyo profesional.
      setErrorMessage(
        `Lo sentimos. NewLife está dirigida exclusivamente a personas mayores de ${MIN_AGE} años. Si necesitas apoyo, por favor habla con un adulto de confianza o llama a la línea de salud mental 106.`
      );
      return;
    }

    // Edad valida, cerramos modal y navegamos al registro
    setAgeModalVisible(false);
    navigation.navigate('Register');
  };

  const handleCancelAge = () => {
    setAgeModalVisible(false);
    setErrorMessage('');
  };

  // Formato amigable de fecha para mostrar al usuario
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

      {/* Modal de verificacion de edad. Se muestra antes de permitir el registro. */}
      <Modal
        visible={ageModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleCancelAge}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Header con icono */}
            <View style={styles.modalIconWrapper}>
              <Feather name="shield" size={28} color={colors.primary} />
            </View>

            <Text style={styles.modalTitle}>Verificación de edad</Text>
            <Text style={styles.modalSubtitle}>
              NewLife está dirigida exclusivamente a personas mayores de {MIN_AGE} años.
              Por favor confirma tu fecha de nacimiento.
            </Text>

            {/* Selector de fecha. En iOS muestra el picker inline; en Android se abre el dialogo. */}
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Fecha de nacimiento</Text>
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

            {/* Picker nativo. En iOS lo mostramos inline. En Android se renderiza
                como dialogo modal nativo cuando showPicker es true. */}
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

            {/* Mensaje de error si el usuario es menor de edad */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Botones del modal */}
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

            {/* Nota legal pequena */}
            <Text style={styles.legalNote}>
              Tu fecha de nacimiento se usa únicamente para verificar tu edad
              y no se almacena en nuestros servidores.
            </Text>
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

  // Estilos del modal de verificacion de edad
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