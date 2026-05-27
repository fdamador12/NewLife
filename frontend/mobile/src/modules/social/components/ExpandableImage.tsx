import React, { useState } from 'react';
import {
    View, Image, TouchableOpacity, Modal, Pressable, StyleSheet, Dimensions,
} from 'react-native';

/**
 * Componente reusable que muestra una imagen con aspect ratio dinamico,
 * y al tocarla la abre en modo pantalla completa sin botones.
 * El usuario cierra tocando fuera de la imagen (en cualquier zona negra).
 *
 * Diseño:
 *  - Aspect ratio se calcula con Image.getSize y se LIMITA a [0.8, 2.5]
 *    para evitar imagenes super largas que rompen el scroll del feed.
 *  - Cuando aspectRatio < 0.8 (vertical extremo): se recorta en cover
 *    para encajar en proporcion 0.8 (5:4 vertical).
 *  - Cuando aspectRatio > 2.5 (horizontal extremo): se recorta en cover
 *    para encajar en proporcion 2.5 (5:2 horizontal).
 *  - En el modal expandido, la imagen se ve COMPLETA (resizeMode contain)
 *    para que el usuario vea todo el contenido aunque haya sido recortada
 *    en el feed.
 */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MIN_ASPECT_RATIO = 0.8;   // vertical maximo (5:4) — recorta arriba/abajo
const MAX_ASPECT_RATIO = 2.5;   // horizontal maximo (5:2) — recorta laterales

type Props = {
    uri: string;
    borderRadius?: number;
    style?: any;
};

export function ExpandableImage({ uri, borderRadius = 12, style }: Props) {
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const [expanded, setExpanded] = useState(false);

    React.useEffect(() => {
        Image.getSize(
            uri,
            (w, h) => setAspectRatio(w / h),
            () => setAspectRatio(1),
        );
    }, [uri]);

    // Limitar el aspect ratio para que no rompa el feed
    const displayRatio = Math.max(
        MIN_ASPECT_RATIO,
        Math.min(MAX_ASPECT_RATIO, aspectRatio),
    );

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setExpanded(true)}
            >
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
                transparent
                animationType="fade"
                onRequestClose={() => setExpanded(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setExpanded(false)}
                >
                    <Image
                        source={{ uri }}
                        style={styles.expandedImage}
                        resizeMode="contain"
                    />
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.85,
    },
});