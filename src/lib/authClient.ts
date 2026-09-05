export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: string; // 'ROLE_ADMIN'
  avatarUrl?: string;
}

const TOKEN_KEY = 'ziggers_admin_jwt';
const USER_KEY = 'ziggers_admin_user';

export const authClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    if (!token || !user) return false;
    return user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' || user.role?.includes('ADMIN');
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
