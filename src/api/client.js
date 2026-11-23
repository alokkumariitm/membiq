// membiQ REST API Client with single-device lock and 28-day paywall interceptor

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor() {
    this.token = null;
    this.onSessionSuperseded = null;
    this.onSubscriptionLocked = null;
  }

  setToken(token) {
    this.token = token;
  }

  setInterceptors({ onSessionSuperseded, onSubscriptionLocked }) {
    if (onSessionSuperseded) this.onSessionSuperseded = onSessionSuperseded;
    if (onSubscriptionLocked) this.onSubscriptionLocked = onSubscriptionLocked;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      // Intercept 401: Single-Device Session Superseded
      if (response.status === 401 && (data.error === 'SESSION_SUPERSEDED' || data.forceLogout)) {
        if (this.onSessionSuperseded) {
          this.onSessionSuperseded(data.message);
        }
        return { error: data.error, message: data.message, forceLogout: true };
      }

      // Intercept 403: 28-Day Subscription Locked
      if (response.status === 403 && data.error === 'SUBSCRIPTION_LOCKED') {
        if (this.onSubscriptionLocked) {
          this.onSubscriptionLocked(data);
        }
        return { error: data.error, message: data.message, locked: true };
      }

      if (!response.ok) {
        return { error: data.error || data.message || `Request failed with status ${response.status}`, status: response.status };
      }

      return data;
    } catch (err) {
      // Offline or network error fallback
      console.warn(`[API Client Network Notice]: ${endpoint} - ${err.message}`);
      return { networkError: true, error: err.message };
    }
  }

  // Auth Endpoints
  async register(data) {
    return this.request('/auth/register', { method: 'POST', body: data });
  }

  async verifyOtp(data) {
    return this.request('/auth/verify-otp', { method: 'POST', body: data });
  }

  async login(data) {
    return this.request('/auth/login', { method: 'POST', body: data });
  }

  async getMe() {
    return this.request('/auth/me', { method: 'GET' });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async forgotPasswordRequest(data) {
    return this.request('/auth/forgot-password/request', { method: 'POST', body: data });
  }

  async forgotPasswordReset(data) {
    return this.request('/auth/forgot-password/reset', { method: 'POST', body: data });
  }

  async simulateRemoteLogin() {
    return this.request('/auth/simulate-remote-login', { method: 'POST' });
  }

  // Seat Endpoints
  async getSeats() {
    return this.request('/seats', { method: 'GET' });
  }

  async addSeat(data) {
    return this.request('/seats', { method: 'POST', body: data });
  }

  async updateSeatStatus(id, status, assignedStudent) {
    return this.request(`/seats/${id}/status`, { method: 'PATCH', body: { status, assignedStudent } });
  }

  async deleteSeat(id) {
    return this.request(`/seats/${id}`, { method: 'DELETE' });
  }

  // Student Endpoints
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/students${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async admitStudent(data) {
    return this.request('/students', { method: 'POST', body: data });
  }

  async updateStudent(id, data) {
    return this.request(`/students/${id}`, { method: 'PUT', body: data });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, { method: 'DELETE' });
  }

  // Payments & 28-day Extensions
  async verifyRazorpay(data) {
    return this.request('/payments/verify-razorpay', { method: 'POST', body: data });
  }

  async submitUpiUtr(data) {
    return this.request('/payments/submit-upi-utr', { method: 'POST', body: data });
  }

  // Super Admin Endpoints
  async superAdminLogin(adminId, password) {
    return this.request('/superadmin/login', { method: 'POST', body: { adminId, password } });
  }

  async getSuperAdminOwners(headers = {}) {
    return this.request('/superadmin/owners', { method: 'GET', headers });
  }
}

export const api = new ApiClient();
export default api;
