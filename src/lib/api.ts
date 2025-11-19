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
    // Get token and customer_id from localStorage
    let token = '';
    let customerId = '';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kconnect_user');
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          token = userData.token || '';
          customerId = userData.customer_id || '';
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Auto-append customer_id to URL if not present
    let finalUrl = url;
    if (customerId && !url.includes('customer_id=')) {
      const separator = url.includes('?') ? '&' : '?';
      finalUrl = `${url}${separator}customer_id=${encodeURIComponent(customerId)}`;
    }

    // Add Authorization header if token exists
    const headers = new Headers(options?.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Auto-append customer_id to body for POST/PUT/DELETE if not present
    let finalOptions = {
      ...options,
      headers
    };

    if (customerId && options?.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
      try {
        const bodyData = JSON.parse(options.body as string);
        if (!bodyData.customer_id) {
          bodyData.customer_id = customerId;
          finalOptions.body = JSON.stringify(bodyData);
        }
      } catch {
        // If body is not JSON, skip
      }
    }

    const response = await fetch(finalUrl, finalOptions);
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
