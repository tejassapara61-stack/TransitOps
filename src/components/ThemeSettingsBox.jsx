import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, X, Check, Users, TrendingUp, Megaphone, Handshake, Package } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeSettingsBox.css';

/* ═══════════════════════════════════════════════════════
   ThemeSettingsBox — Floating Dual-Axis Theme Controller
   ═══════════════════════════════════════════════════════
   Top:    Sun/Moon toggle (Light ↔ Dark)
   Bottom: 5 Industry palette selectors
   ═══════════════════════════════════════════════════════ */

const INDUSTRY_CONFIG = [
  { key: 'hr',        icon: Users,      label: 'HR',         color: '#10B981', darkColor: '#34D399' },
  { key: 'finance',   icon: TrendingUp, label: 'Finance',    color: '#16A34A', darkColor: '#22C55E' },
  { key: 'marketing', icon: Megaphone,  label: 'Marketing',  color: '#EA580C', darkColor: '#F97316' },
  { key: 'crm',       icon: Handshake,  label: 'CRM',        color: '#EAB308', darkColor: '#FACC15' },
  { key: 'supply',    icon: Package,    label: 'Supply',     color: '#4682B4', darkColor: '#5B9BD5' },
];

export default function ThemeSettingsBox() {
  const { isDark, toggleMode, industry, setIndustry } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ─── Floating Trigger ─── */}
      <motion.button
        className="theme-trigger"
        onClick={() => setIsOpen((p) => !p)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
        aria-label="Theme settings"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={20} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div key="palette" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Palette size={20} strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ─── Settings Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="theme-panel"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="theme-panel__header">
              <Palette size={16} />
              <span>Theme Engine</span>
            </div>

            {/* ─── Mode Toggle ─── */}
            <div className="theme-panel__section">
              <span className="theme-panel__label">Appearance</span>
              <button className="theme-panel__mode-toggle" onClick={toggleMode} aria-label={isDark ? 'Switch to light' : 'Switch to dark'}>
                <motion.div
                  className="theme-panel__mode-track"
                  animate={{ backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(251,191,36,0.2)' }}
                >
                  <motion.div
                    className="theme-panel__mode-thumb"
                    animate={{ x: isDark ? 0 : 28 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <AnimatePresence mode="wait">
                      {isDark ? (
                        <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <Moon size={14} />
                        </motion.div>
                      ) : (
                        <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                          <Sun size={14} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
                <span className="theme-panel__mode-label">{isDark ? 'Dark' : 'Light'}</span>
              </button>
            </div>

            {/* ─── Industry Palette Selector ─── */}
            <div className="theme-panel__section">
              <span className="theme-panel__label">Industry Palette</span>
              <div className="theme-panel__industries">
                {INDUSTRY_CONFIG.map(({ key, icon: Icon, label, color, darkColor }) => {
                  const isActive = industry === key;
                  const dotColor = isDark ? darkColor : color;
                  return (
                    <motion.button
                      key={key}
                      className={`theme-panel__industry-btn${isActive ? ' active' : ''}`}
                      onClick={() => setIndustry(key)}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      title={label}
                      aria-label={`Set theme to ${label}`}
                    >
                      <div className="theme-panel__industry-dot" style={{ background: dotColor, boxShadow: isActive ? `0 0 16px ${dotColor}` : 'none' }}>
                        <AnimatePresence>
                          {isActive ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400 }}>
                              <Check size={14} strokeWidth={3} color="#fff" />
                            </motion.div>
                          ) : (
                            <Icon size={14} strokeWidth={2} color="rgba(255,255,255,0.8)" />
                          )}
                        </AnimatePresence>
                      </div>
                      <span className="theme-panel__industry-name">{label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Live Preview Bar */}
            <div className="theme-panel__preview">
              <div className="theme-panel__preview-bg" />
              <div className="theme-panel__preview-surface" />
              <div className="theme-panel__preview-accent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
