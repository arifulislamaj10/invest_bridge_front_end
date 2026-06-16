'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ConfirmDialog';
import { ShieldCheck, FileText } from 'lucide-react';

interface PendingVerification {
  _id: string;
  verificationType: string;
  documentUrl?: string;
  createdAt?: string;
  userId: { fullName: string; email: string; role: string };
}

const BADGE_FOR_TYPE: Record<string, string> = {
  identity: 'Founder Identity',
  business: 'Business License & Tax File',
  bank: 'Bank Statement',
  proof_of_funds: 'Proof of Funds',
  address: 'Address',
  revenue: 'Revenue Verified',
};

export default function AdminVerificationsPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<PendingVerification[]>([]);

  const load = () => api.get<PendingVerification[]>('/verifications/pending').then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const approve = async (v: PendingVerification) => {
    const r = await confirm({
      title: `Approve ${v.userId.fullName}'s document?`,
      message: `This grants the "${BADGE_FOR_TYPE[v.verificationType] || v.verificationType}" trust badge.`,
      confirmLabel: 'Approve',
    });
    if (!r.confirmed) return;
    await api.patch(`/verifications/${v._id}/review`, { status: 'approved' });
    setItems((p) => p.filter((x) => x._id !== v._id));
  };
  const reject = async (v: PendingVerification) => {
    const r = await confirm({
      title: `Reject ${v.userId.fullName}'s document?`,
      message: 'The user will be notified and asked to resubmit.',
      confirmLabel: 'Reject',
      danger: true,
      promptLabel: 'Reason (shown to the user)',
      promptPlaceholder: 'e.g. Document is unreadable…',
      promptRequired: true,
    });
    if (!r.confirmed) return;
    await api.patch(`/verifications/${v._id}/review`, { status: 'rejected', notes: r.value });
    setItems((p) => p.filter((x) => x._id !== v._id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">KYC Document Review</h1>
        <p className="text-sm text-slate-500">Review each uploaded document, then approve to grant the trust badge.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No pending verifications.</p>
      ) : (
        items.map((v) => (
          <div key={v._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-900">{v.userId.fullName} <span className="font-normal text-slate-400">· {v.userId.role}</span></p>
              <p className="text-xs capitalize text-slate-500">{v.verificationType.replace(/_/g, ' ')}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                <ShieldCheck className="h-3 w-3" /> Grants: {BADGE_FOR_TYPE[v.verificationType] || v.verificationType}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {v.documentUrl ? (
                <a href={v.documentUrl} target="_blank" rel="noreferrer" className="btn-secondary !px-3 !py-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" /> View Document
                </a>
              ) : (
                <span className="text-xs text-slate-400">No document</span>
              )}
              <button onClick={() => approve(v)} className="btn-primary !px-3 !py-1.5 text-xs">Approve</button>
              <button onClick={() => reject(v)} className="btn-secondary !px-3 !py-1.5 text-xs">Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
