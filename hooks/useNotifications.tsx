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
  expoPushToken: string;
  notification: Notifications.Notification | false;
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
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | false>(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const scheduleNotification = async (
    { title, body, data }: NotificationContent,
    trigger: NotificationTrigger
  ): Promise<string> => {
    const adjustedTrigger = Platform.OS === 'ios'
      ? trigger
      : trigger && 'date' in trigger
        ? { seconds: Math.floor((trigger.date.getTime() - Date.now()) / 1000) }
        : trigger;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: adjustedTrigger,
    });
  };

  const cancelNotification = async (notificationId: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  return { expoPushToken, notification, scheduleNotification, cancelNotification };
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    if (Notifications.getExpoPushTokenAsync) {
      const response = await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' });
      token = response.data;
    } else {
      const response = await Notifications.getDevicePushTokenAsync();
      token = response.data;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}