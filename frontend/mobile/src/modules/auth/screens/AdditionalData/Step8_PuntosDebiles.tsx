import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import StepLayout from '../../components/StepLayout';
import { colors, fontSizes, spacing, borderRadius } from '../../../../constants/theme';

const INPUT_HEIGHT = 52;

type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export default function Step8_PuntosDebiles({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [region, setRegion] = useState({
    latitude: 10.9639,
    longitude: -74.7964,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const searchPlaces = async (query: string) => {
    setSearch(query);
    if (query.length < 3) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=co`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await response.json();
      const places = data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
      setResults(places);
    } catch (error) {
      console.error('Error buscando lugares:', error);
    }
  };

  const selectPlace = (place: Place) => {
    setSelectedPlace(place);
    setSearch(place.name);
    setResults([]);
    setRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
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

        {/* Resultados de búsqueda */}
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

        {/* Lugar seleccionado para guardar */}
        {selectedPlace && (
          <View style={styles.selectedPlace}>
            <View style={styles.selectedPlaceInfo}>
              <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
              <Text style={styles.selectedPlaceAddress} numberOfLines={1}>
                {selectedPlace.address}
              </Text>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={savePlace}>
              <Icon name="bookmark" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Mapa */}
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          {savedPlaces.map((place) => (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              title={place.name}
            />
          ))}
          {selectedPlace && (
            <Marker
              coordinate={{ latitude: selectedPlace.latitude, longitude: selectedPlace.longitude }}
              title={selectedPlace.name}
              pinColor={colors.accent}
            />
          )}
        </MapView>

        {/* Lista de lugares guardados */}
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
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
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
  map: {
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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