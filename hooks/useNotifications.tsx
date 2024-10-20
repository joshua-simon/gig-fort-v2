import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

type NotificationContent = {
  title: string;
  body: string;
  data?: { [key: string]: any };
};

type NotificationTrigger = 
  | { date: Date }
  | { seconds: number }
  | null;

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  notificationError: string | null;
  scheduleNotification: (content: NotificationContent, trigger: NotificationTrigger) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications(): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    async function setupNotifications() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
        } else {
          setNotificationError('Failed to get push token. Notifications may not work.');
        }

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response received:', response);
        });
      } catch (error) {
        console.error('Error setting up notifications:', error);
        setNotificationError('An error occurred while setting up notifications.');
      }
    }

    setupNotifications();

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const scheduleNotification = async (
    { title, body, data }: NotificationContent,
    trigger: NotificationTrigger
  ): Promise<string> => {
    try {
      const adjustedTrigger = Platform.OS === 'ios'
        ? trigger
        : trigger && 'date' in trigger
          ? { seconds: Math.floor((trigger.date.getTime() - Date.now()) / 1000) }
          : trigger;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: adjustedTrigger,
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  const cancelNotification = async (notificationId: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  };

  return { expoPushToken, notification, notificationError, scheduleNotification, cancelNotification };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Platform.OS === 'ios' || Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      if (Platform.OS === 'android') {
        const { data } = await Notifications.getExpoPushTokenAsync({ projectId: "5ca9a291-45a7-41a0-84be-eeaee1902052" });
        token = data;
      } else {
        const { data } = await Notifications.getDevicePushTokenAsync();
        token = data;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}