import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { colors, fontSizes, spacing, borderRadius } from '../../../constants/theme';
import { useAgenda } from '../hooks/useAgenda';
import { getZones, Zone } from '../../../services/zonesService';

const getMapHTML = (zones: Zone[]) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([10.9878, -74.7889], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const zones = ${JSON.stringify(zones)};

    zones.forEach(function(zone) {
      const color = zone.tipo === 'risk' ? '#FF6B6B' : '#4A7BF7';
      L.marker([parseFloat(zone.latitud), parseFloat(zone.longitud)], {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:' + color + ';width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })
      }).addTo(map).bindPopup('<b>' + zone.nombre + '</b>');
    });
  </script>
</body>
</html>
`;

const QUICK_ACTIONS = [
    { key: 'groups', label: 'Grupos', icon: 'users', color: '#406ADF' },
    { key: 'emergency', label: 'Emergencia', icon: 'bell', color: '#406ADF' },
    { key: 'motivation', label: 'Motivación', icon: 'zap', color: '#406ADF' },
    { key: 'content', label: 'Contenido', icon: 'book-open', color: '#406ADF' },
];

function timeToMinutes(timeStr: string): number {
    const [timePart, period] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

export default function CareScreen({ navigation }: any) {
    const { eventos } = useAgenda();
    const [zones, setZones] = useState<Zone[]>([]);

    useEffect(() => {
        getZones()
            .then(setZones)
            .catch(() => {});
    }, []);

    const handleQuickAction = (key: string) => {
        switch (key) {
            case 'groups':
                navigation.navigate('GroupsScreen');
                break;
            case 'emergency':
                navigation.navigate('CareContacts');
                break;
            case 'motivation':
                navigation.navigate('MotivationalScreen');
                break;
            case 'content':
                navigation.navigate('ContentScreen');
                break;
        }
    };

    const isSameDay = (a: Date, b: Date) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const upcomingEvents = eventos
        .filter((e) => isSameDay(e.date, now))
        .filter((e) => timeToMinutes(e.timeFrom) >= currentMinutes)
        .sort((a, b) => timeToMinutes(a.timeFrom) - timeToMinutes(b.timeFrom))
        .slice(0, 2);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Cuidado</Text>
                <Text style={styles.subtitle}>
                    Encuentra grupos de apoyo, contactos de emergencia y contenido útil.
                </Text>

                <Text style={styles.sectionTitle}>Acciones rápidas</Text>
                <View style={styles.actionsGrid}>
                    {QUICK_ACTIONS.map((action) => (
                        <TouchableOpacity
                            key={action.key}
                            style={styles.actionCard}
                            onPress={() => handleQuickAction(action.key)}
                            activeOpacity={0.8}
                        >
                            <Feather name={action.icon as any} size={20} color={action.color} />
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Marcadores de apoyo y riesgo</Text>
                <View style={styles.mapCard}>
                    <WebView
                        source={{ html: getMapHTML(zones) }}
                        style={styles.map}
                        scrollEnabled={false}
                        javaScriptEnabled
                    />
                    <View style={styles.mapFooter}>
                        <Text style={styles.mapFooterText}>
                            Encuentra tus zonas de apoyo y peligro
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ZonesScreen')}>
                            <Text style={styles.mapLink}>Ver más zonas</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.sectionHeaderAgenda}
                    onPress={() => navigation.navigate('AgendaScreen')}
                >
                    <Text style={styles.sectionTitleAgenda}>Agenda</Text>
                    <Feather name="chevron-right" size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.agendaCard}>
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((item, i) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.agendaRow,
                                    i < upcomingEvents.length - 1 && styles.agendaRowBorder,
                                ]}
                            >
                                <Text style={styles.agendaTime}>{item.timeFrom}</Text>
                                <Text style={styles.agendaTitle}>{item.title}</Text>
                            </View>
                        ))
                    ) : (
                        <TouchableOpacity
                            style={styles.emptyAgenda}
                            onPress={() => navigation.navigate('AgendaScreen')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.emptyAgendaEmoji}>📅</Text>
                            <Text style={styles.emptyAgendaText}>
                                No tienes más eventos por hoy
                            </Text>
                            <Text style={styles.emptyAgendaAction}>
                                Agregar evento
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: spacing.xl,
    },
    title: {
        fontSize: fontSizes.xxl,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    sectionTitleAgenda: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    sectionHeaderAgenda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionCard: {
        width: '47%',
        height: 60,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    actionLabel: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: '#406ADF',
    },
    mapCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    map: {
        height: 140,
    },
    mapFooter: {
        padding: spacing.md,
        alignItems: 'center',
        gap: 4,
    },
    mapFooterText: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
    },
    mapLink: {
        fontSize: fontSizes.sm,
        color: colors.accent,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    agendaCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    agendaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
    },
    agendaRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    agendaTime: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        width: 60,
    },
    agendaTitle: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    emptyAgenda: {
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.sm,
    },
    emptyAgendaEmoji: {
        fontSize: 32,
    },
    emptyAgendaText: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        textAlign: 'center',
    },
    emptyAgendaAction: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});