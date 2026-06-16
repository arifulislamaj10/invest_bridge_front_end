'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api, SupportTicket } from '@/lib/api';
import { LifeBuoy, Plus, Send, MessageSquare } from 'lucide-react';
import { formatDate, statusColor } from '@/lib/utils';

const CATEGORIES = ['general', 'payments', 'verification', 'dispute', 'technical', 'account', 'other'];

export default function SupportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [active, setActive] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'general', priority: 'normal', message: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const load = () => api.get<SupportTicket[]>('/support/my').then(setTickets).catch(() => {});
  useEffect(() => { if (user) load(); }, [user]);

  const openTicket = async (id: string) => {
    const t = await api.get<SupportTicket>(`/support/${id}`);
    setActive(t);
  };

  const createTicket = async () => {
    if (!form.subject) return;
    await api.post('/support', form);
    setForm({ subject: '', category: 'general', priority: 'normal', message: '' });
    setShowNew(false);
    load();
  };

  const sendReply = async () => {
    if (!reply.trim() || !active) return;
    const updated = await api.post<SupportTicket>(`/support/${active._id}/messages`, { message: reply });
    setReply('');
    openTicket(active._id);
    setTickets((p) => p.map((t) => (t._id === updated._id ? { ...t, status: updated.status } : t)));
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-2"><LifeBuoy className="h-8 w-8 text-indigo-600" /> Support</h1>
            <p className="section-subtitle">Our team typically replies within 24 hours.</p>
          </div>
          <button onClick={() => setShowNew(!showNew)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> New Ticket</button>
        </div>

        {showNew && (
          <div className="card mt-6">
            <h3 className="font-semibold text-slate-900">Open a new ticket</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="input sm:col-span-2" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <textarea className="input min-h-[100px] sm:col-span-2" placeholder="Describe your issue..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <button onClick={createTicket} className="btn-primary mt-3 text-sm"><Send className="h-4 w-4" /> Submit Ticket</button>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Ticket list */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">My Tickets</h2>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-500">No tickets yet.</p>
            ) : (
              tickets.map((t) => (
                <button
                  key={t._id}
                  onClick={() => openTicket(t._id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${active?._id === t._id ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-100 hover:border-indigo-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{t.subject}</p>
                    <span className={`badge ${statusColor(t.status)}`}>{t.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="mt-1 text-xs capitalize text-slate-400">{t.category} · {formatDate(t.createdAt)}</p>
                </button>
              ))
            )}
          </div>

          {/* Conversation */}
          <div className="lg:col-span-2">
            {!active ? (
              <div className="card flex h-full min-h-[300px] flex-col items-center justify-center text-center text-slate-400">
                <MessageSquare className="h-10 w-10" />
                <p className="mt-2 text-sm">Select a ticket to view the conversation.</p>
              </div>
            ) : (
              <div className="card">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-slate-900">{active.subject}</h3>
                  <span className={`badge ${statusColor(active.status)}`}>{active.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                  {active.messages.map((m, i) => {
                    const role = typeof m.senderId === 'object' ? m.senderId.role : m.senderRole;
                    const isStaff = role === 'admin';
                    return (
                      <div key={i} className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isStaff ? 'bg-slate-100 text-slate-700' : 'bg-indigo-600 text-white'}`}>
                          <p className="mb-0.5 text-xs opacity-70">{isStaff ? 'Support Team' : 'You'}</p>
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!['resolved', 'closed'].includes(active.status) && (
                  <div className="mt-4 flex gap-2">
                    <input className="input" placeholder="Type a reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
                    <button onClick={sendReply} className="btn-primary !px-4"><Send className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
