export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: amount >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: amount >= 1_000_000 ? 1 : 0,
  }).format(amount);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const INDUSTRIES = [
  'fintech', 'saas', 'healthtech', 'edtech', 'agritech',
  'ecommerce', 'proptech', 'cleantech', 'ai', 'other',
];

export const STAGES = ['pre-seed', 'seed', 'series-a', 'series-b', 'growth'];

export function industryLabel(industry: string) {
  return industry.charAt(0).toUpperCase() + industry.slice(1);
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    active: 'bg-indigo-50 text-indigo-700',
    pending: 'bg-amber-50 text-amber-700',
    pending_review: 'bg-amber-50 text-amber-700',
    negotiating: 'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    draft: 'bg-slate-100 text-slate-500',
    suspended: 'bg-red-50 text-red-600',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}
