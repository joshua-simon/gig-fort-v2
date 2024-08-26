import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';

const CustomSlider = ({ min, max, step, value, onValueChange, unit }) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newValue = calculateValue(gestureState.moveX);
        onValueChange(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const newValue = calculateValue(gestureState.moveX);
        onValueChange(newValue);
      },
    })
  ).current;

  const calculateValue = (x) => {
    const sliderWidth = 280; // This should match the width in styles
    const ratio = Math.max(0, Math.min(1, (x - 20) / sliderWidth));
    const newValue = min + ratio * (max - min);
    return Math.round(newValue / step) * step;
  };

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

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const CustomFilters = () => {
  const [distance, setDistance] = useState(0);
  const [timeInterval, setTimeInterval] = useState(0);

  return (
    <View style={styles.filterContainer}>
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
    </View>
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
  },
});

export default CustomFilters;