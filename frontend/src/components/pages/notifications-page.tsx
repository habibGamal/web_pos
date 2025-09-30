"use client";

import { useState } from 'react';
import { Bell, Filter, Search, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import { NotificationItem } from '../notifications/notification-item';
import { 
  useNotifications, 
  useUnreadNotifications, 
  useNotificationActions,
  useNotificationBadge 
} from '@/hooks/use-notifications';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch notifications based on active tab
  const { notifications: allNotifications, loading: allLoading, refetch: refetchAll } = useNotifications({ first: 50 });
  const { notifications: unreadNotifications, loading: unreadLoading, refetch: refetchUnread } = useUnreadNotifications();
  const { markAllAsRead } = useNotificationActions();
  const { count: unreadCount } = useNotificationBadge();

  const notifications = activeTab === 'all' ? allNotifications : unreadNotifications;
  const loading = activeTab === 'all' ? allLoading : unreadLoading;

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter((notification) => {
    if (!searchTerm) return true;
    const data = JSON.parse(notification.data);
    return (
      data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetchAll();
    refetchUnread();
  };

  const handleRefresh = () => {
    refetchAll();
    refetchUnread();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with your latest activities</p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} className="flex items-center space-x-2">
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <span>All Notifications</span>
            <Badge variant="secondary">{allNotifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center space-x-2">
            <span>Unread</span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-0">
          <NotificationsList
            notifications={filteredNotifications}
            loading={loading}
            onRefresh={handleRefresh}
            emptyTitle="No notifications found"
            emptyDescription={searchTerm ? "No notifications match your search." : "You don't have any notifications yet."}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-0">
          <NotificationsList
            notifications={filteredNotifications}
            loading={loading}
            onRefresh={handleRefresh}
            emptyTitle="No unread notifications"
            emptyDescription={searchTerm ? "No unread notifications match your search." : "You're all caught up! No unread notifications."}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationsListProps {
  notifications: any[];
  loading: boolean;
  onRefresh: () => void;
  emptyTitle: string;
  emptyDescription: string;
}

function NotificationsList({ 
  notifications, 
  loading, 
  onRefresh, 
  emptyTitle, 
  emptyDescription 
}: NotificationsListProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading notifications...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<Bell className="h-12 w-12" />}
            title={emptyTitle}
            description={emptyDescription}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onRefresh}
              onDelete={onRefresh}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}