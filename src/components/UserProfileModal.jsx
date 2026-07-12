import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserProfileModal.css';

const ROLE_COLOR = { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
const STATUS_COLOR = { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };

export default function UserProfileModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { profile, signOut, user } = useAuth();
    const panelRef = useRef(null);

    /* Close on Escape key */
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    /* Close on click outside panel */
    function handleBackdrop(e) {
        if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }

    if (!isOpen) return null;

    const onboarding = profile?.onboarding_progress ?? 100;
    const userId = user?.uid ? user.uid.slice(0, 8) + '…' : '—';
    const dateJoined = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';

    async function handleSignOut() {
        onClose();
        await signOut();
        navigate('/login', { replace: true });
    }

    return (
        <div className="upm__backdrop" onClick={handleBackdrop}>
            <div className="upm__panel" ref={panelRef}>

                {/* Close button */}
                <button className="upm__close" onClick={onClose} aria-label="Close profile">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* ── Header ── */}
                <div className="upm__header">
                    <div className="upm__avatar">
                        {profile?.initials ?? '?'}
                    </div>
                    <div className="upm__header-info">
                        <h2 className="upm__name">{profile?.full_name ?? 'User'}</h2>
                        <p className="upm__email">{profile?.email ?? '—'}</p>
                    </div>
                </div>

                {/* ── Status Badges ── */}
                <div className="upm__badges">
                    <span
                        className="upm__badge"
                        style={{
                            background: ROLE_COLOR.bg,
                            color: ROLE_COLOR.text,
                            borderColor: ROLE_COLOR.border,
                        }}
                    >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {profile?.role ?? 'Team Member'}
                    </span>
                    <span
                        className="upm__badge"
                        style={{
                            background: STATUS_COLOR.bg,
                            color: STATUS_COLOR.text,
                            borderColor: STATUS_COLOR.border,
                        }}
                    >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Active
                    </span>
                </div>

                {/* ── Divider ── */}
                <div className="upm__divider" />

                {/* ── Onboarding Progress ── */}
                <div className="upm__section">
                    <h3 className="upm__section-title">Workspace Setup</h3>
                    <div className="upm__progress-header">
                        <span className="upm__progress-label">
                            {onboarding >= 100 ? 'Fully Configured' : `${onboarding}% Complete`}
                        </span>
                        <span className="upm__progress-pct">{onboarding}%</span>
                    </div>
                    <div className="upm__progress-track">
                        <div
                            className={`upm__progress-fill ${onboarding >= 100 ? 'upm__progress-fill--done' : ''}`}
                            style={{ width: `${Math.min(onboarding, 100)}%` }}
                        />
                    </div>
                    {onboarding >= 100 && (
                        <p className="upm__progress-complete">
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Workspace Setup: 100% Complete
                        </p>
                    )}
                </div>

                {/* ── Account Details (Read-Only) ── */}
                <div className="upm__section">
                    <h3 className="upm__section-title">Account Details</h3>
                    <div className="upm__fields">
                        <div className="upm__field">
                            <label className="upm__field-label">User ID</label>
                            <div className="upm__field-value">{userId}</div>
                        </div>
                        <div className="upm__field">
                            <label className="upm__field-label">Date Joined</label>
                            <div className="upm__field-value">{dateJoined}</div>
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="upm__section">
                    <h3 className="upm__section-title">Quick Actions</h3>
                    <div className="upm__actions">
                        <button className="upm__action-btn upm__action-btn--primary" onClick={() => { onClose(); navigate('/dashboard/profile'); }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                        <button className="upm__action-btn">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            Reset Password
                        </button>
                        <button className="upm__action-btn">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notification Preferences
                        </button>
                    </div>
                </div>

                {/* ── Footer: Sign Out ── */}
                <div className="upm__footer">
                    <button className="upm__signout-btn" onClick={handleSignOut}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
