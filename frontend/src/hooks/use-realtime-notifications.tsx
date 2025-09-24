"use client";

import { useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useNotifications, useUnreadNotificationsCount } from './use-notifications';
import echo, { createEchoInstance, resetEchoInstance } from '../lib/echo';
import { toast } from 'sonner';
import type { Notification } from '../gql/graphql';

interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  action_label?: string;
  metadata?: any;
  created_at: string;
}

export function useRealTimeNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { refetch: refetchNotifications } = useNotifications();
  const { refetch: refetchUnreadCount } = useUnreadNotificationsCount();

  // Handle incoming real-time notifications
  const handleBroadcastNotification = useCallback((notification: BroadcastNotification) => {
    // Show toast notification
    const toastMessage = notification.message;
    
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, {
          description: toastMessage,
          action: notification.action_url ? {
            label: notification.action_label || 'View',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined,
        });
        break;
      case 'error':
        toast.error(notification.title, {
          description: toastMessage,
          action: notification.action_url ? {
            label: notification.action_label || 'View',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined,
        });
        break;
      case 'warning':
        toast.warning(notification.title, {
          description: toastMessage,
          action: notification.action_url ? {
            label: notification.action_label || 'View',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined,
        });
        break;
      default:
        toast.info(notification.title, {
          description: toastMessage,
          action: notification.action_url ? {
            label: notification.action_label || 'View',
            onClick: () => window.open(notification.action_url, '_blank')
          } : undefined,
        });
    }

    // Refresh notifications to include the new one
    refetchNotifications();
    refetchUnreadCount();
  }, [refetchNotifications, refetchUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }
    // Create Echo instance with proper token
    const echoInstance = echo;

    // Subscribe to user's private notification channel
    const channelName = `App.Models.User.${user.id}`;
    
    try {
      const channel = echoInstance.private(channelName);

      // Listen for notifications
      channel.notification((notification: BroadcastNotification) => {
        handleBroadcastNotification(notification);
      });

      // Cleanup function
      return () => {
        try {
          echoInstance.leaveChannel(channelName);
        } catch (error) {
          console.warn('Error leaving channel:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up real-time notifications:', error);
    }
  }, [isAuthenticated, user?.id, handleBroadcastNotification]);

  return {
    // Can expose methods to manually trigger notifications for testing
    triggerTestNotification: useCallback(() => {
      handleBroadcastNotification({
        id: 'test-' + Date.now(),
        title: 'Test Notification',
        message: 'This is a test notification from the real-time system.',
        type: 'info',
        created_at: new Date().toISOString(),
      });
    }, [handleBroadcastNotification]),
  };
}

// Hook to initialize real-time notifications globally
export function useInitializeRealTimeNotifications() {
  useRealTimeNotifications();
}