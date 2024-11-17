import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from '../routes/homeStack';
import { Button } from 'react-native';

export type termsProps = NativeStackScreenProps<RootStackParamList, 'TermsAndConditions', 'MyStack'>

const TermsAndConditions = ({ navigation }: termsProps) => {
  const handleAcceptTerms = async () => {
    try {
      await AsyncStorage.setItem('@terms_accepted', 'true');
      navigation.replace('Map'); // Navigate to Map screen after accepting terms
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.termsText}>
            [Your terms and conditions text here]
            
            1. Introduction
            These Terms and Conditions govern your use of our application...

            2. Acceptance
            By accessing and using this application, you accept and agree to be bound by these Terms...
          </Text>
        </ScrollView>
        <Button
          title="Accept Terms & Conditions"
          onPress={handleAcceptTerms}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'NunitoSans',
  },
  scrollView: {
    maxHeight: '70%',
    marginBottom: 20,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'LatoRegular',
  },
});

export default TermsAndConditions;