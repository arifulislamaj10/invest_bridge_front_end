'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Show a text input (e.g. a rejection reason); its value is returned. */
  promptLabel?: string;
  promptPlaceholder?: string;
  promptRequired?: boolean;
  /** Require the user to type this exact text to enable confirm (e.g. "DELETE"). */
  requireText?: string;
}

export interface ConfirmResult {
  confirmed: boolean;
  value: string;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<ConfirmResult>;

const ConfirmContext = createContext<ConfirmFn>(async () => ({ confirmed: false, value: '' }));

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((r: ConfirmResult) => void) | null>(null);
  const [value, setValue] = useState('');
  const [typed, setTyped] = useState('');

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    setValue('');
    setTyped('');
    return new Promise<ConfirmResult>((resolve) => setResolver(() => resolve));
  }, []);

  const finish = (confirmed: boolean) => {
    resolver?.({ confirmed, value });
    setOpts(null);
    setResolver(null);
  };

  const blockedByText = !!opts?.requireText && typed !== opts.requireText;
  const blockedByPrompt = !!opts?.promptRequired && !value.trim();
  const confirmDisabled = blockedByText || blockedByPrompt;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => finish(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${opts.danger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {opts.danger ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{opts.title}</h3>
                {opts.message && <p className="mt-1 text-sm leading-relaxed text-slate-600">{opts.message}</p>}
              </div>
            </div>

            {opts.promptLabel && (
              <div className="mt-4">
                <label className="label">{opts.promptLabel}</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder={opts.promptPlaceholder}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {opts.requireText && (
              <div className="mt-4">
                <label className="label">Type <span className="font-mono font-bold text-red-600">{opts.requireText}</span> to confirm</label>
                <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => finish(false)} className="btn-secondary !py-2.5 text-sm">
                {opts.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => finish(true)}
                disabled={confirmDisabled}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  opts.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                }`}
              >
                {opts.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
