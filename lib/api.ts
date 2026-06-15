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
  offeredAmount: number;
  equityRequested?: number;
  dealStatus: string;
  ndaSigned: boolean;
  createdAt: string;
}
