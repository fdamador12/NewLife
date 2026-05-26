import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Retorna el padding bottom correcto para botones fijos en la parte inferior.
 * Tiene en cuenta la barra de navegación de Android (3 botones) y el home
 * indicator de iOS.
 *
 * Uso:
 *   const bottomInset = useBottomInset();
 *   <View style={{ paddingBottom: bottomInset }}>
 *     <TouchableOpacity>...</TouchableOpacity>
 *   </View>
 */
export function useBottomInset(minPadding = 24): number {
  const insets = useSafeAreaInsets();
  return Math.max(minPadding, insets.bottom + 16);
}