import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Entypo } from '@expo/vector-icons';

const TicketPriceComponent = ({ ticketInfo, tickets }) => {
  const handleTicketPress = () => {
    if (tickets) {
      Linking.openURL(tickets).catch((err) => console.error("Couldn't load page", err));
    }
  };

  const formatPrice = (price, fees) => {
    if (fees) {
      return `$${price.toFixed(2)} each ($${(price - fees).toFixed(2)} + $${fees.toFixed(2)} fees)`;
    }
    return `$${price.toFixed(2)} each`;
  };

  return (
    <View style={styles.container}>
      <Entypo name="ticket" size={18} color="#778899" style={styles.icon} />
      {ticketInfo.map((info, index) => (
        <Text key={index} style={styles.priceText}>
          {info.category}: {formatPrice(info.price, info.fees)}
        </Text>
      ))}
      {tickets && (
        <TouchableOpacity onPress={handleTicketPress} style={styles.ticketButton}>
          <Text style={styles.ticketButtonText}>Find Tickets</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  icon: {
    marginBottom: 5,
  },
  priceText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  ticketButton: {
    backgroundColor: '#BB9456',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  ticketButtonText: {
    color: 'white',
    fontFamily: 'NunitoSans',
    fontSize: 16,
  },
});

export default TicketPriceComponent;