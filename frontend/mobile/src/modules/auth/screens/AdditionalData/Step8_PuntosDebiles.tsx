import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Feather';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

const mapHTML = (places: Place[]) => `
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
    const map = L.map('map').setView([10.9639, -74.7964], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const places = ${JSON.stringify(places)};
    places.forEach(p => {
      L.marker([p.latitude, p.longitude])
        .addTo(map)
        .bindPopup(p.name);
    });

    if (places.length > 0) {
      map.setView([places[places.length-1].latitude, places[places.length-1].longitude], 15);
    }
  </script>
</body>
</html>
`;

export default function Step8_PuntosDebiles({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const searchPlaces = async (query: string) => {
    setSearch(query);
    if (query.length < 3) {
      setResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await response.json();
      setResults(data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      })));
    } catch (e) {
      console.error(e);
    }
  };

  const selectPlace = (place: Place) => {
    setSelectedPlace(place);
    setSearch(place.name);
    setResults([]);
  };

  const savePlace = () => {
    if (selectedPlace && !savedPlaces.find(p => p.id === selectedPlace.id)) {
      setSavedPlaces([...savedPlaces, selectedPlace]);
      setSelectedPlace(null);
      setSearch('');
    }
  };

  const removePlace = (id: string) => {
    setSavedPlaces(savedPlaces.filter(p => p.id !== id));
  };

  return (
    <StepLayout
      currentStep={8}
      question="¿Dónde están tus puntos débiles?"
      characterImage={require('../../../../assets/images/character9.png')}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Step9')}
      showButton={true}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          {/* Input búsqueda */}
          <View style={styles.inputWrapper}>
            <Icon name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Escribe la dirección / nombre..."
              placeholderTextColor={colors.border}
              value={search}
              onChangeText={searchPlaces}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); setResults([]); setSelectedPlace(null); }}>
                <Icon name="x" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Resultados */}
          {results.length > 0 && (
            <View style={styles.resultsList}>
              {results.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.resultItem}
                  onPress={() => selectPlace(place)}
                >
                  <Icon name="map-pin" size={14} color={colors.accent} />
                  <View style={styles.resultText}>
                    <Text style={styles.resultName} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.resultAddress} numberOfLines={1}>{place.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Lugar seleccionado */}
          {selectedPlace && (
            <View style={styles.selectedPlace}>
              <View style={styles.selectedPlaceInfo}>
                <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
                <Text style={styles.selectedPlaceAddress} numberOfLines={1}>{selectedPlace.address}</Text>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={savePlace}>
                <Icon name="bookmark" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* Mapa WebView */}
          <View style={styles.mapContainer}>
            <WebView
              source={{ html: mapHTML([...savedPlaces, ...(selectedPlace ? [selectedPlace] : [])]) }}
              style={styles.map}
              scrollEnabled={false}
            />
          </View>

          {/* Lista guardados */}
          {savedPlaces.length > 0 && (
            <View style={styles.savedList}>
              {savedPlaces.map((place) => (
                <View key={place.id} style={styles.savedItem}>
                  <Icon name="map-pin" size={14} color={colors.accent} />
                  <Text style={styles.savedName} numberOfLines={1}>{place.name}</Text>
                  <TouchableOpacity onPress={() => removePlace(place.id)}>
                    <Icon name="x" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  inputWrapper: {
    height: 52,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  resultsList: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 3,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  resultAddress: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  selectedPlace: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  selectedPlaceInfo: {
    flex: 1,
  },
  selectedPlaceName: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  selectedPlaceAddress: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  saveButton: {
    padding: spacing.sm,
  },
  mapContainer: {
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  savedList: {
    gap: spacing.xs,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  savedName: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
});