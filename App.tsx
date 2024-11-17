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

  const [fontsLoaded] = useFonts({
    'NunitoSans': require('./assets/NunitoSans-Bold.ttf'),
    'LatoRegular': require('./assets/Lato-Regular.ttf')
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        const terms = await AsyncStorage.getItem('@terms_accepted');
        setTermsAccepted(terms === 'true');

        await Promise.all([
          // Your existing font loading is handled by useFonts
          // Add any other async operations here
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();

    // Request permission for notifications (iOS)
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
    };

    requestPermissions();

    // Set up notification received listener
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can handle the received notification here if needed
    });

    // Set up notification response listener
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // Handle notification tap / response here
      // For example, you might want to navigate to a specific screen based on the notification
    });

    // Clean up listeners on component unmount
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      // This tells the splash screen to hide immediately
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
            <MyStack />
          </NavigationContainer>
        </AuthProvider>
      </MenuProvider>
    </View>
  );
}