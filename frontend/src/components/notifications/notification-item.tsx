"use client";

import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNotificationActions, useNotificationBadge } from '@/hooks/use-notifications';
import type { Notification } from '@/gql/graphql';

interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  action_label?: string;
  metadata?: any;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotificationActions();
  
  // Parse notification data
  const data: NotificationData = JSON.parse(notification.data);
  const isUnread = !notification.read_at;
  
  const handleMarkAsRead = async () => {
    await markAsRead(notification.id);
    onMarkAsRead?.(notification.id);
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id);
    onDelete?.(notification.id);
  };

  const handleActionClick = () => {
    if (data.action_url) {
      window.open(data.action_url, '_self');
      if (isUnread) {
        handleMarkAsRead();
      }
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          icon: <AlertCircle className="h-4 w-4" />
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      default:
        return {
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          icon: <Info className="h-4 w-4" />
        };
    }
  };

  const typeConfig = getTypeConfig(data.type);

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-200',
        isUnread && 'bg-gradient-to-r from-blue-50/80 to-transparent border-l-4 border-l-blue-500'
      )}
    >
      {/* Notification Icon */}
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full border-2',
        typeConfig.bgColor,
        typeConfig.borderColor
      )}>
        <div className={typeConfig.iconColor}>
          {typeConfig.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title with unread indicator */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {data.title}
              </h4>
              {isUnread && (
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
            
            {/* Message */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">
              {data.message}
            </p>
            
            {/* Footer with timestamp and action */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              
              {data.action_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleActionClick}
                  className="h-7 px-3 text-xs font-medium border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                >
                  {data.action_label || 'View'}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {isUnread && (
                <DropdownMenuItem onClick={handleMarkAsRead} className="text-sm">
                  <Check className="mr-2 h-4 w-4" />
                  Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-sm text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { count, hasNotifications, displayCount, loading } = useNotificationBadge();

  return (
    <div className={cn('relative', className)}>
      <Bell className={cn(
        'h-5 w-5 transition-colors',
        hasNotifications ? 'text-blue-600' : 'text-gray-500'
      )} />
      {hasNotifications && !loading && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs font-medium bg-red-500 hover:bg-red-600 border-2 border-white shadow-sm"
        >
          {displayCount}
        </Badge>
      )}
    </div>
  );
}