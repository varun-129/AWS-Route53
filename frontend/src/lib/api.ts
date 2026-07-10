/* eslint-disable */
// API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export type HostedZoneType = 'Public' | 'Private';

export interface User {
  id: number;
  username: string;
}

export interface Session {
  user: User;
  expires_at: string;
}

export interface HostedZone {
  id: number;
  name: string;
  type: HostedZoneType;
  comment?: string;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface DNSRecord {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: string;
  ttl: number;
  value: string;
  priority?: number;
  weight?: number;
  port?: number;
  created_at: string;
  updated_at: string;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Important for sending httpOnly cookies
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'API Error';
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.detail)) {
        message = errorData.detail.map((e: any) => e.msg).join(', ');
      } else {
        message = errorData.detail || errorData.message || message;
      }
    } catch (e) {
      // Ignored
    }
    throw new Error(message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: Record<string, string>) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  getSession: () => fetchApi<Session>('/auth/session'),

  // Hosted Zones
  getHostedZones: (page = 1, pageSize = 10, search?: string) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (search) params.append('search', search);
    return fetchApi<Paginated<HostedZone>>(`/hosted-zones?${params.toString()}`);
  },
  createHostedZone: (data: Partial<HostedZone>) => fetchApi<HostedZone>('/hosted-zones', { method: 'POST', body: JSON.stringify(data) }),
  getHostedZone: (id: number) => fetchApi<HostedZone>(`/hosted-zones/${id}`),
  updateHostedZone: (id: number, data: Partial<HostedZone>) => fetchApi<HostedZone>(`/hosted-zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHostedZone: (id: number) => fetchApi(`/hosted-zones/${id}`, { method: 'DELETE' }),

  // DNS Records
  getDnsRecords: (zoneId: number, page = 1, pageSize = 10, search?: string, type?: string, all?: boolean) => {
    const params = new URLSearchParams();
    if (!all) {
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
    } else {
      params.append('all', 'true');
    }
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    return fetchApi<Paginated<DNSRecord>>(`/hosted-zones/${zoneId}/records?${params.toString()}`);
  },
  createDnsRecord: (zoneId: number, data: Partial<DNSRecord>) => fetchApi<DNSRecord>(`/hosted-zones/${zoneId}/records`, { method: 'POST', body: JSON.stringify(data) }),
  getDnsRecord: (zoneId: number, recordId: number) => fetchApi<DNSRecord>(`/hosted-zones/${zoneId}/records/${recordId}`),
  updateDnsRecord: (zoneId: number, recordId: number, data: Partial<DNSRecord>) => fetchApi<DNSRecord>(`/hosted-zones/${zoneId}/records/${recordId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDnsRecord: (zoneId: number, recordId: number) => fetchApi(`/hosted-zones/${zoneId}/records/${recordId}`, { method: 'DELETE' }),
  bulkDeleteDnsRecords: (zoneId: number, recordIds: number[]) => fetchApi<{deleted_count: number}>(`/hosted-zones/${zoneId}/records/bulk`, { method: 'DELETE', body: JSON.stringify({ record_ids: recordIds }) }),
};
