/**
 * lib/auth.js
 * Client-side authentication facade for RKS Speed News Admin
 * Interfaces with server-side API routes for security
 */

const SESSION_KEY = 'rks_admin_user';

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

// â”€â”€â”€ Client Session Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const saveUser = (user) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        ...user,
        loginAt: new Date().toISOString(),
        avatar: user.name ? user.name.charAt(0).toUpperCase() : 'A',
    }));
};

export const getUser = () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
};

// âœ… getSession alias â€” AdminGuard aur activity page use karta hai
export const getSession = () => getUser();

export const clearUser = () => {
    if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
};

export const isAuthenticated = () => !!getUser();

// â”€â”€â”€ Activity Log (localStorage based) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ACTIVITY_KEY = 'rks_activity_logs';

export const logActivity = (action, detail = '') => {
    if (typeof window === 'undefined') return;
    const user = getUser();
    const logs = getActivityLogs();
    const newLog = {
        id: Date.now().toString(),
        userId: user?.email || 'unknown',
        action,
        detail,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
    };
    const updated = [newLog, ...logs].slice(0, 100); // max 100 logs
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
};

// âœ… getActivityLogs â€” activity page use karta hai
export const getActivityLogs = () => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
};

// â”€â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            logActivity('LOGIN', `Logged in as ${email}`);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error || 'Login failed' };
        }
    } catch (error) {
        return { success: false, error: 'Network error occurred' };
    }
};

// â”€â”€â”€ Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const logout = async () => {
    logActivity('LOGOUT', 'User signed out');
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
        clearUser();
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
    }
};

// â”€â”€â”€ Permission check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const hasPermission = (user, section) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(section);
};

// â”€â”€â”€ Login attempts (brute force protection) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getLoginAttempts = (email) => {
    if (typeof window === 'undefined') return { count: 0, locked: false };
    const raw = localStorage.getItem(`rks_attempts_${email}`);
    if (!raw) return { count: 0, locked: false };
    const data = JSON.parse(raw);
    // Auto-unlock after 15 minutes
    if (data.lockedAt && Date.now() - new Date(data.lockedAt).getTime() > 15 * 60 * 1000) {
        localStorage.removeItem(`rks_attempts_${email}`);
        return { count: 0, locked: false };
    }
    return data;
};
