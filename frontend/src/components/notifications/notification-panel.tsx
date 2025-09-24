"use client";

import { useState } from 'react';
import { Bell, CheckCheck, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import EmptyState from '@/components/ui/empty-state';
import { NotificationItem, NotificationBell } from './notification-item';
import { useNotifications, useNotificationActions, useNotificationBadge } from '@/hooks/use-notifications';

interface NotificationPanelProps {
  className?: string;
}

export function NotificationPanel({ className }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, loading, error, refetch } = useNotifications({ first: 20 });
  const { markAllAsRead } = useNotificationActions();
  const { hasNotifications } = useNotificationBadge();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetch();
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <NotificationBell />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0 shadow-xl border-0 bg-white rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {hasNotifications && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                <span className="text-sm text-gray-500">Loading notifications...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-600">Failed to load notifications</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-2 h-8"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="p-8">
              <EmptyState
                icon={<Bell className="h-10 w-10 text-gray-400" />}
                title="No notifications"
                description="You're all caught up! No new notifications."
                className="text-center"
              />
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleRefresh}
                  onDelete={handleRefresh}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <div className="border-t border-gray-100 bg-gray-50/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-11 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-none rounded-b-lg"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}