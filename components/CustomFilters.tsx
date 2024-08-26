import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, ScrollView, PanResponderGestureState } from 'react-native';

interface CustomSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  unit: 'km' | 'min';
}

const CustomSlider: React.FC<CustomSliderProps> = ({ min, max, step, value, onValueChange, unit }) => {
  const calculateValue = (x: number): number => {
    const sliderWidth = 280; // This should match the width in styles
    const ratio = Math.max(0, Math.min(1, (x - 20) / sliderWidth));
    const newValue = min + ratio * (max - min);
    return Math.round(newValue / step) * step;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        const newValue = calculateValue(gestureState.moveX);
        onValueChange(newValue);
      },
      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        const newValue = calculateValue(gestureState.moveX);
        onValueChange(newValue);
      },
    })
  ).current;

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.track} {...panResponder.panHandlers}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
        <View style={[styles.thumb, { left: `${percentage}%` }]} />
      </View>
      <Text style={styles.value}>
        {unit === 'km' ? `${value.toFixed(1)} km` : formatTime(value)}
      </Text>
    </View>
  );
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

interface GenreSelectorProps {
  genres: string[];
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ genres, selectedGenres, onGenreToggle }) => {
  const renderGenreChip = (genre: string) => {
    const isSelected = selectedGenres.includes(genre);
    return (
      <TouchableOpacity
        key={genre}
        style={[styles.genreChip, isSelected && styles.selectedChip]}
        onPress={() => onGenreToggle(genre)}
      >
        <Text style={[styles.genreText, isSelected && styles.selectedText]}>
          {genre}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.chipContainer}>
      {genres.map(renderGenreChip)}
    </View>
  );
};

const CustomFilters: React.FC = () => {
  const [distance, setDistance] = useState<number>(0);
  const [timeInterval, setTimeInterval] = useState<number>(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const genres: string[] = ["Jazz", "Funk", "Soul", "Neo Soul", "Latin", "Afro-Cuban"];

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prevSelected =>
      prevSelected.includes(genre)
        ? prevSelected.filter(g => g !== genre)
        : [...prevSelected, genre]
    );
  };

  return (
    <ScrollView style={styles.filterContainer}>
      <Text style={styles.title}>Custom filters</Text>
      <Text style={styles.subtitle}>Distance</Text>
      <CustomSlider
        min={0}
        max={10}
        step={0.1}
        value={distance}
        onValueChange={setDistance}
        unit="km"
      />
      <Text style={styles.subtitle}>Time Interval</Text>
      <CustomSlider
        min={0}
        max={60}
        step={1}
        value={timeInterval}
        onValueChange={setTimeInterval}
        unit="min"
      />
      <Text style={styles.subtitle}>Genres</Text>
      <GenreSelector
        genres={genres}
        selectedGenres={selectedGenres}
        onGenreToggle={toggleGenre}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: 60,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    width: 280,
  },
  fill: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    marginLeft: -10,
  },
  value: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  filterContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    fontFamily: "NunitoSans"
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  genreChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genreText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
});

export default CustomFilters;