import 'react-native-gesture-handler';
import React, { useCallback, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { MyStack } from './routes/homeStack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from './AuthContext';
import { MenuProvider } from 'react-native-popup-menu';
import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  useEffect(() => {
    // Request permission for notifications (iOS)
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to receive notifications was denied!');
      }
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

  const [ fontsLoaded ] = useFonts({
    'NunitoSans': require('./assets/NunitoSans-Bold.ttf'),
    'LatoRegular': require('./assets/Lato-Regular.ttf')
  })

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <MenuProvider>
      <AuthProvider>
        <NavigationContainer>
          <MyStack />
        </NavigationContainer>
      </AuthProvider>
    </MenuProvider>
  );
}


