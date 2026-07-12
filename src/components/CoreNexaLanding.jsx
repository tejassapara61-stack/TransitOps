import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Truck, Wrench, Fuel, Route, ClipboardList, TrendingUp,
  ArrowRight, Play, ChevronLeft, ChevronRight, Send, Code,
  Database, MessageSquare, Zap, Shield, BarChart3,
  Users, Clock, CheckCircle2, Mail, Phone, MapPin,
  Globe, Terminal, PackageCheck, UserCheck, AlertTriangle,
  DollarSign, MapPinned, Activity
} from 'lucide-react';
import ThemeSettingsBox from './ThemeSettingsBox';
import { useTheme } from '../context/ThemeContext';
import './CoreNexaLanding.css';

/* ─────────────── Animated Section Wrapper ─────────────── */
function Section({ children, className = '', id = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      className={`cnx-section ${className}`}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}


/* ─────────────── HERO ─────────────── */
function HeroSection() {
  return (
    <section className="cnx-hero">
      {/* Background effects */}
      <div className="cnx-hero__glow cnx-hero__glow--1" />
      <div className="cnx-hero__glow cnx-hero__glow--2" />
      <div className="cnx-hero__grid-overlay" />

      <div className="cnx-hero__content">
        <motion.div
          className="cnx-hero__badge"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="cnx-hero__badge-pulse" />
          <Truck size={14} />
          End-to-End Fleet & Dispatch Intelligence
        </motion.div>

        <motion.h1
          className="cnx-hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          TransitOps: Smart{' '}
          <br />
          <span className="cnx-hero__gradient-text">Transport Operations.</span>
        </motion.h1>

        <motion.p
          className="cnx-hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          Ditch the spreadsheets. Maximize fleet utilization, ensure driver compliance,
          and cut operational costs — all from one intelligent platform.
        </motion.p>

        <motion.div
          className="cnx-hero__ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          <button className="cnx-btn cnx-btn--ghost">
            <Play size={18} />
            Watch Platform Tour
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────── TECH STACK MARQUEE ─────────────── */
const techLogos = [
  { icon: Truck, name: 'Fleet Mgmt' },
  { icon: Route, name: 'Route Planning' },
  { icon: Fuel, name: 'Fuel Tracking' },
  { icon: Wrench, name: 'Maintenance' },
  { icon: Database, name: 'ERP Connect' },
  { icon: Shield, name: 'Compliance' },
  { icon: BarChart3, name: 'Analytics' },
  { icon: MessageSquare, name: 'Alerts' },
  { icon: MapPinned, name: 'GPS Tracking' },
  { icon: DollarSign, name: 'Finance' },
];

function TechStackSection() {
  const doubled = [...techLogos, ...techLogos];
  return (
    <Section className="cnx-tech" id="integrations">
      <p className="cnx-tech__label">One platform that connects every part of your logistics operation.</p>
      <div className="cnx-tech__marquee-wrapper">
        <div className="cnx-tech__marquee-fade cnx-tech__marquee-fade--left" />
        <div className="cnx-tech__marquee-fade cnx-tech__marquee-fade--right" />
        <motion.div
          className="cnx-tech__marquee-track"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {doubled.map((logo, i) => {
            const Icon = logo.icon;
            return (
              <div key={`${logo.name}-${i}`} className="cnx-tech__logo-card group cursor-pointer">
                {/* 
                  Theme UI Magic:
                  Muted text-themeAccent/60 by default.
                  Blooms to full capacity and shadow on hover using var(--accent-glow) 
                */}
                <Icon 
                  size={28} 
                  strokeWidth={1.5} 
                  className="text-themeAccent/60 transition-all duration-300 group-hover:text-themeAccent group-hover:drop-shadow-[0_0_8px_var(--accent-glow)]" 
                />
                <span className="text-themeSecondary transition-colors duration-300 group-hover:text-themeText">
                  {logo.name}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}

/* ─────────────── FEATURES BENTO GRID ─────────────── */
const features = [
  {
    icon: Truck,
    title: 'Centralized Vehicle Registry',
    desc: 'Track every asset — capacity, registration, insurance, and real-time status. Instantly know which vehicles are Available, On Trip, or In Shop.',
    color: '#4F46E5',
  },
  {
    icon: Route,
    title: 'Intelligent Dispatch',
    desc: 'Assign trips with automatic capacity checks and driver license class validation. The system rejects invalid assignments before conflicts occur.',
    color: '#06B6D4',
  },
  {
    icon: Wrench,
    title: 'Automated Maintenance',
    desc: 'Schedule service windows and auto-toggle vehicle availability during maintenance — eliminating scheduling conflicts and keeping your fleet inspection-ready.',
    color: '#A855F7',
  },
  {
    icon: TrendingUp,
    title: 'Financial Analytics',
    desc: 'Log fuel expenses, compute per-trip operational costs, and monitor Vehicle ROI. Make data-driven decisions with real-time financial dashboards.',
    color: '#22C55E',
  },
  {
    icon: Shield,
    title: 'Driver Compliance Hub',
    desc: 'Centralize driver license classes, expiry dates, and safety records. Automated alerts ensure no non-compliant driver ever touches the wheel.',
    color: '#F59E0B',
  },
  {
    icon: Activity,
    title: 'Real-Time Fleet Dashboard',
    desc: 'Live KPIs for utilization, on-time delivery rates, and cost-per-km. Drill into any vehicle or driver with a single click.',
    color: '#EF4444',
  },
];

function FeaturesSection() {
  return (
    <Section className="cnx-features" id="features">
      <div className="cnx-features__header">
        <span className="cnx-pill">Platform Features</span>
        <h2 className="cnx-section-title">
          Every module your fleet needs, <span className="cnx-hero__gradient-text">in one place.</span>
        </h2>
        <p className="cnx-section-subtitle">
          Four core intelligence layers — vehicle, dispatch, maintenance, and finance — working together to
          eliminate spreadsheets and maximize fleet ROI.
        </p>
      </div>
      <div className="cnx-features__grid">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              className="cnx-features__card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="cnx-features__card-glow" style={{ background: feat.color }} />
              <div className="cnx-features__icon" style={{ color: feat.color, background: `${feat.color}15` }}>
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <h3 className="cnx-features__card-title">{feat.title}</h3>
              <p className="cnx-features__card-desc">{feat.desc}</p>
              <div className="cnx-features__card-link" style={{ color: feat.color }}>
                Learn more <ArrowRight size={14} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ─────────────── TESTIMONIALS — Infinite Marquee ─────────────── */
const testimonials = [
  {
    name: 'Vikram Nair',
    role: 'Fleet Manager @ IndiaFreight Logistics',
    avatar: 'VN',
    text: 'TransitOps cut our dispatch planning time by 80%. Real-time vehicle status means zero double-bookings. Our fleet utilization jumped from 67% to 91% in two months.',
    rating: 5,
  },
  {
    name: 'Anjali Kapoor',
    role: 'Safety Officer @ SwiftMove Transport',
    avatar: 'AK',
    text: 'Driver compliance tracking is phenomenal. We get automated alerts before license expiry, so no non-compliant driver has touched a vehicle since we went live.',
    rating: 5,
  },
  {
    name: 'Rohan Desai',
    role: 'CFO @ GreenHaul Pvt. Ltd.',
    avatar: 'RD',
    text: 'The financial analytics module gave us ROI per vehicle for the first time. We identified three underperforming trucks and redeployed them — saving ₹18L annually.',
    rating: 5,
  },
  {
    name: 'Meera Joshi',
    role: 'Operations Head @ CityLink Express',
    avatar: 'MJ',
    text: 'Maintenance scheduling used to be a nightmare. Now the system auto-marks vehicles as unavailable during service. Scheduling conflicts are literally zero.',
    rating: 5,
  },
  {
    name: 'Suresh Pillai',
    role: 'Dispatch Coordinator @ TransCore India',
    avatar: 'SP',
    text: 'Intelligent dispatch with automatic capacity and license validation saved us from multiple compliance violations. It\'s like having a senior dispatcher review every trip.',
    rating: 5,
  },
  {
    name: 'Nisha Tiwari',
    role: 'Financial Analyst @ Apex Cargo',
    avatar: 'NT',
    text: 'Fuel log tracking and per-trip cost computation changed how we budget. I now have live dashboards that board members actually read — and trust.',
    rating: 5,
  },
];

function TestimonialCard({ t }) {
  return (
    <div className="cnx-testi__card">
      <div className="cnx-testi__card-inner">
        <MessageSquare size={28} className="cnx-testi__quote-icon" strokeWidth={1.5} />
        <div className="cnx-testi__stars">
          {Array.from({ length: t.rating }).map((_, j) => (
            <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <p className="cnx-testi__text">&ldquo;{t.text}&rdquo;</p>
        <div className="cnx-testi__author">
          <div className="cnx-testi__avatar">{t.avatar}</div>
          <div>
            <div className="cnx-testi__name">{t.name}</div>
            <div className="cnx-testi__role">{t.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  // Double for infinite loop
  const row1 = [...testimonials, ...testimonials];
  const row2 = [...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials.slice(3), ...testimonials.slice(0, 3)];

  return (
    <Section className="cnx-testi" id="testimonials">
      <div className="cnx-testi__header">
        <span className="cnx-pill">Testimonials</span>
        <h2 className="cnx-section-title">
          Trusted by fleet operators at <span className="cnx-hero__gradient-text">200+ logistics firms.</span>
        </h2>
        <p className="cnx-section-subtitle">
          See why logistics companies choose TransitOps to digitize their transport operations and maximize fleet ROI.
        </p>
      </div>

      {/* Row 1 — moves left */}
      <div className="cnx-testi__marquee-wrapper">
        <div className="cnx-testi__marquee-fade cnx-testi__marquee-fade--left" />
        <div className="cnx-testi__marquee-fade cnx-testi__marquee-fade--right" />
        <motion.div
          className="cnx-testi__marquee-track"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        >
          {row1.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} />
          ))}
        </motion.div>
      </div>

      {/* Row 2 — moves right */}
      <div className="cnx-testi__marquee-wrapper cnx-testi__marquee-wrapper--reverse">
        <div className="cnx-testi__marquee-fade cnx-testi__marquee-fade--left" />
        <div className="cnx-testi__marquee-fade cnx-testi__marquee-fade--right" />
        <motion.div
          className="cnx-testi__marquee-track"
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        >
          {row2.map((t, i) => (
            <TestimonialCard key={`r2-${i}`} t={t} />
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ─────────────── USER PERSONAS ─────────────── */
const personas = [
  {
    icon: Truck,
    role: 'Fleet Manager',
    color: '#4F46E5',
    desc: 'Oversee the full vehicle registry, monitor live asset status, and drive utilization metrics across your entire fleet from one command center.',
  },
  {
    icon: UserCheck,
    role: 'Driver',
    color: '#06B6D4',
    desc: 'Access assigned trips, view route details, and log journey updates in real time — ensuring smooth communication between the road and dispatch.',
  },
  {
    icon: AlertTriangle,
    role: 'Safety Officer',
    color: '#F59E0B',
    desc: 'Enforce driver compliance by tracking license classes, expiry dates, and safety certifications with automated alerts before violations occur.',
  },
  {
    icon: DollarSign,
    role: 'Financial Analyst',
    color: '#22C55E',
    desc: 'Analyze fuel logs, compute per-trip operational costs, and monitor Vehicle ROI through rich financial dashboards built for logistics budgeting.',
  },
];

function PersonasSection() {
  return (
    <Section className="cnx-features" id="roles">
      <div className="cnx-features__header">
        <span className="cnx-pill">Who It's For</span>
        <h2 className="cnx-section-title">
          Built for every role in your <span className="cnx-hero__gradient-text">logistics team.</span>
        </h2>
        <p className="cnx-section-subtitle">
          TransitOps delivers role-specific dashboards so every stakeholder — from the depot to the boardroom — has exactly what they need.
        </p>
      </div>
      <div className="cnx-features__grid">
        {personas.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.role}
              className="cnx-features__card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="cnx-features__card-glow" style={{ background: p.color }} />
              <div className="cnx-features__icon" style={{ color: p.color, background: `${p.color}15` }}>
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <h3 className="cnx-features__card-title">{p.role}</h3>
              <p className="cnx-features__card-desc">{p.desc}</p>
              <div className="cnx-features__card-link" style={{ color: p.color }}>
                Learn more <ArrowRight size={14} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ─────────────── DEMO SCHEDULER — Calendly-style ─────────────── */
const timeSlots = ['9:00 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

function DemoSchedulerSection({ onOpenDemo }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  const todayDate = today.getDate();

  // Initialize selectedDay to today on mount
  useEffect(() => {
    setSelectedDay(todayDate);
  }, [todayDate]);

  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDow = new Date(year, today.getMonth(), 1).getDay();
  const calDays = [];
  for (let i = 0; i < firstDow; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const isConfirmActive = selectedDay && selectedTime;

  return (
    <Section className="cnx-demo" id="demo">
      <div className="cnx-demo__header">
        <h2 className="cnx-section-title">
          See TransitOps in <span className="cnx-hero__gradient-text">action.</span>
        </h2>
        <p className="cnx-section-subtitle">
          Schedule a 30-minute personalized walkthrough with our fleet solutions team.
        </p>
      </div>

      <motion.div
        className="cnx-demo__glass-container"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Decorative glow orbs */}
        <div className="cnx-demo__orb cnx-demo__orb--1" />
        <div className="cnx-demo__orb cnx-demo__orb--2" />

        <div className="cnx-demo__container">
          {/* Calendar */}
          <div className="cnx-demo__calendar">
            <div className="cnx-demo__cal-label">Select a Date</div>
            <div className="cnx-demo__cal-header">
              <button className="cnx-demo__cal-nav-btn" aria-label="Previous month">
                <ChevronLeft size={18} />
              </button>
              <span className="cnx-demo__cal-month">{monthName} {year}</span>
              <button className="cnx-demo__cal-nav-btn" aria-label="Next month">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="cnx-demo__cal-weekdays">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="cnx-demo__cal-grid">
              {calDays.map((day, i) => {
                const isToday = day === todayDate;
                const isSelected = day === selectedDay;
                const isPast = day && day < todayDate;
                return (
                  <button
                    key={i}
                    className={`cnx-demo__cal-day${isSelected ? ' selected' : ''}${!day ? ' empty' : ''}${isPast ? ' past' : ''}${isToday && !isSelected ? ' today' : ''}`}
                    onClick={() => day && !isPast && setSelectedDay(day)}
                    disabled={!day || isPast}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="cnx-demo__divider" />

          {/* Time Slots */}
          <div className="cnx-demo__times">
            <div className="cnx-demo__times-header">
              <Clock size={18} className="cnx-demo__times-icon" />
              <div>
                <div className="cnx-demo__times-title">Available Times</div>
                <div className="cnx-demo__times-date">
                  {selectedDay ? `${monthName} ${selectedDay}, ${year}` : 'Select a date first'}
                </div>
              </div>
            </div>
            <div className="cnx-demo__time-grid">
              {timeSlots.map((slot) => (
                <motion.button
                  key={slot}
                  className={`cnx-demo__time-slot${slot === selectedTime ? ' selected' : ''}`}
                  onClick={() => setSelectedTime(slot)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Clock size={14} />
                  {slot}
                </motion.button>
              ))}
            </div>
            <div className="cnx-demo__selected-info">
              <CheckCircle2 size={16} />
              <span>30 min · Google Meet · Fleet operations consultation</span>
            </div>
            <motion.button
              className={`cnx-btn cnx-btn--primary cnx-btn--glow cnx-btn--full cnx-demo__confirm-btn${!isConfirmActive ? ' disabled' : ''}`}
              whileHover={isConfirmActive ? { scale: 1.02 } : {}}
              whileTap={isConfirmActive ? { scale: 0.98 } : {}}
              disabled={!isConfirmActive}
              onClick={onOpenDemo}
            >
              Confirm Booking
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ─────────────── CONTACT & FOOTER ─────────────── */
function ContactFooterSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <>
      <Section className="cnx-contact" id="contact">
        <div className="cnx-contact__inner">
          {/* Left — Info */}
          <div className="cnx-contact__info">
            <span className="cnx-pill">Get in Touch</span>
            <h2 className="cnx-section-title cnx-contact__title">
              Ready to digitize{' '}
              <span className="cnx-hero__gradient-text">your fleet?</span>
            </h2>
            <p className="cnx-contact__subtitle">
              Our logistics solutions team responds within 2 hours. Let's map TransitOps to your exact operational needs.
            </p>
            <div className="cnx-contact__details">
              <a href="mailto:hello@transitops.io" className="cnx-contact__detail">
                <div className="cnx-contact__detail-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="cnx-contact__detail-label">Email us</div>
                  <div className="cnx-contact__detail-value">hello@transitops.io</div>
                </div>
              </a>
              <div className="cnx-contact__detail">
                <div className="cnx-contact__detail-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="cnx-contact__detail-label">Call us</div>
                  <div className="cnx-contact__detail-value">+91 98765 43210</div>
                </div>
              </div>
              <div className="cnx-contact__detail">
                <div className="cnx-contact__detail-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="cnx-contact__detail-label">Visit us</div>
                  <div className="cnx-contact__detail-value">Mumbai, India · Bengaluru, India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <form className="cnx-contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="cnx-contact__form-header">
              <Send size={20} />
              <span>Tell us about your fleet</span>
            </div>
            <div className="cnx-contact__field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange('name')}
              />
            </div>
            <div className="cnx-contact__field">
              <label htmlFor="contact-email">Work Email</label>
              <input
                id="contact-email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange('email')}
              />
            </div>
            <div className="cnx-contact__field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Tell us about your fleet size, current challenges, or what you'd like to automate..."
                value={formData.message}
                onChange={handleChange('message')}
              />
            </div>
            <button type="submit" className="cnx-btn cnx-btn--primary cnx-btn--glow cnx-btn--full">
              <Send size={18} />
              Send Message
            </button>
          </form>
        </div>
      </Section>

      {/* Footer */}
      <footer className="cnx-footer">
        <div className="cnx-footer__inner">
          <div className="cnx-footer__brand">
            <div className="cnx-footer__logo">
              <Truck size={22} />
              <span>TransitOps</span>
            </div>
            <p className="cnx-footer__tagline">Smart Transport Operations Platform for modern logistics companies.</p>
          </div>
          <div className="cnx-footer__links">
            <div className="cnx-footer__col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#roles">User Roles</a>
              <a href="#integrations">Integrations</a>
              <a href="#demo">Pricing</a>
            </div>
            <div className="cnx-footer__col">
              <h4>Company</h4>
              <a href="#contact">About</a>
              <a href="#contact">Careers</a>
              <a href="#contact">Blog</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="cnx-footer__col">
              <h4>Legal</h4>
              <a href="#contact">Privacy</a>
              <a href="#contact">Terms</a>
              <a href="#contact">Security</a>
              <a href="#contact">Compliance</a>
            </div>
          </div>
        </div>
        <div className="cnx-footer__bottom">
          <span>&copy; 2026 TransitOps. All rights reserved.</span>
          <div className="cnx-footer__socials">
            <a href="#" aria-label="Globe" className="cnx-footer__social-link">
              <Globe size={18} />
            </a>
            <a href="#" aria-label="Terminal" className="cnx-footer__social-link">
              <Terminal size={18} />
            </a>
            <a href="#" aria-label="GitHub" className="cnx-footer__social-link">
              <Code size={18} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─────────────── NAVBAR ─────────────── */
function Navbar({ isDark, onOpenDemo }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`cnx-nav ${scrolled ? 'cnx-nav--scrolled' : ''}`}>
      <div className="cnx-nav__inner">
        <div className="cnx-nav__brand">
          <Truck size={22} />
          <span>TransitOps</span>
        </div>
        <div className="cnx-nav__links">
          <a href="#features">Features</a>
          <a href="#roles">Roles</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#demo">Demo</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="cnx-nav__actions">
          <a href="/login" className="cnx-nav__login">Sign In</a>
          <button className="cnx-btn cnx-btn--primary cnx-btn--sm" onClick={onOpenDemo}>
            Request Demo <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────── MAIN EXPORT ─────────────── */
export default function CoreNexaLanding() {
  const navigate = useNavigate();
  const handleCTA = () => navigate('/login');

  return (
    <div className="cnx-landing">
      <Navbar onOpenDemo={handleCTA} />
      <HeroSection />
      <TechStackSection />
      <FeaturesSection />
      <PersonasSection />
      <TestimonialsSection />
      <DemoSchedulerSection onOpenDemo={handleCTA} />
      <ContactFooterSection />

      <ThemeSettingsBox />
    </div>
  );
}
