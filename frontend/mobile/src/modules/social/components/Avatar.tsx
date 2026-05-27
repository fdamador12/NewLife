import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet,
    Modal, Pressable, Dimensions, StatusBar,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
 * Avatar reusable. Estilo del modal fullscreen igual al de ExpandableImage:
 * fondo negro solido que cubre TODA la pantalla, cierra al tocar fuera,
 * sin boton X. Inspirado en Instagram/WhatsApp.
 */
export function Avatar({
    url, name, size = 44, expandable = false, onPress, style,
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

            {expandable && url && (
                <Modal
                    visible={modalVisible}
                    transparent={false}
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={() => setModalVisible(false)}
                >
                    <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
                    <Pressable style={styles.fullscreenOverlay} onPress={() => setModalVisible(false)}>
                        <Image
                            source={{ uri: url }}
                            style={styles.fullscreenImage}
                            resizeMode="contain"
                        />
                    </Pressable>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    initialsContainer: { alignItems: 'center', justifyContent: 'center' },
    initialsText: { color: '#FFFFFF', fontWeight: '700' },
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