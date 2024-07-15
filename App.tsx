import 'react-native-gesture-handler';
import React, { useCallback } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { MyStack } from './routes/homeStack';
// import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen'
// import { AuthProvider } from './AuthContext';
// import { MenuProvider } from 'react-native-popup-menu';
// import { LocationProvider } from './LocationContext';

export default function App() {
  
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}


