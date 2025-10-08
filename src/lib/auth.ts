// Simple authentication utilities
export const STORAGE_KEY = 'kconnect_user';

export interface User {
  username: string;
  name: string;
}

// Fixed credentials for demo
const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  name: 'ผู้ดูแลระบบ'
};

export function login(username: string, password: string): User | null {
  if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
    const user = { username: DEMO_CREDENTIALS.username, name: DEMO_CREDENTIALS.name };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Also set cookie for middleware
      document.cookie = `kconnect_user=${JSON.stringify(user)}; path=/; max-age=86400`;
    }
    return user;
  }
  return null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    // Remove cookie
    document.cookie = 'kconnect_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
