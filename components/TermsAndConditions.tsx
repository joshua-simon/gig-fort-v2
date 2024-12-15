import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from '../routes/homeStack';

export type termsProps = NativeStackScreenProps<RootStackParamList, 'TermsAndConditions', 'MyStack'> & {
  onTermsAccept: (accepted: boolean, navigation: any) => Promise<void>;
};

const TermsAndConditions = ({ navigation, route }: termsProps) => {
  const { onTermsAccept } = route.params;
  
    useEffect(() => {
        const checkTerms = async () => {
          const terms = await AsyncStorage.getItem('@terms_accepted');
          if (terms === 'true') {
            navigation.replace('Map');
          }
        };
        checkTerms();
    }, []);
      
    const handleAcceptTerms = async () => {
        try {
            // Use the onTermsAccept prop instead of directly setting AsyncStorage
            // This will handle both terms acceptance and notification permissions
            await onTermsAccept(true, navigation);
            // No need to navigate here as it's handled in onTermsAccept
        } catch (error) {
            console.error('Error in handleAcceptTerms:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Image
                    style={styles.ellipse}
                    source={require('../assets/Ellipse_28.png')}
                />
                <Text style={styles.header}>Welcome to Gig Fort!</Text>
            </View>
            <Text style={styles.accept}>
                By pressing 'Accept', you agree to Gig Fort's{' '}
                <Text 
                    style={{ color: '#377D8A', textDecorationLine: 'underline' }} 
                    onPress={() => Linking.openURL('https://www.gigfort.nz/')}
                >
                    Terms and Conditions
                </Text> and{' '}
                <Text 
                    style={{ color: '#377D8A', textDecorationLine: 'underline' }} 
                    onPress={() => Linking.openURL('https://www.gigfort.nz/privacypolicy')}
                >
                    Privacy Policy
                </Text>
            </Text>
            <TouchableOpacity
                onPress={handleAcceptTerms}
                style={styles.button}
            >
                <Text style={styles.button_text}>Accept</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d7bf9a',
        flexDirection: 'column',
        alignItems: 'center',
    },
    ellipse: {
        width: '100%'
    },
    button: {
        backgroundColor: '#377D8A',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: '10%',
        width: '50%',
        marginTop: 'auto'
    },
    button_text: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'NunitoSans',
        fontSize: 16,
        lineHeight: 22   
    },
    headerContainer: {
        width: '100%',
        position: 'relative',
    },
    header: {
        fontFamily: 'NunitoSans',
        color: '#FFFFFF',
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        top: '40%',
        fontSize: 30
    },
    accept: {
        fontFamily: 'NunitoSans',
        fontSize: 16,
        textAlign: 'center',
        top: '28%'
    }
});

export default TermsAndConditions;