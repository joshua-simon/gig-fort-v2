import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MyStack } from './routes/homeStack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from './AuthContext';
import { MenuProvider } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    'NunitoSans': require('./assets/NunitoSans-Bold.ttf'),
    'LatoRegular': require('./assets/Lato-Regular.ttf')
  });

  // Function to request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status === 'granted');
      return status;
    } catch (error) {
      console.warn('Error requesting notification permissions:', error);
      return 'error';
    }
  };

  // Function to set up notification listeners
  const setupNotificationListeners = () => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return { notificationListener, responseListener };
  };

  // Function to handle terms acceptance and automatically request permissions
  const handleTermsAcceptance = async (accepted: boolean, navigation: any) => {
    try {
      // Save terms acceptance status
      await AsyncStorage.setItem('@terms_accepted', accepted.toString());
      setTermsAccepted(accepted);
      
      if (accepted) {
        // Wait a brief moment to ensure the terms acceptance UI has updated
        setTimeout(async () => {
          // Request notification permissions immediately after terms acceptance
          const permissionStatus = await requestNotificationPermissions();
          
          // Navigate to the next screen regardless of permission status
          // Replace 'NextScreen' with your actual next screen name
          navigation.navigate('Map');
        }, 500); // Small delay to ensure smooth transition
      }
    } catch (error) {
      console.error('Error in handleTermsAcceptance:', error);
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        const terms = await AsyncStorage.getItem('@terms_accepted');
        const termsAcceptedValue = terms === 'true';
        setTermsAccepted(termsAcceptedValue);

        // If terms were previously accepted, check notification permissions
        if (termsAcceptedValue) {
          const { status } = await Notifications.getPermissionsAsync();
          setNotificationPermission(status === 'granted');
        }

        await Promise.all([
          // Add any other async operations here
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();

    // Only set up notification listeners if terms are accepted
    let listeners: any = null;
    if (termsAccepted) {
      listeners = setupNotificationListeners();
    }

    return () => {
      if (listeners) {
        Notifications.removeNotificationSubscription(listeners.notificationListener);
        Notifications.removeNotificationSubscription(listeners.responseListener);
      }
    };
  }, [termsAccepted]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <MenuProvider>
        <AuthProvider>
          <NavigationContainer>
            <MyStack 
              termsAccepted={termsAccepted} 
              onTermsAccept={handleTermsAcceptance}
              notificationPermission={notificationPermission}
            />
          </NavigationContainer>
        </AuthProvider>
      </MenuProvider>
    </View>
  );
}