import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CoreNexaLanding from './components/CoreNexaLanding';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './components/ProfilePage';
import UnauthorizedPage from './components/UnauthorizedPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

export default function App() {
  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const observe = () => {
      document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    };

    observe();
    const mutObserver = new MutationObserver(observe);
    mutObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObserver.disconnect();
    };
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<CoreNexaLanding />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* ── Protected routes ── */}
            <Route path="/dashboard" element={<Navigate to="/dashboard/profile" replace />} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
