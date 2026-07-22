import { apiClient } from './client';

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressData {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export type UpdateAddressData = Partial<CreateAddressData>;

export interface AddressListResponse {
  success: boolean;
  addresses: Address[];
}

export interface AddressSingleResponse {
  success: boolean;
  address: Address;
  message?: string;
}

export interface AddressDeleteResponse {
  success: boolean;
  message?: string;
}

/**
 * Retrieves all saved addresses for the authenticated user.
 */
export async function getAddresses(): Promise<AddressListResponse> {
  return apiClient.get<AddressListResponse>('/addresses');
}

/**
 * Retrieves a single saved address by ID.
 */
export async function getAddressById(id: string): Promise<AddressSingleResponse> {
  return apiClient.get<AddressSingleResponse>(`/addresses/${encodeURIComponent(id)}`);
}

/**
 * Creates a new saved address for the authenticated user.
 */
export async function createAddress(data: CreateAddressData): Promise<AddressSingleResponse> {
  return apiClient.post<AddressSingleResponse>('/addresses', data);
}

/**
 * Updates an existing saved address.
 */
export async function updateAddress(id: string, data: UpdateAddressData): Promise<AddressSingleResponse> {
  return apiClient.put<AddressSingleResponse>(`/addresses/${encodeURIComponent(id)}`, data);
}

/**
 * Deletes a saved address.
 */
export async function deleteAddress(id: string): Promise<AddressDeleteResponse> {
  return apiClient.delete<AddressDeleteResponse>(`/addresses/${encodeURIComponent(id)}`);
}
