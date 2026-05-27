import React, { useState } from 'react';
import {
    View, Image, TouchableOpacity, Modal, Pressable, StyleSheet,
    Dimensions, StatusBar, Platform,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_ASPECT_RATIO = 0.8;
const MAX_ASPECT_RATIO = 2.5;

type Props = {
    uri: string;
    borderRadius?: number;
    style?: any;
    /**
     * Si false, la imagen se muestra como un Image normal sin posibilidad de
     * agrandar al tocar. Usa esto en el feed donde el toque debe ir al
     * PostDetail, no a la imagen expandida.
     */
    expandable?: boolean;
    onPress?: () => void;
};

/**
 * Componente reusable que muestra una imagen con aspect ratio dinamico.
 *
 * MODOS:
 *  - expandable=true (default): tocar abre modal fullscreen.
 *  - expandable=false: tocar dispara onPress (usado en el feed para
 *    navegar al PostDetail en lugar de abrir el modal).
 *
 * DISEÑO:
 *  - Aspect ratio se calcula con Image.getSize y se LIMITA a [0.8, 2.5]
 *    para evitar imagenes super largas que rompen el scroll.
 *  - Imagenes verticales extremas se recortan en cover (5:4).
 *  - Imagenes horizontales extremas se recortan en cover (5:2).
 *  - En el modal expandido, la imagen se ve COMPLETA (contain).
 *
 * MODAL FULLSCREEN (estilo Instagram/WhatsApp):
 *  - Fondo NEGRO SOLIDO que cubre TODA la pantalla incluyendo status bar.
 *  - StatusBar se oscurece (translucent + barStyle light).
 *  - El usuario cierra tocando cualquier zona — sin boton X visible.
 *  - Imagen centrada verticalmente con resizeMode='contain'.
 */
export function ExpandableImage({ uri, borderRadius = 12, style, expandable = true, onPress }: Props) {
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const [expanded, setExpanded] = useState(false);

    React.useEffect(() => {
        Image.getSize(
            uri,
            (w, h) => setAspectRatio(w / h),
            () => setAspectRatio(1),
        );
    }, [uri]);

    const displayRatio = Math.max(
        MIN_ASPECT_RATIO,
        Math.min(MAX_ASPECT_RATIO, aspectRatio),
    );

    const handlePress = () => {
        if (expandable) {
            setExpanded(true);
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <>
            <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
                <Image
                    source={{ uri }}
                    style={[
                        { width: '100%', aspectRatio: displayRatio, borderRadius, backgroundColor: '#E8E8E8' },
                        style,
                    ]}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            <Modal
                visible={expanded}
                transparent={false}
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setExpanded(false)}
            >
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="#000"
                    translucent={false}
                />
                <Pressable style={styles.fullscreenOverlay} onPress={() => setExpanded(false)}>
                    <Image
                        source={{ uri }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                    />
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    /**
     * Overlay NEGRO SOLIDO que cubre TODA la pantalla, incluyendo barras del
     * sistema. Usamos transparent={false} en el Modal para que sea opaco y
     * statusBarTranslucent para que cubra status bar en Android.
     */
    fullscreenOverlay: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
});