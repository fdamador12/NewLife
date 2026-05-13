import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, spacing } from '../../../constants/theme';

const PRIVACY_POLICY = `
Última actualización: Mayo 2026

1. INFORMACIÓN QUE RECOPILAMOS
NewLife recopila información personal que usted nos proporciona voluntariamente al registrarse, incluyendo nombre, correo electrónico, apodo y datos relacionados con su proceso de recuperación.

2. USO DE LA INFORMACIÓN
La información recopilada se utiliza exclusivamente para:
- Personalizar su experiencia en la aplicación
- Calcular y mostrar su progreso de sobriedad
- Brindarle herramientas de apoyo en su proceso de recuperación

3. ALMACENAMIENTO Y SEGURIDAD
Sus datos se almacenan de forma segura en servidores protegidos. No vendemos, compartimos ni divulgamos su información personal a terceros sin su consentimiento explícito.

4. DATOS SENSIBLES
Reconocemos que la información relacionada con el consumo de sustancias es altamente sensible. Nos comprometemos a tratar estos datos con la máxima confidencialidad y respeto.

5. SUS DERECHOS
Usted tiene derecho a:
- Acceder a sus datos personales
- Corregir información incorrecta
- Solicitar la eliminación de su cuenta y todos sus datos
- Exportar su información

6. ELIMINACIÓN DE DATOS
Al eliminar su cuenta, todos sus datos personales y de progreso serán eliminados permanentemente de nuestros servidores. Esta acción es irreversible.

7. CONTACTO
Si tiene preguntas sobre estas políticas, puede contactarnos a través de la aplicación.

Al usar NewLife, usted acepta estas políticas de privacidad.
`;

export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Políticas de privacidad</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>{PRIVACY_POLICY}</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  scroll: { paddingHorizontal: spacing.xl },
  body: { fontSize: fontSizes.sm, color: colors.textMuted, lineHeight: 22 },
});