import { apiClient } from './client';

export interface CmsContent {
  id: string;
  type: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  mediaUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsListResponse {
  success: boolean;
  content: CmsContent[];
}

export interface CmsSingleResponse {
  success: boolean;
  content: CmsContent;
}

/**
 * Retrieves all CMS content entries of a given type (e.g. JOURNAL, PHILOSOPHY, BOTANICS).
 */
export async function getContentByType(type: string): Promise<CmsListResponse> {
  return apiClient.get<CmsListResponse>(`/cms/type/${encodeURIComponent(type)}`);
}

/**
 * Retrieves a single CMS content entry by its URL slug.
 */
export async function getContentBySlug(slug: string): Promise<CmsSingleResponse> {
  return apiClient.get<CmsSingleResponse>(`/cms/slug/${encodeURIComponent(slug)}`);
}
