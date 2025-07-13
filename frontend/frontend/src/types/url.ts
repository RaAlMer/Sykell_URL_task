export type UrlStatus = 'queued' | 'running' | 'done' | 'error';

export interface BrokenLink {
  id: number;
  url_id: number;
  url: string;
  status_code: number;
  created_at: string;
}

export interface UrlItem {
  id: number;
  address: string;
  status: UrlStatus;
  html_version?: string;
  title?: string;
  h1_count?: number;
  h2_count?: number;
  h3_count?: number;
  h4_count?: number;
  h5_count?: number;
  h6_count?: number;
  internal_links?: number;
  external_links?: number;
  broken_links?: number;
  has_login_form?: boolean;
  broken_links_details?: BrokenLink[];
  created_at: string;
  updated_at: string;
}
