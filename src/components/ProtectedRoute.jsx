import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────────────────────
   ProtectedRoute — Auth Guard
   - Shows a full-screen loader while Firebase resolves the session
   - Redirects to /login if no authenticated user
   - Optionally enforces allowedRoles if provided
   - Redirects to /unauthorized if access is denied
───────────────────────────────────────────────────────────── */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="auth-loading__inner">
                    <span className="auth-loading__logo">⬡</span>
                    <div className="auth-loading__spinner" />
                    <p className="auth-loading__text">Loading…</p>
                </div>

                <style>{`
                    .auth-loading {
                        min-height: 100vh;
                        background: #0F172A;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Inter', sans-serif;
                    }
                    .auth-loading__inner {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 1.1rem;
                    }
                    .auth-loading__logo {
                        font-size: 2.8rem;
                        color: #818CF8;
                        animation: logo-pulse 1.8s ease-in-out infinite;
                    }
                    .auth-loading__spinner {
                        width: 32px;
                        height: 32px;
                        border: 3px solid rgba(129,140,248,0.2);
                        border-top-color: #818CF8;
                        border-radius: 50%;
                        animation: spin 0.75s linear infinite;
                    }
                    .auth-loading__text {
                        color: rgba(255,255,255,0.45);
                        font-size: 0.85rem;
                        font-weight: 500;
                        letter-spacing: 0.01em;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes logo-pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.6; transform: scale(0.92); }
                    }
                `}</style>
            </div>
        );
    }

    /* ── Not authenticated ── */
    if (!profile) {
        return <Navigate to="/login" replace />;
    }

    /* ── Optional role check ── */
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
