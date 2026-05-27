import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Genera un color hash estable a partir del nombre. El mismo nombre siempre
 * dara el mismo color, asi cada usuario sin foto se ve consistente entre
 * vistas y sesiones.
 */
function hashColor(name: string): string {
    const colors = [
        '#D38A58', '#5B8DEF', '#406ADF', '#E9B44C',
        '#7BB661', '#E25C5C', '#9C6ADE', '#FF6B6B',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i);
        hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
}

function initials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p.charAt(0).toUpperCase()).join('') || 'U';
}

type Props = {
    url?: string | null;
    name: string;
    size?: number;
    expandable?: boolean;
    onPress?: () => void;
    style?: any;
};

/**
 * Avatar reusable con:
 *  - Imagen si hay url
 *  - Iniciales con color hash estable si no hay url
 *  - Opcionalmente expandible al tocar (modal pantalla completa SIN boton X)
 *  - Se cierra el modal tocando cualquier parte del fondo
 *
 * El modal nunca muestra un boton de cerrar visible — la interaccion es
 * "tocar para abrir, tocar fuera para cerrar". Mas limpio y consistente
 * con como funcionan las fotos de perfil en Instagram, WhatsApp, etc.
 */
export function Avatar({
    url,
    name,
    size = 44,
    expandable = false,
    onPress,
    style,
}: Props) {
    const [modalVisible, setModalVisible] = useState(false);

    const radius = size / 2;
    const bgColor = hashColor(name || 'User');
    const fontSize = Math.floor(size * 0.4);
    const userInitials = initials(name);

    const handlePress = () => {
        if (expandable && url) {
            setModalVisible(true);
        } else if (onPress) {
            onPress();
        }
    };

    const isInteractive = expandable || onPress;

    const avatarContent = url ? (
        <Image
            source={{ uri: url }}
            style={{ width: size, height: size, borderRadius: radius }}
            resizeMode="cover"
        />
    ) : (
        <View
            style={[
                styles.initialsContainer,
                { width: size, height: size, borderRadius: radius, backgroundColor: bgColor },
            ]}
        >
            <Text style={[styles.initialsText, { fontSize }]}>{userInitials}</Text>
        </View>
    );

    return (
        <>
            {isInteractive ? (
                <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={style}>
                    {avatarContent}
                </TouchableOpacity>
            ) : (
                <View style={style}>{avatarContent}</View>
            )}

            {/* Modal pantalla completa — solo se ve si expandable=true y hay url */}
            {expandable && url && (
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setModalVisible(false)}
                    >
                        <Image
                            source={{ uri: url }}
                            style={styles.expandedImage}
                            resizeMode="contain"
                        />
                    </Pressable>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    initialsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    modalOverlay: {
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