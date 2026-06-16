'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, statusColor } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { CheckCircle2, XCircle, FileText, ChevronDown, ExternalLink } from 'lucide-react';

interface AdminProject {
  _id: string;
  title: string;
  description?: string;
  industry: string;
  stage: string;
  country?: string;
  fundingGoal: number;
  equityOffered: number;
  valuation?: number;
  status: string;
  createdAt: string;
  founderId?: { _id: string; businessName: string; userId?: { fullName: string; email: string } };
}

interface ReviewDetail {
  project: AdminProject;
  documents: { _id: string; type: string; fileName: string; fileUrl: string; accessLevel: string }[];
  milestones: { _id: string; title: string; status: string }[];
}

export default function AdminProjectsPage() {
  const confirm = useConfirm();
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const st = new URLSearchParams(window.location.search).get('status');
      if (st) setStatusFilter(st);
    }
  }, []);

  const load = () => {
    const url = statusFilter === 'pending_review' ? '/admin/projects/pending' : `/admin/projects?status=${statusFilter}`;
    api.get<AdminProject[]>(url).then(setProjects).catch(() => {});
  };
  useEffect(load, [statusFilter]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const toggle = async (id: string) => {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    setExpanded(id);
    setDetail(null);
    setDetail(await api.get<ReviewDetail>(`/admin/projects/${id}/review`));
  };

  const decide = async (id: string, title: string, approved: boolean) => {
    const r = approved
      ? await confirm({ title: `Approve "${title}"?`, message: 'The project will be published and visible to all investors.', confirmLabel: 'Approve & publish' })
      : await confirm({ title: `Reject "${title}"?`, message: 'The founder will be notified and the project will not go live.', confirmLabel: 'Reject project', danger: true, promptLabel: 'Reason (shown to founder)', promptPlaceholder: 'e.g. Financials need more detail…', promptRequired: true });
    if (!r.confirmed) return;
    await api.patch(`/admin/projects/${id}/approve`, { status: approved ? 'active' : 'rejected', notes: r.value });
    setProjects((p) => p.filter((x) => x._id !== id));
    setExpanded(null);
    flash(approved ? 'Project approved & published.' : 'Project rejected.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Review</h1>
          <p className="text-sm text-slate-500">Verify founder submissions before they go live to investors.</p>
        </div>
        <select className="input w-auto !py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="pending_review">Pending review</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="funded">Funded</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {msg && <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{msg}</div>}

      {projects.length === 0 ? (
        <p className="text-sm text-slate-500">No projects in this state.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p._id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <button onClick={() => toggle(p._id)} className="flex items-center gap-2 text-left">
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded === p._id ? 'rotate-180' : ''}`} />
                  <div>
                    <p className="font-medium text-slate-900">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.founderId?.businessName} · {p.founderId?.userId?.fullName} · {formatCurrency(p.fundingGoal)} · {p.equityOffered}% equity
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`badge ${statusColor(p.status)}`}>{p.status.replace(/_/g, ' ')}</span>
                  {p.status === 'pending_review' && (
                    <>
                      <button onClick={() => decide(p._id, p.title, true)} className="btn-primary !px-3 !py-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                      <button onClick={() => decide(p._id, p.title, false)} className="btn-secondary !px-3 !py-1.5 text-xs"><XCircle className="h-3.5 w-3.5" /> Reject</button>
                    </>
                  )}
                </div>
              </div>

              {expanded === p._id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  {!detail ? (
                    <p className="text-sm text-slate-400">Loading details…</p>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <div className="grid gap-3 sm:grid-cols-4">
                        {[
                          { label: 'Industry', value: detail.project.industry },
                          { label: 'Stage', value: detail.project.stage },
                          { label: 'Country', value: detail.project.country || '—' },
                          { label: 'Valuation', value: detail.project.valuation ? formatCurrency(detail.project.valuation) : '—' },
                        ].map((s) => (
                          <div key={s.label} className="rounded-lg bg-white p-2.5">
                            <p className="text-xs text-slate-400">{s.label}</p>
                            <p className="font-medium capitalize text-slate-800">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-700">Description</p>
                        <p className="mt-1 leading-relaxed text-slate-600">{detail.project.description || 'No description.'}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-slate-700">Documents ({detail.documents.length})</p>
                        {detail.documents.length === 0 ? (
                          <p className="mt-1 text-slate-400">No documents uploaded.</p>
                        ) : (
                          <div className="mt-2 space-y-1.5">
                            {detail.documents.map((d) => (
                              <a key={d._id} href={d.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-indigo-300">
                                <span className="flex items-center gap-2 text-slate-700"><FileText className="h-4 w-4 text-slate-400" /> {d.fileName}</span>
                                <span className="flex items-center gap-1 text-xs text-indigo-600">{d.type} <ExternalLink className="h-3 w-3" /></span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {detail.milestones.length > 0 && (
                        <div>
                          <p className="font-semibold text-slate-700">Milestones</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {detail.milestones.map((m) => (
                              <span key={m._id} className={`badge ${statusColor(m.status)}`}>{m.title}: {m.status}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link href={`/projects/${detail.project._id}`} target="_blank" className="btn-secondary !py-2 text-xs">Preview public page <ExternalLink className="h-3.5 w-3.5" /></Link>
                        {detail.project.founderId && (
                          <Link href={`/business/${detail.project.founderId._id}`} target="_blank" className="btn-secondary !py-2 text-xs">Founder trust profile <ExternalLink className="h-3.5 w-3.5" /></Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
