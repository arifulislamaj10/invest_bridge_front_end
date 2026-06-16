'use client';

import { useEffect, useState } from 'react';
import { api, SupportTicket } from '@/lib/api';
import { statusColor } from '@/lib/utils';
import { Send } from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [active, setActive] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');

  const load = () => api.get<SupportTicket[]>('/admin/support').then(setTickets).catch(() => {});
  useEffect(() => { load(); }, []);

  const open = async (id: string) => setActive(await api.get<SupportTicket>(`/support/${id}`));
  const send = async () => {
    if (!reply.trim() || !active) return;
    await api.post(`/support/${active._id}/messages`, { message: reply });
    setReply('');
    open(active._id);
  };
  const setStatus = async (id: string, status: string) => {
    await api.patch(`/admin/support/${id}`, { status });
    setTickets((p) => p.map((t) => (t._id === id ? { ...t, status } : t)));
    if (active?._id === id) setActive({ ...active, status });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Support Inbox</h1>
        <p className="text-sm text-slate-500">Respond to user tickets and manage their status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2">
          {tickets.length === 0 ? <p className="text-sm text-slate-500">No tickets.</p> : tickets.map((t) => (
            <button key={t._id} onClick={() => open(t._id)} className={`w-full rounded-xl border p-4 text-left transition ${active?._id === t._id ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-100 bg-white hover:border-indigo-200'}`}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{t.subject}</p>
                <span className={`badge ${statusColor(t.status)}`}>{t.status.replace(/_/g, ' ')}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{typeof t.userId === 'object' ? t.userId.fullName : ''} · {t.category}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!active ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white text-sm text-slate-400">Select a ticket</div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-semibold text-slate-900">{active.subject}</h3>
                <select className="input w-auto text-xs" value={active.status} onChange={(e) => setStatus(active._id, e.target.value)}>
                  {['open', 'in_progress', 'awaiting_reply', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
                {active.messages.map((m, i) => {
                  const role = typeof m.senderId === 'object' ? m.senderId.role : m.senderRole;
                  const isStaff = role === 'admin';
                  return (
                    <div key={i} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isStaff ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <p className="mb-0.5 text-xs opacity-70">{isStaff ? 'Support Team' : (typeof active.userId === 'object' ? active.userId.fullName : 'User')}</p>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <input className="input" placeholder="Reply as support…" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
                <button onClick={send} className="btn-primary !px-4"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
