/**
 * Centralized API Client
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
}

class APIClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
  }

  /**
   * Set access token (called after login)
   */
  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  /**
   * Clear tokens (called on logout)
   */
  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Private method to build headers
   */
  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): never {
    if (error instanceof Response) {
      // Network error
      throw new Error(`Network error: ${error.statusText}`);
    }

    if (typeof error === 'string') {
      throw new Error(error);
    }

    if (error.message) {
      throw new Error(error.message);
    }

    throw new Error('An unknown error occurred');
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(options.headers as Record<string, string>),
        credentials: 'include', // Include cookies
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          window.dispatchEvent(new Event('auth-expired'));
        }
        const error: ApiError = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(options.headers as Record<string, string>),
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          window.dispatchEvent(new Event('auth-expired'));
        }
        const error: ApiError = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(options.headers as Record<string, string>),
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          window.dispatchEvent(new Event('auth-expired'));
        }
        const error: ApiError = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(options.headers as Record<string, string>),
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          window.dispatchEvent(new Event('auth-expired'));
        }
        const error: ApiError = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadFiles<T = any>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {};
      const token = this.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          window.dispatchEvent(new Event('auth-expired'));
        }
        const error: ApiError = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.handleError(error);
    }
  }

  // ─── AUTH ENDPOINTS ─────────────────────────────────────────────

  async register(name: string, email: string, password: string) {
    return this.post('/auth/register', { name, email, password });
  }

  async login(email: string, password: string) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.data?.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }
    return response;
  }

  async logout() {
    this.clearTokens();
  }

  // ─── LISTING ENDPOINTS ───────────────────────────────────────────

  async getListings(filters: Record<string, any> = {}) {
    const params = new URLSearchParams(
      Object.entries(filters)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => [k, String(v)])
    );
    return this.get(`/listings?${params.toString()}`);
  }

  async getFeaturedListings() {
    return this.get('/listings/featured');
  }

  async getListingsByCategory(category: string) {
    return this.get(`/listings/category/${category}`);
  }

  async getListing(id: string) {
    return this.get(`/listings/${id}`);
  }

  async createListing(formData: FormData) {
    return this.uploadFiles('/listings', formData);
  }

  async updateListing(id: string, updates: Record<string, any>) {
    return this.put(`/listings/${id}`, updates);
  }

  async deleteListing(id: string) {
    return this.delete(`/listings/${id}`);
  }

  // ─── WISHLIST/FAVORITES ENDPOINTS ───────────────────────────────

  async getMyWishlists() {
    return this.get('/wishlists');
  }

  async createWishlist(name: string, description = '') {
    return this.post('/wishlists', { name, description });
  }

  async addToWishlist(wishlistId: string, listingId: string) {
    return this.post(`/wishlists/${wishlistId}/listings/${listingId}`);
  }

  async removeFromWishlist(wishlistId: string, listingId: string) {
    return this.delete(`/wishlists/${wishlistId}/listings/${listingId}`);
  }

  // ─── BOOKING ENDPOINTS ──────────────────────────────────────────

  async getMyBookings(status?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return this.get(`/bookings/my-bookings?${params.toString()}`);
  }

  async createBooking(listingId: string, checkIn: string, checkOut: string, guests: Record<string, any>) {
    return this.post('/bookings', {
      listingId,
      checkIn,
      checkOut,
      ...guests,
    });
  }

  async getBooking(id: string) {
    return this.get(`/bookings/${id}`);
  }

  async cancelBooking(id: string, reason: string) {
    return this.put(`/bookings/${id}/cancel`, { cancellationReason: reason });
  }

  // ─── USER ENDPOINTS ────────────────────────────────────────────

  async getProfile() {
    return this.get('/users/profile');
  }

  async updateProfile(updates: Record<string, any>) {
    return this.put('/users/profile', updates);
  }

  async becomeHost() {
    return this.put('/users/become-host', {});
  }

  // ─── MESSAGE ENDPOINTS ────────────────────────────────────────

  async getConversations() {
    return this.get('/messages/conversations');
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    return this.get(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`);
  }

  async sendMessage(recipientId: string, content: string, listingId?: string) {
    return this.post('/messages', {
      recipientId,
      content,
      listingId,
    });
  }
}

export const api = new APIClient(API_BASE_URL);
export default api;
