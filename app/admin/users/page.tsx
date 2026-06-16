'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, statusColor } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { Search, Trash2, Ban, CheckCircle2, X, UserCircle, ExternalLink, RotateCcw, Flame, Archive } from 'lucide-react';

interface AdminUser { _id: string; fullName: string; email: string; role: string; accountStatus: string; isVerified: boolean; deletedAt?: string | null }

export default function AdminUsersPage() {
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [drill, setDrill] = useState<any | null>(null);
  const [msg, setMsg] = useState('');

  const load = (archived = showArchived) =>
    api.get<AdminUser[]>(`/admin/users${archived ? '?archived=true' : ''}`).then(setUsers).catch(() => {});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const r = new URLSearchParams(window.location.search).get('role');
      if (r) setRoleFilter(r);
    }
  }, []);
  useEffect(() => { load(showArchived); }, [showArchived]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const setStatus = async (id: string, accountStatus: string) => {
    await api.patch(`/admin/users/${id}/status`, { accountStatus });
    setUsers((p) => p.map((u) => (u._id === id ? { ...u, accountStatus } : u)));
  };

  const block = async (u: AdminUser) => {
    const r = await confirm({ title: `Block ${u.fullName}?`, message: 'They will be unable to log in until reinstated. No data is removed.', confirmLabel: 'Block user' });
    if (r.confirmed) { await setStatus(u._id, 'suspended'); flash(`${u.fullName} blocked.`); }
  };
  const reinstate = async (u: AdminUser) => {
    const r = await confirm({ title: `Reinstate ${u.fullName}?`, message: 'They will regain access to their account.', confirmLabel: 'Reinstate' });
    if (r.confirmed) { await setStatus(u._id, 'active'); flash(`${u.fullName} reinstated.`); }
  };

  const archive = async (u: AdminUser) => {
    const r = await confirm({
      title: `Archive ${u.fullName}?`,
      message: 'The account will be hidden and login blocked, but all their records (deals, payments, history) are kept for compliance. You can restore them later.',
      confirmLabel: 'Archive user',
      danger: true,
    });
    if (!r.confirmed) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      setUsers((p) => p.filter((x) => x._id !== u._id));
      flash(`${u.fullName} archived.`);
    } catch (e) { flash(e instanceof Error ? e.message : 'Archive failed'); }
  };

  const restore = async (u: AdminUser) => {
    const r = await confirm({ title: `Restore ${u.fullName}?`, message: 'The account will be reactivated and visible again.', confirmLabel: 'Restore' });
    if (!r.confirmed) return;
    await api.post(`/admin/users/${u._id}/restore`);
    setUsers((p) => p.filter((x) => x._id !== u._id));
    flash(`${u.fullName} restored.`);
  };

  const purge = async (u: AdminUser) => {
    const r = await confirm({
      title: `Permanently delete ${u.fullName}?`,
      message: 'This ERASES the user and ALL their data — projects, deals, payments, reviews and history. This cannot be undone and removes compliance records.',
      confirmLabel: 'Permanently delete',
      danger: true,
      requireText: 'DELETE',
    });
    if (!r.confirmed) return;
    try {
      await api.delete(`/admin/users/${u._id}/purge`);
      setUsers((p) => p.filter((x) => x._id !== u._id));
      flash(`${u.fullName} permanently deleted.`);
    } catch (e) { flash(e instanceof Error ? e.message : 'Delete failed'); }
  };

  const openDrill = async (id: string) => setDrill(await api.get(`/admin/users/${id}/activity`));

  const filtered = users.filter(
    (u) =>
      (!roleFilter || u.role === roleFilter) &&
      (!q || u.fullName.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Block, archive, restore, permanently delete and inspect any account.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input !py-2 pl-9" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input w-auto !py-2" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="investor">Investors</option>
            <option value="founder">Founders</option>
            <option value="admin">Admins</option>
          </select>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${showArchived ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            <Archive className="h-4 w-4" /> {showArchived ? 'Viewing Archived' : 'Active Users'}
          </button>
        </div>
      </div>

      {msg && <div className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm text-indigo-700">{msg}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <button onClick={() => openDrill(u._id)} className="flex items-center gap-2 text-left">
                    <UserCircle className="h-8 w-8 text-slate-300" />
                    <div>
                      <p className="font-medium text-slate-900 hover:text-indigo-600">{u.fullName}</p>
                      <p className="text-xs text-slate-500">{u.email}{u.isVerified ? ' · ✓' : ''}</p>
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                <td className="px-4 py-3">
                  {showArchived ? <span className="badge bg-slate-200 text-slate-600">archived</span> : <span className={`badge ${statusColor(u.accountStatus)}`}>{u.accountStatus}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {showArchived ? (
                      <>
                        <button onClick={() => restore(u)} title="Restore" className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"><RotateCcw className="h-4 w-4" /></button>
                        {u.role !== 'admin' && <button onClick={() => purge(u)} title="Delete permanently" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Flame className="h-4 w-4" /></button>}
                      </>
                    ) : (
                      <>
                        {u.accountStatus === 'suspended'
                          ? <button onClick={() => reinstate(u)} title="Reinstate" className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"><CheckCircle2 className="h-4 w-4" /></button>
                          : <button onClick={() => block(u)} title="Block" className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"><Ban className="h-4 w-4" /></button>}
                        {u.role !== 'admin' && <button onClick={() => archive(u)} title="Archive" className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drill-down modal */}
      {drill && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setDrill(null)}>
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{drill.user.fullName}</h3>
                <p className="text-sm text-slate-500">{drill.user.email} · {drill.user.role} · <span className={`badge ${statusColor(drill.user.accountStatus)}`}>{drill.user.deletedAt ? 'archived' : drill.user.accountStatus}</span></p>
              </div>
              <button onClick={() => setDrill(null)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>

            {drill.profileType === 'investor' && drill.investorProfile && (
              <Link href={`/investors/${drill.investorProfile._id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
                View full credibility profile <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
            {drill.profileType === 'founder' && drill.founderProfile && (
              <Link href={`/business/${drill.founderProfile._id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
                View business trust profile <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                { label: 'Projects', value: drill.projects?.length || 0 },
                { label: 'Deals', value: drill.deals?.length || 0 },
                { label: 'Reviews', value: drill.reviews?.length || 0 },
                { label: 'Verifications', value: drill.verifications?.length || 0 },
                { label: 'Disputes', value: drill.disputes?.length || 0 },
                { label: 'Reports', value: drill.reports?.length || 0 },
                { label: 'Tickets', value: drill.tickets?.length || 0 },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {drill.deals?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700">Deals</p>
                <div className="mt-2 space-y-1">
                  {drill.deals.map((d: any) => (
                    <div key={d._id} className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                      <span className="text-slate-700">{d.projectId?.title || 'Project'}</span>
                      <span className="text-slate-500">{formatCurrency(d.offeredAmount)} · {d.dealStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {drill.verifications?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-700">Verifications</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {drill.verifications.map((v: any) =>
                    v.documentUrl ? (
                      <a key={v._id} href={v.documentUrl} target="_blank" rel="noreferrer" className={`badge ${statusColor(v.status)} capitalize hover:underline`}>
                        {v.verificationType.replace(/_/g, ' ')}: {v.status} ↗
                      </a>
                    ) : (
                      <span key={v._id} className={`badge ${statusColor(v.status)} capitalize`}>{v.verificationType.replace(/_/g, ' ')}: {v.status}</span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
