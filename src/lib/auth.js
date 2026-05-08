/**
 * lib/auth.js
 * Updated Client-side authentication facade for RKS Speed News Admin
 * Now interfaces with server-side API routes for improved security
 */

const SESSION_KEY = 'rks_admin_user'; // Public user info (non-sensitive)

export const ROLE_LABELS = {
    super_admin: 'Super Admin',
    editor: 'Editor',
    reporter: 'Reporter',
    content_manager: 'Content Manager',
};

export const ROLE_COLORS = {
    super_admin: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
    editor: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    reporter: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    content_manager: { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' },
};

export const ROLE_PERMISSIONS = {
    super_admin: ['dashboard', 'articles', 'categories', 'authors', 'breaking-news', 'ads', 'comments', 'subscribers', 'seo', 'settings'],
    editor: ['dashboard', 'articles', 'categories', 'breaking-news', 'comments', 'seo'],
    reporter: ['dashboard', 'articles'],
    content_manager: ['dashboard', 'articles', 'categories', 'breaking-news'],
};

// ─── Client Session Management ────────────────────────────────────────────────
export const saveUser = (user) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const getUser = () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
};

export const clearUser = () => {
    if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
};

export const isAuthenticated = () => !!getUser();

// ─── Login ─────────────────────────────────────────────────────────────────────
export const login = async (email, password, rememberMe = false) => {
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await response.json();

        if (response.ok) {
            saveUser(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error || 'Login failed' };
        }
    } catch (error) {
        return { success: false, error: 'Network error occurred' };
    }
};

// ─── Logout ────────────────────────────────────────────────────────────────────
export const logout = async () => {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
        clearUser();
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
    }
};

// ─── Permission check ──────────────────────────────────────────────────────────
export const hasPermission = (user, section) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(section);
};
