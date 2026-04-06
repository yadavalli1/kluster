'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface RealtimeNotificationsProps {
  projectId?: string;
}

export function RealtimeNotifications({ projectId }: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'ping') {
          return;
        }

        const notification: Notification = {
          id: data.id || crypto.randomUUID(),
          type: data.type || 'info',
          title: data.title,
          message: data.message,
          timestamp: new Date(),
          read: false,
        };

        setNotifications((prev) => [notification, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [projectId]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function togglePanel() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 8, left: Math.max(8, rect.left - 320 + rect.width) });
    }
    setIsOpen(!isOpen);
  }

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        className="relative rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        onClick={togglePanel}
      >
        <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        <span
          className={cn(
            'absolute bottom-1 right-1 h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          style={{ top: panelPos.top, left: panelPos.left }}
          className="fixed z-50 w-96 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    'flex cursor-pointer gap-3 border-b border-zinc-100 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50',
                    !notification.read && getBgColor(notification.type)
                  )}
                >
                  {getIcon(notification.type)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                      {notification.title}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
