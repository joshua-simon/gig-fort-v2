import React, { useState, useCallback, useContext, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';

const Footer = ({ navigation }) => {
  const route = useRoute();
  const [selectedButton, setSelectedButton] = useState(route.name);
  const { user } = useContext(AuthContext) || {}

  useFocusEffect(
    useCallback(() => {
      setSelectedButton(route.name);
    }, [route,user])
  );

  const toggleState = (name:string) => {
    setSelectedButton(name);
    navigation.navigate(name);
  };

  const footerContent = useMemo(() => (
    <View style={styles.footer}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => toggleState('List')}>
          {selectedButton === 'List' ? (
            <FontAwesome name="list-ul" size={24} color="#377D8A" />
          ) : (
            <Feather name="list" size={24} color="black" />
          )}
        </TouchableOpacity>
        <Text style={styles.buttonLabel}>Browse</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => toggleState('Map')}>
          {selectedButton === 'Map' ? (
            <Ionicons name="map" size={24} color="#377D8A" />
          ) : (
            <Ionicons name="map-outline" size={24} color="black" />
          )}
        </TouchableOpacity>
        <Text style={styles.buttonLabel}>Map</Text>
      </View>
      {user && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => toggleState('Profile')}>
            {selectedButton === 'Profile' ? (
              <Ionicons name="person-outline" size={24} color="#377D8A" /> 
            ) : (
              <Ionicons name="person-outline" size={24} color="black" /> 
            )}
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Profile</Text>
        </View>
      )}
    </View>
  ), [user, selectedButton, toggleState]);

  return footerContent

}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#F7F6F5',
    height: '8%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: '#d3d3d3',
    borderTopWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonLabel: {
    fontFamily: 'LatoRegular',
    color: '#747474',
  },
});

export default Footer;