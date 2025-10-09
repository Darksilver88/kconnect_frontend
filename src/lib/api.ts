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
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      message: 'ไม่สามารถเชื่อมต่อ API ได้',
    };
  }
}
