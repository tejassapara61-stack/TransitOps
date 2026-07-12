import { useState, useRef, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import DashboardLayout from './DashboardLayout';
import './ProfilePage.css';

const IMGBB_KEY = 'a22afb049d4dae51dca57196fa0ce52e';

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

/* Generate short hex ID */
function genHexId() {
    return Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

/* Format timestamp → DD MMM YYYY */
function formatDate(raw) {
    if (!raw) return '—';
    const d = typeof raw === 'string' ? new Date(raw) : raw.toDate?.() ?? new Date(raw);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ProfilePage() {
    const { profile, user } = useAuth();

    // ─── Form states ───
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [headline, setHeadline] = useState('');
    const [summary, setSummary] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [userId, setUserId] = useState('');
    const [dateJoined, setDateJoined] = useState('');

    // ─── UI states ───
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const fileInputRef = useRef(null);

    // ─── Toasts ───
    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);

    const addToast = useCallback((message, type = 'error') => {
        const id = ++toastIdRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ════════════════════════════════════════════
    //  LOAD from Firestore
    // ════════════════════════════════════════════

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    const d = snap.data();
                    const fullName = d.fullName || profile?.full_name || '';
                    const nameParts = fullName.split(' ');
                    setFirstName(d.firstName || nameParts[0] || '');
                    setLastName(d.lastName || nameParts.slice(1).join(' ') || '');
                    setHeadline(d.headline || '');
                    setSummary(d.summary || d.bio || '');
                    setJobTitle(d.jobTitle || d.role || '');
                    setDepartment(d.department || '');
                    setEmail(d.email || user.email || '');
                    setPhone(d.phone || '');
                    setLinkedinUrl(d.linkedinUrl || '');
                    setPortfolioUrl(d.portfolioUrl || '');
                    setAvatarUrl(d.avatarUrl || '');
                    setUserId(d.shortId || genHexId());
                    setDateJoined(formatDate(d.createdAt));
                } else {
                    const fullName = profile?.full_name || '';
                    const nameParts = fullName.split(' ');
                    setFirstName(nameParts[0] || '');
                    setLastName(nameParts.slice(1).join(' ') || '');
                    setEmail(user.email || '');
                    setUserId(genHexId());
                    setDateJoined(formatDate(new Date().toISOString()));
                }
                setIsLoaded(true);
            } catch (err) {
                console.error('[Profile] Load error:', err);
                addToast('Failed to load profile data.', 'error');
                setIsLoaded(true);
            }
        })();
    }, [user]);  // eslint-disable-line react-hooks/exhaustive-deps

    // ════════════════════════════════════════════
    //  IMAGE UPLOAD → ImgBB
    // ════════════════════════════════════════════

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addToast('Please select an image file.', 'warning');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            addToast('Image must be under 5 MB.', 'warning');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
                method: 'POST',
                body: formData,
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.error?.message || 'Upload failed');

            setAvatarUrl(json.data.display_url);
            addToast('Avatar uploaded successfully!', 'success');
        } catch (err) {
            console.error('[ImgBB] Upload error:', err);
            addToast('Image upload failed. Please try again.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // ════════════════════════════════════════════
    //  SAVE to Firestore
    // ════════════════════════════════════════════

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
                headline: headline.trim(),
                summary: summary.trim(),
                jobTitle: jobTitle.trim(),
                department,
                phone: phone.trim(),
                linkedinUrl: linkedinUrl.trim(),
                portfolioUrl: portfolioUrl.trim(),
                avatarUrl,
                shortId: userId,
            });
            addToast('Profile updated successfully', 'success');
        } catch (err) {
            console.error('[Profile] Save error:', err);
            addToast('Failed to save profile. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // ════════════════════════════════════════════
    //  DERIVED
    // ════════════════════════════════════════════

    const displayName = `${firstName} ${lastName}`.trim() || 'Your Name';
    const initials = displayName !== 'Your Name'
        ? displayName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
        : '?';

    // ════════════════════════════════════════════
    //  TOAST ICONS
    // ════════════════════════════════════════════

    const ToastIcon = ({ type }) => {
        if (type === 'success') return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
        if (type === 'error') return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
        return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z" /></svg>;
    };

    // ════════════════════════════════════════════
    //  LOADING STATE
    // ════════════════════════════════════════════

    if (!isLoaded) {
        return (
            <DashboardLayout breadcrumb={<>Dashboard <span style={{ color: 'var(--color-muted)', margin: '0 0.35rem' }}>/</span> <span>Profile</span></>}>
                <div className="pf__loading"><span className="pf__spinner" />Loading profile…</div>
            </DashboardLayout>
        );
    }

    // ════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════

    return (
        <DashboardLayout breadcrumb={<>Dashboard <span style={{ color: 'var(--color-muted)', margin: '0 0.35rem' }}>/</span> <span>Profile Settings</span></>}>
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

            <div className="pf">
                <div className="pf__header">
                    <h2 className="pf__page-title">Professional Profile</h2>
                    <p className="pf__page-desc">Build your professional identity — visible across CoreNexa.</p>
                </div>

                <div className="pf__layout">
                    {/* ═══════════ LEFT COLUMN — Avatar Card ═══════════ */}
                    <div className="pf__sidebar-card">
                        {/* Avatar */}
                        <div className="pf__avatar-center">
                            <div className="pf__avatar-wrap" onClick={() => fileInputRef.current?.click()}>
                                {isUploading ? (
                                    <div className="pf__avatar-loading"><span className="pf__spinner" /></div>
                                ) : avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="pf__avatar-img" />
                                ) : (
                                    <div className="pf__avatar-initials">{initials}</div>
                                )}
                                <div className="pf__avatar-overlay">
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="pf__file-input" onChange={handleImageSelect} />
                            </div>
                            <h3 className="pf__avatar-name">{displayName}</h3>
                            <p className="pf__avatar-role">{headline || jobTitle || 'Your Headline'}</p>
                            <p className="pf__avatar-hint">Click avatar to upload photo</p>
                        </div>

                        <div className="pf__divider" />

                        {/* Quick Info */}
                        <div className="pf__sidebar-meta">
                            <div className="pf__sidebar-meta-row">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                                <span>{userId || '—'}</span>
                            </div>
                            <div className="pf__sidebar-meta-row">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>Joined {dateJoined}</span>
                            </div>
                        </div>
                    </div>

                    {/* ═══════════ RIGHT COLUMN — Form Sections ═══════════ */}
                    <div className="pf__form-column">

                        {/* ── Section 1: Basic Info ── */}
                        <div className="pf__card">
                            <div className="pf__card-header">
                                <div className="pf__card-icon">
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div>
                                    <h3 className="pf__card-title">Basic Information</h3>
                                    <p className="pf__card-subtitle">Your name and professional headline.</p>
                                </div>
                            </div>

                            <div className="pf__field-group">
                                <div className="pf__field">
                                    <label className="pf__label" htmlFor="pf-first">First Name</label>
                                    <input
                                        id="pf-first"
                                        type="text"
                                        className="pf__input"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="e.g. Tejas"
                                    />
                                </div>
                                <div className="pf__field">
                                    <label className="pf__label" htmlFor="pf-last">Last Name</label>
                                    <input
                                        id="pf-last"
                                        type="text"
                                        className="pf__input"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="e.g. Sharma"
                                    />
                                </div>
                            </div>

                            <div className="pf__field">
                                <label className="pf__label" htmlFor="pf-headline">Headline</label>
                                <input
                                    id="pf-headline"
                                    type="text"
                                    className="pf__input"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder="e.g. CEO at CoreNexa | AI Automation Expert"
                                />
                                <span className="pf__field-hint">A short tagline that describes your professional brand.</span>
                            </div>
                        </div>

                        {/* ── Section 2: About ── */}
                        <div className="pf__card">
                            <div className="pf__card-header">
                                <div className="pf__card-icon">
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <h3 className="pf__card-title">About</h3>
                                    <p className="pf__card-subtitle">Tell your team about your experience and expertise.</p>
                                </div>
                            </div>

                            <div className="pf__field">
                                <label className="pf__label" htmlFor="pf-summary">Summary / Bio</label>
                                <textarea
                                    id="pf-summary"
                                    className="pf__textarea"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Write a professional summary about yourself — your skills, experience, and what drives you…"
                                    rows={5}
                                />
                                <span className="pf__field-hint">{summary.length}/2000 characters</span>
                            </div>
                        </div>

                        {/* ── Section 3: Current Role ── */}
                        <div className="pf__card">
                            <div className="pf__card-header">
                                <div className="pf__card-icon">
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <h3 className="pf__card-title">Current Role</h3>
                                    <p className="pf__card-subtitle">Your position within the organization.</p>
                                </div>
                            </div>

                            <div className="pf__field-group">
                                <div className="pf__field">
                                    <label className="pf__label" htmlFor="pf-title">Job Title</label>
                                    <input
                                        id="pf-title"
                                        type="text"
                                        className="pf__input"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g. Product Manager"
                                    />
                                </div>
                                <div className="pf__field">
                                    <label className="pf__label" htmlFor="pf-dept">Department</label>
                                    <div className="pf__select-wrap">
                                        <select
                                            id="pf-dept"
                                            className={`pf__input pf__select ${department ? 'has-value' : ''}`}
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                        >
                                            {DEPARTMENTS.map((d) => (
                                                <option key={d.value} value={d.value} disabled={!d.value}>{d.label}</option>
                                            ))}
                                        </select>
                                        <svg className="pf__select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Section 4: Contact & Links ── */}
                        <div className="pf__card">
                            <div className="pf__card-header">
                                <div className="pf__card-icon">
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                </div>
                                <div>
                                    <h3 className="pf__card-title">Contact & Links</h3>
                                    <p className="pf__card-subtitle">How colleagues and partners can reach you.</p>
                                </div>
                            </div>

                            <div className="pf__field">
                                <label className="pf__label" htmlFor="pf-email">Email Address</label>
                                <div className="pf__input-icon-wrap">
                                    <svg className="pf__input-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <input id="pf-email" type="email" className="pf__input pf__input--disabled pf__input--icon" value={email} disabled />
                                </div>
                                <span className="pf__field-hint">Email is managed by your authentication provider.</span>
                            </div>

                            <div className="pf__field">
                                <label className="pf__label" htmlFor="pf-phone">Phone Number</label>
                                <div className="pf__input-icon-wrap">
                                    <svg className="pf__input-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <input
                                        id="pf-phone"
                                        type="tel"
                                        className="pf__input pf__input--icon"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="pf__divider" />

                            <div className="pf__field">
                                <label className="pf__label" htmlFor="pf-linkedin">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2" style={{ verticalAlign: '-2px', marginRight: '0.35rem' }}><path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" /></svg>
                                    LinkedIn Profile URL
                                </label>
                                <div className="pf__input-icon-wrap">
                                    <svg className="pf__input-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    <input
                                        id="pf-linkedin"
                                        type="url"
                                        className="pf__input pf__input--icon"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        placeholder="https://linkedin.com/in/your-profile"
                                    />
                                </div>
                            </div>

                            <div className="pf__field">
                                <label className="pf__label" htmlFor="pf-portfolio">Portfolio / Website URL</label>
                                <div className="pf__input-icon-wrap">
                                    <svg className="pf__input-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                    <input
                                        id="pf-portfolio"
                                        type="url"
                                        className="pf__input pf__input--icon"
                                        value={portfolioUrl}
                                        onChange={(e) => setPortfolioUrl(e.target.value)}
                                        placeholder="e.g. tejas97automation.netlify.app"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Save ── */}
                        <div className="pf__actions">
                            <button type="button" className="pf__save-btn" onClick={handleSave} disabled={isSaving || !firstName.trim()}>
                                {isSaving ? (
                                    <><span className="pf__spinner pf__spinner--light" />Saving…</>
                                ) : (
                                    <>
                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
