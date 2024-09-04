import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, ScrollView, Modal, SafeAreaView, PanResponderGestureState } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface CustomSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  unit: 'km' | 'min';
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: CustomFilters) => void;
  hasLocationPermission: boolean;
}

interface CustomFilters {
  distance: number;
  timeInterval: number;
  genres: string[];
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
  return hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;
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

const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose, onApply, hasLocationPermission }) => {
  const [distance, setDistance] = useState<number>(0);
  const [timeInterval, setTimeInterval] = useState<number>(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const genres: string[] = ["Jazz", "Funk", "Soul", "Neo Soul", "Latin", "Afro-Cuban", "Blues", "Metal", "Folk",
    "Classical", "Indie", "Pop", "Electronic/Dance", "Hip Hop", "Brazilian", "Rock", "Balkan", "Reggae", "Alternative"
  ];

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prevSelected =>
      prevSelected.includes(genre)
        ? prevSelected.filter(g => g !== genre)
        : [...prevSelected, genre]
    );
  };

  const handleApply = () => {
    const filters: CustomFilters = {
      distance,
      timeInterval,
      genres: selectedGenres,
    };
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView 
          style={styles.scrollView}
          scrollEventThrottle={16}
          scrollEnabled={true}
        >
          <View style = {styles.header}>
            <Text style={styles.title}>Custom filters</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Distance</Text>
          {hasLocationPermission ? (
            <CustomSlider
              min={0}
              max={10}
              step={0.1}
              value={distance}
              onValueChange={setDistance}
              unit="km"
            />
          ) : (
            <View style={styles.disabledSliderContainer}>
              <CustomSlider
                min={0}
                max={10}
                step={0.1}
                value={distance}
                onValueChange={() => {}}
                unit="km"
              />
              <View style={styles.disabledOverlay} />
              <Text style={styles.disabledText}>
                Please give Gig Fort permission to use your location in order to utilize distance-based filters
              </Text>
            </View>
          )}
          <Text style={styles.subtitle}>Starts in</Text>
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleApply} style={[styles.button, styles.applyButton]}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    justifyContent:'space-between',
  },
  scrollView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: "NunitoSans",
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    fontFamily: "NunitoSans",
    color: '#333',
  },
  sliderContainer: {
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    height: 60,
    padding:10
  },
  track: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    width: '100%',
  },
  fill: {
    height: 4,
    backgroundColor: '#377D8A',
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#377D8A',
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    marginLeft: -10,
  },
  value: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: "LatoRegular",
    color: '#666',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    paddingBottom: 20
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
    backgroundColor: '#377D8A',
    borderColor: '#377D8A',
  },
  genreText: {
    fontSize: 14,
    color: '#333',
    fontFamily: "LatoRegular",
  },
  selectedText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
  },
  button: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontFamily: "NunitoSans",
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#377D8A',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: "NunitoSans",
    fontWeight: 'bold',
  },
  disabledSliderContainer: {
    position: 'relative',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  disabledText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#000000',
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "LatoRegular",
    padding: 5,
  },
});

export default CustomModal;