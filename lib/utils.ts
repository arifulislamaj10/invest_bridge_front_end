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

export const PROOF_BADGES = [
  { key: 'business_registration', label: 'Business Registration' },
  { key: 'factory_verified', label: 'Premises / Factory Verified' },
  { key: 'kyc', label: 'KYC Complete' },
  { key: 'proof_of_funds', label: 'Financials Verified' },
  { key: 'identity', label: 'Identity Verified' },
  { key: 'tax', label: 'Tax Compliant' },
];

// Which approved verification type each proof badge requires. Mirrors the backend
// (backend/src/utils/proofBadges.js) so the UI can show verified vs. pending claims.
export const BADGE_REQUIREMENT: Record<string, string> = {
  identity: 'identity',
  kyc: 'identity',
  business_registration: 'business',
  tax: 'business',
  factory_verified: 'address',
  proof_of_funds: 'proof_of_funds',
};

export const VERIFICATION_TYPE_LABEL: Record<string, string> = {
  identity: 'Identity',
  business: 'Business License',
  address: 'Address',
  proof_of_funds: 'Proof of Funds',
  bank: 'Bank',
  revenue: 'Revenue',
};

export function proofLabel(key: string) {
  return (
    PROOF_BADGES.find((b) => b.key === key)?.label ||
    key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
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
