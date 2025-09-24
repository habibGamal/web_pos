"use client";

import { useQuery, useMutation } from '@apollo/client/react';
import {
  getNotificationsDocument,
  getUnreadNotificationsCountDocument,
  markNotificationAsReadDocument,
  markAllNotificationsAsReadDocument,
  deleteNotificationDocument,
  sendNotificationDocument,
} from '../lib/graphql/notifications';
import type {
  Notification,
  NotificationInput,
  GetNotificationsQuery,
  GetUnreadNotificationsCountQuery,
} from '../gql/graphql';
import { useAuth } from './use-auth';

// Hook interfaces
interface UseNotificationsOptions {
  first?: number;
  page?: number;
  unread_only?: boolean;
  skip?: boolean;
}

// Custom hooks following the pattern from use-products
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { isAuthenticated } = useAuth();
  const {
    first = 10,
    page = 1,
    unread_only = false,
    skip = false,
  } = options;

  const { data, loading, error, refetch, fetchMore } = useQuery(getNotificationsDocument, {
    variables: {
      first,
      page,
      unread_only,
    },
    skip: skip || !isAuthenticated,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  return {
    notifications: data?.notifications?.data || [],
    paginatorInfo: data?.notifications?.paginatorInfo,
    loading,
    error,
    refetch,
    fetchMore,
  };
}

export function useUnreadNotificationsCount() {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useQuery(getUnreadNotificationsCountDocument, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    pollInterval: 30000, // Poll every 30 seconds
  });

  return {
    unreadCount: data?.unreadNotificationsCount || 0,
    loading,
    error,
    refetch,
  };
}

export function useNotificationActions() {
  const [markAsReadMutation] = useMutation(markNotificationAsReadDocument, {
    refetchQueries: [
      { query: getNotificationsDocument },
      { query: getUnreadNotificationsCountDocument },
    ],
    awaitRefetchQueries: true,
  });

  const [markAllAsReadMutation] = useMutation(markAllNotificationsAsReadDocument, {
    refetchQueries: [
      { query: getNotificationsDocument },
      { query: getUnreadNotificationsCountDocument },
    ],
    awaitRefetchQueries: true,
  });

  const [deleteNotificationMutation] = useMutation(deleteNotificationDocument, {
    refetchQueries: [
      { query: getNotificationsDocument },
      { query: getUnreadNotificationsCountDocument },
    ],
    awaitRefetchQueries: true,
  });

  const [sendNotificationMutation] = useMutation(sendNotificationDocument);

  const markAsRead = async (id: string): Promise<boolean> => {
    try {
      const { data } = await markAsReadMutation({ variables: { id } });
      return data?.markNotificationAsRead ?? false;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      const { data } = await markAllAsReadMutation();
      return data?.markAllNotificationsAsRead ?? false;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  };

  const deleteNotification = async (id: string): Promise<boolean> => {
    try {
      const { data } = await deleteNotificationMutation({ variables: { id } });
      return data?.deleteNotification ?? false;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  };

  const sendNotification = async (userId: string, notification: NotificationInput): Promise<boolean> => {
    try {
      const { data } = await sendNotificationMutation({
        variables: { user_id: userId, notification },
      });
      return data?.sendNotification ?? false;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  };

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
  };
}

// Hook for unread notifications only
export function useUnreadNotifications() {
  return useNotifications({ unread_only: true });
}

// Hook for notification count badge
export function useNotificationBadge() {
  const { unreadCount, loading } = useUnreadNotificationsCount();
  
  return {
    count: unreadCount,
    hasNotifications: unreadCount > 0,
    displayCount: unreadCount > 99 ? '99+' : unreadCount.toString(),
    loading,
  };
}