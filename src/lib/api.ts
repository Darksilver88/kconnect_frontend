/**
 * API utility function for making HTTP requests
 * Handles fetch, JSON parsing, and error catching
 * Returns a standardized response format
 */
export async function apiCall<T = any>(
  url: string,
  options?: RequestInit
): Promise<{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: any;
}> {
  try {
    // Get token from localStorage
    let token = '';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kconnect_user');
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          token = userData.token || '';
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Add Authorization header if token exists
    const headers = new Headers(options?.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Merge headers with options
    const finalOptions = {
      ...options,
      headers
    };

    const response = await fetch(url, finalOptions);
    const result = await response.json();

    // Check for 401 Unauthorized
    if (response.status === 401) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kconnect_user');
        document.cookie = 'kconnect_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Redirect to login
        window.location.href = '/login';
      }

      // Return error response and stop execution
      return {
        success: false,
        error: 'Unauthorized',
        message: result.message || 'กรุณา Login เข้าสู่ระบบ'
      };
    }

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      message: 'ไม่สามารถเชื่อมต่อ API ได้',
    };
  }
}
