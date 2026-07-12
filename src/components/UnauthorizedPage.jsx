import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UnauthorizedPage.css';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    const home = '/dashboard';

    return (
        <div className="unauth">
            <div className="unauth__card">
                {/* Lock Icon */}
                <div className="unauth__icon">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h1 className="unauth__title">Access Denied</h1>
                <p className="unauth__message">
                    You don't have permission to access this page.<br />
                    Contact your administrator if you believe this is an error.
                </p>

                <div className="unauth__meta">
                    <span className="unauth__badge">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {profile?.role || 'Member'}
                    </span>
                </div>

                <button className="unauth__btn" onClick={() => navigate(home, { replace: true })}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}
