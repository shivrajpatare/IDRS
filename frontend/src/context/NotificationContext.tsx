import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestNotificationPermission, getFcmToken, onMessageListener } from '../lib/firebase';
import { useAuth } from './AuthContext';
import api from '../lib/axios';

interface NotificationContextType {
  fcmToken: string | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  fcmToken: null,
  permissionGranted: false,
  requestPermission: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check initial permission status
    if (Notification.permission === 'granted') {
      setPermissionGranted(true);
    }
  }, []);

  const syncTokenToBackend = async (token: string) => {
    try {
      await api.post('/notifications/register-token', { token, device_type: 'web' });
      console.log('FCM token synced to backend');
    } catch (err) {
      console.error('Failed to sync FCM token', err);
    }
  };

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionGranted(true);
      const token = await getFcmToken();
      if (token) {
        setFcmToken(token);
        if (user) {
          await syncTokenToBackend(token);
        }
      }
    }
  };

  // Sync token if user logs in and we already have permission
  useEffect(() => {
    if (user && permissionGranted && !fcmToken) {
      getFcmToken().then((token) => {
        if (token) {
          setFcmToken(token);
          syncTokenToBackend(token);
        }
      });
    }
  }, [user, permissionGranted]);

  // Handle foreground messages
  useEffect(() => {
    if (permissionGranted) {
      const listen = async () => {
        const payload: any = await onMessageListener();
        console.log('Received foreground message: ', payload);
        // Show in-app banner or toast here
        if (payload?.notification) {
          // Fallback UI toast could be triggered here
        }
        listen();
      };
      listen();
    }
  }, [permissionGranted]);

  return (
    <NotificationContext.Provider value={{ fcmToken, permissionGranted, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};
