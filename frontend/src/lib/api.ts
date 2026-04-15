/**
 * Centralized API client for Car2Hand frontend
 * Auto-attaches auth token and handles 401 responses
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!stored) return null;
    try {
        const user = JSON.parse(stored);
        return user?.token || user?.accessToken || null;
    } catch {
        return null;
    }
}

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...Object.fromEntries(
            Object.entries(options.headers || {}).map(([k, v]) => [k, String(v)])
        ),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            document.cookie = 'has_session=; path=/; max-age=0';
            window.dispatchEvent(new Event('userLogout'));
        }
        throw new Error('กรุณาเข้าสู่ระบบใหม่');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || error.error || 'เกิดข้อผิดพลาด');
    }

    return response.json();
}
