import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfileModal from './UserProfileModal';
import './DashboardLayout.css';

const navItems = [
    {
        label: 'Profile',
        path: '/dashboard/profile',
        icon: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

export default function DashboardLayout({ children, breadcrumb }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { profile, signOut } = useAuth();

    async function handleSignOut() {
        await signOut();
        navigate('/login', { replace: true });
    }

    return (
        <div className={`dash ${sidebarCollapsed ? 'dash--collapsed' : ''}`}>
            {/* ── Sidebar ── */}
            <aside className="dash__sidebar">
                <div className="dash__sidebar-top">
                    <Link to="/" className="dash__logo">
                        <span className="dash__logo-icon">⬡</span>
                        {!sidebarCollapsed && <span className="dash__logo-text">Boilerplate</span>}
                    </Link>

                    <button
                        className="dash__collapse-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        aria-label="Toggle sidebar"
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            {sidebarCollapsed ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            )}
                        </svg>
                    </button>
                </div>

                <nav className="dash__nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`dash__nav-item ${isActive ? 'active' : ''}`}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <span className="dash__nav-icon">{item.icon}</span>
                                {!sidebarCollapsed && <span className="dash__nav-label">{item.label}</span>}
                                {isActive && !sidebarCollapsed && <span className="dash__nav-indicator" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="dash__sidebar-bottom">
                    <div className="dash__user">
                        <div className="dash__user-avatar">{profile?.initials ?? '?'}</div>
                        {!sidebarCollapsed && (
                            <div className="dash__user-info">
                                <div className="dash__user-name">{profile?.full_name ?? 'Loading…'}</div>
                                <div className="dash__user-role">{profile?.role ?? ''}</div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="dash__logout"
                        title="Logout"
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="dash__main">
                {/* Header */}
                <header className="dash__header">
                    <div className="dash__breadcrumb">
                        {breadcrumb || 'Dashboard'}
                    </div>

                    <div className="dash__header-actions">
                        {/* Search */}
                        <div className="dash__search">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" placeholder="Search anything..." />
                        </div>

                        {/* Notification */}
                        <button className="dash__notif">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="dash__notif-badge">0</span>
                        </button>

                        {/* User mini */}
                        <div className="dash__header-user" onClick={() => setProfileOpen(true)} style={{ cursor: 'pointer' }}>
                            <div className="dash__header-avatar">{profile?.initials ?? '?'}</div>
                            {profile && (
                                <div className="dash__header-user-info">
                                    <span className="dash__header-user-name">{profile.full_name}</span>
                                    <span className="dash__header-dept-badge">{profile.role}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="dash__content">
                    {children}
                </div>
            </div>

            {/* Profile slide-over */}
            <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        </div>
    );
}
