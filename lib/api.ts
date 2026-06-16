const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'investor' | 'founder' | 'admin';
  accountStatus: string;
  isVerified: boolean;
  avatarUrl?: string;
  phone?: string;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  industry: string;
  fundingGoal: number;
  equityOffered: number;
  valuation?: number;
  totalRaised: number;
  status: string;
  stage: string;
  country?: string;
  isFeatured?: boolean;
  coverImage?: string;
  images?: string[];
  founderId: {
    _id: string;
    businessName: string;
    userId: { fullName: string; isVerified: boolean };
  };
}

export interface Deal {
  _id: string;
  projectId: Project | string;
  investorId?: { _id: string; userId?: { fullName: string } };
  founderId?: { _id: string; businessName?: string; userId?: { fullName: string } };
  offeredAmount: number;
  equityRequested?: number;
  dealStatus: string;
  ndaSigned: boolean;
  createdAt: string;
}

export interface BusinessReview {
  _id: string;
  rating: number;
  reviewTitle?: string;
  reviewMessage?: string;
  investmentAmount?: number;
  roiStatus?: string;
  isVerifiedInvestor?: boolean;
  authorId?: { fullName: string };
  createdAt: string;
}

export interface FinancialSnapshot {
  monthlyRevenue?: number;
  yearlyRevenue?: number;
  profitMargin?: number;
  burnRate?: number;
  cashFlow?: number;
  debtRatio?: number;
  revenueVerified?: boolean;
  currency?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  experienceYears?: number;
  bio?: string;
  linkedin?: string;
  isVerified?: boolean;
}

export interface RoiReport {
  _id: string;
  expectedROI?: number;
  achievedROI?: number;
  periodLabel?: string;
  notes?: string;
  createdAt: string;
}

export interface TrustProfileData {
  founder: {
    _id: string;
    businessName: string;
    businessType?: string;
    description?: string;
    foundedYear?: number;
    teamSize?: number;
    userId?: { fullName: string; isVerified: boolean; createdAt?: string };
  };
  trustScore: number;
  trustLabel: string;
  breakdown: Record<string, number>;
  weights: Record<string, number>;
  risk: { level: string; score: number; factors: string[] };
  badges: Record<string, boolean>;
  fundingHistory: {
    totalRaised: number;
    totalInvestors: number;
    successfulClosures: number;
    activeDeals: number;
    totalProjects: number;
  };
  reviewStats: { count: number; average: number };
  milestoneStats: { total: number; completed: number };
  fraudHistory: {
    disputesTotal: number;
    disputesResolved: number;
    disputesOpen: number;
    fraudReports: number;
  };
  reviews: BusinessReview[];
  financials?: FinancialSnapshot | null;
  team: TeamMember[];
  roi: RoiReport[];
  projects: { _id: string; title: string; status: string; fundingGoal: number; totalRaised: number; industry?: string; stage?: string }[];
  milestones: { _id: string; title: string; status: string; targetDate?: string }[];
}

export interface PlatformReview {
  _id: string;
  rating: number;
  headline?: string;
  message: string;
  role?: string;
  status?: string;
  userId?: { fullName: string; role?: string; email?: string } | string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: { _id?: string; senderId: { fullName?: string; role?: string } | string; senderRole?: string; message: string; createdAt?: string }[];
  userId?: { fullName: string; email: string; role: string } | string;
  createdAt: string;
  updatedAt: string;
}
