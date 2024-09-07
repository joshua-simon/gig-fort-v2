import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface ReminderPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (minutes: number) => void;
}

const ReminderPopup: React.FC<ReminderPopupProps> = ({ isVisible, onClose, onApply }) => {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const timeOptions = [15, 30, 60];

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Set reminder for:</Text>
          {timeOptions.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.button,
                selectedTime === time && styles.selectedButton
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={styles.buttonText}>
                {time === 60 ? '1 hour' : `${time} minutes`} before
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText_cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={() => selectedTime && onApply(selectedTime)}
              disabled={!selectedTime}
            >
              <Text style={styles.buttonText_apply}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#F0F0F0',
    marginVertical: 5,
    width: "auto",
  },
  selectedButton: {
    backgroundColor: '#377D8A',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'NunitoSans'
  },
  buttonText_apply: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'NunitoSans'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 10,
  },
  buttonText_cancel: {
    color:'#377D8A'
  },
  applyButton: {
    backgroundColor: '#377D8A',
    marginLeft: 10,
  },
});

export default ReminderPopup;