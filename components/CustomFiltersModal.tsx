import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import MultiSelect from 'react-native-multiple-select'; 

interface CustomFiltersModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: CustomFilters) => void;
}

interface CustomFilters {
  timeFrame: number;
  distance: number;
  genres: string[];
}

const genresList = [
  { id: '1', name: 'Rock' },
  { id: '2', name: 'Pop' },
  { id: '3', name: 'Jazz' },
  { id: '4', name: 'Classical' },
  { id: '5', name: 'Electronic' },
  // Add more genres as needed
];

const CustomFiltersModal: React.FC<CustomFiltersModalProps> = ({ isVisible, onClose, onApply }) => {
  const [timeFrame, setTimeFrame] = useState(60); // Default to 1 hour
  const [distance, setDistance] = useState(5); // Default to 5km
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleApply = () => {
    onApply({ timeFrame, distance, genres: selectedGenres });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Custom Filters</Text>

          <Text style={styles.label}>Select Time Frame</Text>
          <Slider
            style={styles.slider}
            value={timeFrame}
            onValueChange={setTimeFrame}
            minimumValue={30}
            maximumValue={240}
            step={30}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#000000"
          />
          <Text style={styles.value}>{timeFrame} minutes</Text>

          <Text style={styles.label}>Select Distance</Text>
          <Slider
            style={styles.slider}
            value={distance}
            onValueChange={setDistance}
            minimumValue={1}
            maximumValue={50}
            step={1}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#000000"
          />
          <Text style={styles.value}>{distance} km</Text>

          <Text style={styles.label}>Select Genres</Text>
          <MultiSelect
            items={genresList}
            uniqueKey="id"
            onSelectedItemsChange={setSelectedGenres}
            selectedItems={selectedGenres}
            selectText="Pick Genres"
            searchInputPlaceholderText="Search Genres..."
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor="#CCC"
            submitButtonText="Submit"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleApply}>
              <Text style={styles.buttonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  value: {
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default CustomFiltersModal;