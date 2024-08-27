import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, ScrollView, Modal, SafeAreaView, PanResponderGestureState } from 'react-native';

interface CustomSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  unit: 'km' | 'min';
}

const CustomSlider: React.FC<CustomSliderProps> = ({ min, max, step, value, onValueChange, unit }) => {
  const sliderWidth = 280;
  const [sliderPosition, setSliderPosition] = useState({ x: 0, y: 0 });

  const calculateValue = (x: number): number => {
    const ratio = Math.max(0, Math.min(1, x / sliderWidth));
    const newValue = min + ratio * (max - min);
    return Math.round(newValue / step) * step;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (event, gestureState: PanResponderGestureState) => {
        const touchX = event.nativeEvent.pageX - sliderPosition.x;
        const newValue = calculateValue(touchX);
        onValueChange(newValue);
      },
      onPanResponderRelease: (event, gestureState: PanResponderGestureState) => {
        const touchX = event.nativeEvent.pageX - sliderPosition.x;
        const newValue = calculateValue(touchX);
        onValueChange(newValue);
      },
    })
  ).current;

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View 
      style={styles.sliderContainer} 
      onLayout={(event) => {
        event.target.measure((x, y, width, height, pageX, pageY) => {
          setSliderPosition({ x: pageX, y: pageY });
        });
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
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

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose }) => {
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
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView 
          style={styles.scrollView}
          scrollEventThrottle={16}
          scrollEnabled={true}
        >
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
        <TouchableOpacity onPress={onClose} style={styles.exitButton}>
          <Text>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
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
  sliderContainer: {
    justifyContent: 'center',
    width: 280,
    alignSelf: 'center',
    height: 60,
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
  exitButton: {
    margin: 20,
    padding: 10,
    backgroundColor: '#DDDDDD',
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default CustomModal;