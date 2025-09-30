'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useNotifications, useUnreadNotificationsCount } from './use-notifications';
import { useEcho, useEchoModel } from '@laravel/echo-react';

import { toast } from 'sonner';
import type { Notification } from '../gql/graphql';

interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | string;
  action_url?: string;
  action_label?: string;
  metadata?: any;
  created_at: string;
}

export function useRealTimeNotifications() {
  const { user } = useAuth();
  if (!user) return {};
  const { refetch: refetchNotifications } = useNotifications();
  const { refetch: refetchUnreadCount } = useUnreadNotificationsCount();

  // Handle incoming real-time notifications
  const handleBroadcastNotification = useCallback(
    (notification: BroadcastNotification) => {
      console.log('🔔 Received notification:', notification);

      // Show toast notification
      const toastMessage = notification.message;

      // Map Laravel notification types to toast types
      const notificationType =
        typeof notification.type === 'string' &&
        ['info', 'success', 'warning', 'error'].includes(notification.type)
          ? (notification.type as 'info' | 'success' | 'warning' | 'error')
          : 'info';

      const toastAction = notification.action_url
        ? {
            label: notification.action_label || 'View',
            onClick: () => window.open(notification.action_url, '_blank'),
          }
        : undefined;

      switch (notificationType) {
        case 'success':
          toast.success(notification.title, {
            description: toastMessage,
            action: toastAction,
          });
          break;
        case 'error':
          toast.error(notification.title, {
            description: toastMessage,
            action: toastAction,
          });
          break;
        case 'warning':
          toast.warning(notification.title, {
            description: toastMessage,
            action: toastAction,
          });
          break;
        default:
          toast.info(notification.title, {
            description: toastMessage,
            action: toastAction,
          });
      }

      // Refresh notifications to include the new one
      refetchNotifications();
      refetchUnreadCount();
    },
    [refetchNotifications, refetchUnreadCount]
  );

  const { channel, leave } = useEchoModel('App.Models.User', user.id);

  useEffect(() => {
    channel().notification((notification: any) => {
      handleBroadcastNotification(notification as BroadcastNotification);
    });
    return () => {
      leave();
    };
  }, []);

  return {};
}
