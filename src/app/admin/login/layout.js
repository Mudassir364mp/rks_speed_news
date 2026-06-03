// The login page renders standalone â€” no AdminGuard, no sidebar
// This avoids the redirect loop: login page must be accessible without a session

export default function AdminLoginLayout({ children }) {
    return children;
}

