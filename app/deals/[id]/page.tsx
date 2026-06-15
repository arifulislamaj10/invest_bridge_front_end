'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatCurrency, statusColor } from '@/lib/utils';
import { Send, FileText } from 'lucide-react';

interface Message {
  _id: string;
  message: string;
  senderId: { _id: string; fullName: string; role: string };
  createdAt: string;
}

interface DealDetail {
  deal: {
    _id: string;
    offeredAmount: number;
    equityRequested?: number;
    dealStatus: string;
    ndaSigned: boolean;
    projectId: { title: string; industry: string };
  };
  messages: Message[];
  documents: { _id: string; fileName: string; documentType: string }[];
}

export default function DealRoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DealDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const loadDeal = () => {
    api.get<DealDetail>(`/deals/${id}`).then(setData).catch(() => {});
  };

  useEffect(() => { loadDeal(); }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await api.post(`/deals/${id}/messages`, { message: newMessage });
    setNewMessage('');
    loadDeal();
  };

  const updateStatus = async (dealStatus: string) => {
    await api.patch(`/deals/${id}/status`, { dealStatus });
    loadDeal();
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <p className="py-20 text-center text-neutral-400">Loading deal room...</p>
      </div>
    );
  }

  const { deal, messages, documents } = data;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="page-container">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Deal Room</h1>
            <p className="text-neutral-500">{deal.projectId.title}</p>
          </div>
          <span className={`badge ${statusColor(deal.dealStatus)}`}>{deal.dealStatus}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card flex h-[500px] flex-col">
              <h2 className="mb-4 font-medium text-neutral-900">Messages</h2>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {messages.map((msg) => {
                  const isOwn = msg.senderId._id === user?._id || msg.senderId.fullName === user?.fullName;
                  return (
                    <div
                      key={msg._id}
                      className={`max-w-[80%] rounded-md px-4 py-2.5 text-sm ${
                        isOwn
                          ? 'ml-auto bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <p className={`text-xs font-medium ${isOwn ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {msg.senderId.fullName}
                      </p>
                      <p className="mt-1">{msg.message}</p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn-primary !px-4">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-medium text-neutral-900">Deal Terms</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Offer Amount</span>
                  <span className="font-medium text-neutral-900">{formatCurrency(deal.offeredAmount)}</span>
                </div>
                {deal.equityRequested && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Equity</span>
                    <span className="font-medium text-neutral-900">{deal.equityRequested}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">NDA Signed</span>
                  <span className={deal.ndaSigned ? 'text-neutral-900' : 'text-amber-600'}>
                    {deal.ndaSigned ? 'Yes' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {!deal.ndaSigned && (
                  <button onClick={() => updateStatus('nda_signed')} className="btn-secondary w-full text-sm">
                    Sign NDA
                  </button>
                )}
                {deal.dealStatus === 'nda_signed' && (
                  <button onClick={() => updateStatus('negotiating')} className="btn-secondary w-full text-sm">
                    Start Negotiation
                  </button>
                )}
                {deal.dealStatus === 'negotiating' && (
                  <button onClick={() => updateStatus('accepted')} className="btn-primary w-full text-sm">
                    Accept Deal
                  </button>
                )}
              </div>
            </div>

            {documents.length > 0 && (
              <div className="card">
                <h3 className="font-medium text-neutral-900">Documents</h3>
                <div className="mt-3 space-y-2">
                  {documents.map((doc) => (
                    <div key={doc._id} className="flex items-center gap-2 text-sm text-neutral-600">
                      <FileText className="h-4 w-4" />
                      {doc.fileName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
