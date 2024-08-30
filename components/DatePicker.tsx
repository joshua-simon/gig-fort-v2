import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { format, addDays, isSameDay } from 'date-fns';

interface DatePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

const DatePicker: React.FC<DatePickerProps> = ({ isVisible, onClose, onDateSelect, selectedDate }) => {
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const slideAnim = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;

  useEffect(() => {
    const today = new Date();
    const range: Date[] = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    setDateRange(range);
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const formatDateForDisplay = (date: Date): string => {
    if (isSameDay(date, new Date())) {
      return `Today, ${format(date, 'do MMMM')}`;
    }
    return format(date, 'EEE do MMMM');
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Select Date</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
        {dateRange.map((date) => (
          <TouchableOpacity
            key={date.toISOString()}
            style={[
              styles.dateItem,
              isSameDay(date, selectedDate) && styles.selectedDateItem
            ]}
            onPress={() => {
              onDateSelect(date);
              onClose();
            }}
          >
            <Text style={[
              styles.dateText,
              isSameDay(date, selectedDate) && styles.selectedDateText
            ]}>
              {formatDateForDisplay(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans'
  },
  closeButton: {
    fontSize: 16,
    color: '#377D8A',
    fontFamily: 'NunitoSans'
  },
  dateItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedDateItem: {
    backgroundColor: '#e6f3f5',
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'LatoRegular'
  },
  selectedDateText: {
    fontWeight: 'bold',
    color: '#377D8A',
  },
});

export default DatePicker;