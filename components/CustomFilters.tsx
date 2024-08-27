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