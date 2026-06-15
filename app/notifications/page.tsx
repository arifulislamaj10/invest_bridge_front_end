'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) api.get<Notification[]>('/notifications').then(setNotifications).catch(() => {});
  }, [user]);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Notifications</h1>
            <p className="section-subtitle">Your latest updates</p>
          </div>
          <button onClick={markAllRead} className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline">
            Mark all read
          </button>
        </div>

        <div className="mt-8 space-y-2">
          {notifications.length === 0 ? (
            <p className="text-center text-neutral-400">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`card !py-4 ${!n.isRead ? 'border-neutral-900' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{n.title}</p>
                    <p className="mt-1 text-sm text-neutral-500">{n.body}</p>
                  </div>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-neutral-900" />}
                </div>
                <p className="mt-2 text-xs text-neutral-400">{formatDate(n.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
