import { graphql } from '../../gql';

// GraphQL documents following application pattern
export const getNotificationsDocument = graphql(/* GraphQL */ `
  query GetNotifications($first: Int = 10, $page: Int = 1, $unread_only: Boolean = false) {
    notifications(first: $first, page: $page, unread_only: $unread_only) {
      data {
        id
        type
        data
        read_at
        created_at
        updated_at
      }
      paginatorInfo {
        count
        currentPage
        firstItem
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`);

export const getUnreadNotificationsCountDocument = graphql(/* GraphQL */ `
  query GetUnreadNotificationsCount {
    unreadNotificationsCount
  }
`);

export const markNotificationAsReadDocument = graphql(/* GraphQL */ `
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`);

export const markAllNotificationsAsReadDocument = graphql(/* GraphQL */ `
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`);

export const deleteNotificationDocument = graphql(/* GraphQL */ `
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`);

export const sendNotificationDocument = graphql(/* GraphQL */ `
  mutation SendNotification($user_id: ID!, $notification: NotificationInput!) {
    sendNotification(user_id: $user_id, notification: $notification)
  }
`);