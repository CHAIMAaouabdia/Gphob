import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning';
  createdAt: number;
  read: boolean;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

let counter = 0;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function addNotification(n: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const id = `n-${++counter}-${Date.now()}`;
    setNotifications((prev) => [{ ...n, id, createdAt: Date.now(), read: false }, ...prev].slice(0, 30));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
