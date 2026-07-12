import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    signInWithPopup,
    signInWithRedirect,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { ensureUserDocument } from '../context/AuthContext';
import './AuthPage.css';

const DEPARTMENTS = [
    { value: '', label: 'Select Department' },
    { value: 'Management', label: 'Management' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Sales', label: 'Sales' },
    { value: 'CRM', label: 'CRM' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operations', label: 'Operations' },
];

export default function AuthPage() {
    const navigate = useNavigate();

    // ─── Mode ───
    const [mode, setMode] = useState('signin');
    const isSignUp = mode === 'signup';

    // ─── Sign-in states ───
    const [emailState, setEmailState] = useState('');
    const [passwordState, setPasswordState] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // ─── Signup states ───
    const [nameState, setNameState] = useState('');
    const [signupEmailState, setSignupEmailState] = useState('');
    const [signupPasswordState, setSignupPasswordState] = useState('');
    const [confirmPasswordState, setConfirmPasswordState] = useState('');
    const [departmentState, setDepartmentState] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── Forgot Password modal ───
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isSendingReset, setIsSendingReset] = useState(false);

    // ─── UI ───
    const [authError, setAuthError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // ─── Toasts ───
    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);

    // ── Derived (signup) ──
    const passwordsMatch = signupPasswordState && confirmPasswordState && signupPasswordState === confirmPasswordState;
    const canSubmitSignup = nameState.trim() && signupEmailState.trim() && departmentState
        && signupPasswordState.length >= 6 && passwordsMatch && !isSubmitting;

    // ════════════════════════════════════════════
    //  HELPERS
    // ════════════════════════════════════════════

    const addToast = useCallback((message, type = 'error') => {
        const id = ++toastIdRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const handleSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1800);
    };

    function friendlyError(err) {
        const code = err.code || '';
        const map = {
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Invalid credentials. Please try again.',
            'auth/email-already-in-use': 'This email is already registered. Try signing in.',
            'auth/weak-password': 'Password must be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
        };
        return map[code] || err.message || 'An unexpected error occurred.';
    }

    // ════════════════════════════════════════════
    //  GOOGLE LOGIN
    // ════════════════════════════════════════════

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await ensureUserDocument(result.user);
            handleSuccess();
        } catch (err) {
            // Some browsers/extensions restrict popup polling (window.closed / COOP); fallback to redirect flow.
            const popupRelatedCodes = new Set([
                'auth/popup-blocked',
                'auth/cancelled-popup-request',
            ]);
            if (popupRelatedCodes.has(err.code)) {
                await signInWithRedirect(auth, googleProvider);
                return;
            }

            if (err.code === 'auth/popup-closed-by-user') return;
            const msg = friendlyError(err);
            setAuthError(msg);
            addToast(msg, 'error');
        }
    };

    // ════════════════════════════════════════════
    //  EMAIL / PASSWORD SIGN IN
    // ════════════════════════════════════════════

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = emailState.trim().toLowerCase();
        if (!email || !passwordState) return;

        setIsLoggingIn(true);
        setAuthError('');

        try {
            const { user } = await signInWithEmailAndPassword(auth, email, passwordState);

            // ── Email verification gate ──
            if (!user.emailVerified) {
                // Send another verification email in case they lost the first
                try { await sendEmailVerification(user); } catch (_) { /* ignore if already sent recently */ }
                await auth.signOut();
                setAuthError('Please verify your email first. A new verification link has been sent.');
                addToast('Please verify your email address before logging in. Check your inbox.', 'warning');
                setIsLoggingIn(false);
                return;
            }

            handleSuccess();
        } catch (err) {
            const msg = friendlyError(err);
            setAuthError(msg);
            addToast(msg, 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    // ════════════════════════════════════════════
    //  CREATE ACCOUNT
    // ════════════════════════════════════════════

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        if (!canSubmitSignup) return;

        setIsSubmitting(true);
        setAuthError('');

        try {
            const email = signupEmailState.trim().toLowerCase();
            const { user } = await createUserWithEmailAndPassword(auth, email, signupPasswordState);

            // Set displayName on Firebase Auth profile
            await updateProfile(user, { displayName: nameState.trim() });

            // Send email verification
            await sendEmailVerification(user);

            // Create Firestore document with full signup data
            await ensureUserDocument(user, {
                fullName: nameState.trim(),
                department: departmentState,
            });

            // Sign out — they must verify email first
            await auth.signOut();

            addToast('Account created! Please check your email to verify your address before logging in.', 'success');
            switchMode('signin');
        } catch (err) {
            const msg = friendlyError(err);
            setAuthError(msg);
            addToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ════════════════════════════════════════════
    //  FORGOT PASSWORD
    // ════════════════════════════════════════════

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const email = forgotEmail.trim().toLowerCase();
        if (!email) {
            addToast('Please enter your email address.', 'warning');
            return;
        }

        setIsSendingReset(true);
        try {
            await sendPasswordResetEmail(auth, email);
            addToast('Password reset link sent! Check your inbox.', 'success');
            setShowForgotModal(false);
            setForgotEmail('');
        } catch (err) {
            const msg = friendlyError(err);
            addToast(msg, 'error');
        } finally {
            setIsSendingReset(false);
        }
    };

    // ════════════════════════════════════════════
    //  STATE RESETS
    // ════════════════════════════════════════════

    const switchMode = (newMode) => {
        setMode(newMode);
        setAuthError('');
        setShowSuccess(false);
        // Reset sign-in
        setEmailState(''); setPasswordState(''); setShowPassword(false);
        // Reset signup
        setNameState(''); setSignupEmailState(''); setSignupPasswordState('');
        setConfirmPasswordState(''); setDepartmentState('');
        setShowSignupPassword(false); setShowConfirmPassword(false);
    };

    // ════════════════════════════════════════════
    //  RENDER HELPERS
    // ════════════════════════════════════════════

    const ToastIcon = ({ type }) => {
        if (type === 'success') return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
        if (type === 'error') return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
        return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z" /></svg>;
    };

    const ErrorBlock = () => authError ? (
        <div className="auth__error">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            {authError}
        </div>
    ) : null;

    const EyeButton = ({ show, toggle }) => (
        <button type="button" className="auth__eye" onClick={toggle} aria-label="Toggle password visibility">
            {show ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
            ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
        </button>
    );

    // ── Access Granted overlay ──
    if (showSuccess) {
        return (
            <div className="auth auth--success-overlay">
                <div className="auth__success-card">
                    <div className="auth__success-check">
                        <svg viewBox="0 0 52 52" className="auth__success-svg"><circle className="auth__success-circle" cx="26" cy="26" r="25" fill="none" /><path className="auth__success-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>
                    </div>
                    <h2 className="auth__success-title">Access Granted</h2>
                    <p className="auth__success-sub">Redirecting to your dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth">
            {/* ── Toasts ── */}
            <div className="auth__toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`auth__toast auth__toast--${t.type}`}>
                        <span className="auth__toast-icon"><ToastIcon type={t.type} /></span>
                        <span className="auth__toast-msg">{t.message}</span>
                        <button className="auth__toast-close" onClick={() => removeToast(t.id)}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* ── Forgot Password Modal ── */}
            {showForgotModal && (
                <div className="auth__modal-overlay" onClick={() => setShowForgotModal(false)}>
                    <div className="auth__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="auth__modal-header">
                            <h3 className="auth__modal-title">Reset Password</h3>
                            <button className="auth__modal-close" onClick={() => setShowForgotModal(false)}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="auth__modal-desc">Enter your email and we'll send you a link to reset your password.</p>
                        <form onSubmit={handleForgotPassword}>
                            <div className="auth__field">
                                <input
                                    id="auth-forgot-email"
                                    type="email"
                                    placeholder=" "
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <label htmlFor="auth-forgot-email">Email address</label>
                            </div>
                            <button type="submit" className="btn btn-primary btn-large auth__submit" style={{ marginTop: '1rem' }} disabled={isSendingReset || !forgotEmail.trim()}>
                                {isSendingReset ? (<><span className="auth__spinner" />Sending…</>) : (<>Send Reset Link<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>)}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Left Panel ── */}
            <div className="auth__left">
                <div className="auth__left-content">
                    <Link to="/" className="auth__logo"><span className="auth__logo-icon">⬡</span>CoreNexa</Link>
                    <div className="auth__testimonial">
                        <div className="auth__stat"><span className="auth__stat-number">10,000+</span><span className="auth__stat-label">business tasks automated daily</span></div>
                        <blockquote className="auth__quote">"CoreNexa replaced three separate tools for us. Our ops team went from firefighting to strategic planning in two weeks."</blockquote>
                        <div className="auth__quote-author"><div className="auth__avatar">SK</div><div><div className="auth__author-name">Shekhat Dhruvil</div><div className="auth__author-role">VP of Operations, ScaleUp Inc.</div></div></div>
                    </div>
                    <div className="auth__orb auth__orb--1" /><div className="auth__orb auth__orb--2" /><div className="auth__orb auth__orb--3" />
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div className="auth__right">
                <div className="auth__form-wrapper">
                    {/* Toggle */}
                    <div className="auth__toggle">
                        <button className={`auth__toggle-btn ${!isSignUp ? 'active' : ''}`} onClick={() => switchMode('signin')}>Sign In</button>
                        <button className={`auth__toggle-btn ${isSignUp ? 'active' : ''}`} onClick={() => switchMode('signup')}>Create Account</button>
                    </div>

                    {/* ═══════════ SIGN IN ═══════════ */}
                    {!isSignUp && (
                        <>
                            <h1 className="auth__title">Welcome back</h1>
                            <p className="auth__subtitle">Sign in to continue to your dashboard.</p>

                            {/* Google Login — Prominent */}
                            <button type="button" className="auth__google" onClick={handleGoogleLogin}>
                                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>
                                Continue with Google
                            </button>

                            <div className="auth__divider"><span>or</span></div>

                            <form className="auth__form" onSubmit={handleLogin}>
                                <div className="auth__field">
                                    <input
                                        id="auth-email"
                                        type="email"
                                        placeholder=" "
                                        value={emailState}
                                        onChange={(e) => { setAuthError(''); setEmailState(e.target.value); }}
                                        required
                                        autoFocus
                                        autoComplete="email"
                                    />
                                    <label htmlFor="auth-email">Email address</label>
                                </div>

                                <div className="auth__field">
                                    <input
                                        id="auth-pw-login"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder=" "
                                        value={passwordState}
                                        onChange={(e) => { setAuthError(''); setPasswordState(e.target.value); }}
                                        required
                                        minLength={6}
                                        autoComplete="current-password"
                                    />
                                    <label htmlFor="auth-pw-login">Password</label>
                                    <EyeButton show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                                </div>

                                <div className="auth__forgot-row">
                                    <button type="button" className="auth__forgot-link" onClick={() => { setShowForgotModal(true); setForgotEmail(emailState); }}>
                                        Forgot Password?
                                    </button>
                                </div>

                                <ErrorBlock />

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-large auth__submit"
                                    disabled={isLoggingIn || !emailState.trim() || !passwordState}
                                >
                                    {isLoggingIn ? (
                                        <><span className="auth__spinner" />Signing in…</>
                                    ) : (
                                        <>
                                            Sign In
                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="auth__footer-text">
                                Don&apos;t have an account?{' '}
                                <button className="auth__switch" onClick={() => switchMode('signup')}>Create one</button>
                            </p>
                        </>
                    )}

                    {/* ═══════════ CREATE ACCOUNT ═══════════ */}
                    {isSignUp && (
                        <>
                            <h1 className="auth__title">Create your account</h1>
                            <p className="auth__subtitle">Join your team on CoreNexa in minutes.</p>

                            {/* Google — also available on signup */}
                            <button type="button" className="auth__google" onClick={handleGoogleLogin}>
                                <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>
                                Continue with Google
                            </button>

                            <div className="auth__divider"><span>or</span></div>

                            <form className="auth__form" onSubmit={handleCreateAccount}>
                                {/* Full Name */}
                                <div className="auth__field">
                                    <input id="auth-name" type="text" placeholder=" " value={nameState} onChange={(e) => { setAuthError(''); setNameState(e.target.value); }} required autoFocus />
                                    <label htmlFor="auth-name">Full Name</label>
                                </div>

                                {/* Email */}
                                <div className="auth__field">
                                    <input id="auth-email-signup" type="email" placeholder=" " value={signupEmailState} onChange={(e) => { setAuthError(''); setSignupEmailState(e.target.value); }} required autoComplete="email" />
                                    <label htmlFor="auth-email-signup">Business Email</label>
                                </div>

                                {/* Department */}
                                <div className="auth__field auth__field--select">
                                    <select id="auth-department" value={departmentState} onChange={(e) => { setAuthError(''); setDepartmentState(e.target.value); }} required className={departmentState ? 'has-value' : ''}>
                                        {DEPARTMENTS.map((d) => (<option key={d.value} value={d.value} disabled={!d.value}>{d.label}</option>))}
                                    </select>
                                    <label htmlFor="auth-department">Department</label>
                                    <svg className="auth__select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </div>

                                {/* Password */}
                                <div className="auth__field">
                                    <input id="auth-pw-signup" type={showSignupPassword ? 'text' : 'password'} placeholder=" " value={signupPasswordState} onChange={(e) => { setAuthError(''); setSignupPasswordState(e.target.value); }} required minLength={6} autoComplete="new-password" />
                                    <label htmlFor="auth-pw-signup">Password</label>
                                    <EyeButton show={showSignupPassword} toggle={() => setShowSignupPassword(!showSignupPassword)} />
                                </div>

                                {/* Confirm Password */}
                                <div className="auth__field">
                                    <input id="auth-pw-confirm" type={showConfirmPassword ? 'text' : 'password'} placeholder=" " value={confirmPasswordState} onChange={(e) => { setAuthError(''); setConfirmPasswordState(e.target.value); }} required minLength={6} autoComplete="new-password" />
                                    <label htmlFor="auth-pw-confirm">Confirm Password</label>
                                    <EyeButton show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                                </div>

                                {/* Password match indicator */}
                                {confirmPasswordState && (
                                    <div className={`auth__pw-match ${passwordsMatch ? 'auth__pw-match--ok' : 'auth__pw-match--fail'}`}>
                                        {passwordsMatch ? (
                                            <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Passwords match</>
                                        ) : (
                                            <><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Passwords do not match</>
                                        )}
                                    </div>
                                )}

                                <ErrorBlock />

                                <button type="submit" className="btn btn-primary btn-large auth__submit" disabled={!canSubmitSignup}>
                                    {isSubmitting ? (<><span className="auth__spinner" />Creating Account…</>) : (<>Create Account<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>)}
                                </button>
                            </form>

                            <p className="auth__footer-text">
                                Already have an account?{' '}
                                <button className="auth__switch" onClick={() => switchMode('signin')}>Sign In</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
