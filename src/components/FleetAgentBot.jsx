import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Truck, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './FleetAgentBot.css';

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

const GREETING = {
  id: 0,
  role: 'agent',
  text: "👋 Hi! I'm your **TransitOps AI Dispatcher**. Ask me anything about your live fleet — vehicle status, trip assignments, driver compliance, fuel costs, or maintenance schedules.",
  ts: new Date(),
};

const SUGGESTED_PROMPTS = [
  'How many vehicles are on trip right now?',
  'Which drivers have expiring licenses?',
  'Show fuel cost for this week',
  'Any vehicles due for maintenance?',
];

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function formatTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date instanceof Date ? date : new Date(date));
}

/** Render **bold** markdown fragments inline */
function renderText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

/* ─────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────── */

/** Animated dots typing indicator */
function TypingIndicator() {
  return (
    <div className="fab-msg-row fab-msg-row--agent">
      <div className="fab-avatar fab-avatar--agent">
        <Bot size={14} strokeWidth={2} />
      </div>
      <div className="fab-bubble fab-bubble--agent fab-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

/** Single message bubble */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      className={`fab-msg-row ${isUser ? 'fab-msg-row--user' : 'fab-msg-row--agent'}`}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {!isUser && (
        <div className="fab-avatar fab-avatar--agent">
          <Bot size={14} strokeWidth={2} />
        </div>
      )}

      <div className={`fab-bubble ${isUser ? 'fab-bubble--user' : 'fab-bubble--agent'}`}>
        <p className="fab-bubble__text">{renderText(msg.text)}</p>
        <span className="fab-bubble__time">{formatTime(msg.ts)}</span>
      </div>

      {isUser && (
        <div className="fab-avatar fab-avatar--user">
          <Truck size={13} strokeWidth={2} />
        </div>
      )}
    </motion.div>
  );
}

/** Suggested prompt chips — shown only on the greeting state */
function SuggestedPrompts({ onSelect }) {
  return (
    <motion.div
      className="fab-suggestions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {SUGGESTED_PROMPTS.map((p) => (
        <button
          key={p}
          className="fab-suggestion-chip"
          onClick={() => onSelect(p)}
          type="button"
        >
          {p}
        </button>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export default function FleetAgentBot() {
  const { isDark } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookOk, setWebhookOk] = useState(!!WEBHOOK_URL);
  const [unreadCount, setUnreadCount] = useState(0);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);

  /* ── Auto-scroll on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* ── Focus input when opening ── */
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [isOpen]);

  /* ── Append a message to state ── */
  const pushMessage = useCallback((role, text) => {
    const msg = { id: Date.now() + Math.random(), role, text, ts: new Date() };
    setMessages((prev) => [...prev, msg]);
    if (!isOpen && role === 'agent') {
      setUnreadCount((n) => n + 1);
    }
    return msg;
  }, [isOpen]);

  /* ── Core send logic ── */
  const handleSend = useCallback(async (queryOverride) => {
    const query = (queryOverride ?? inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    pushMessage('user', query);
    setIsLoading(true);

    try {
      if (!WEBHOOK_URL) throw new Error('VITE_N8N_WEBHOOK_URL is not configured.');

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`Webhook responded with status ${res.status}.`);

      const data = await res.json();

      /* Flexible response extraction:
         Supports { output }, { text }, { answer }, { message }, or raw string */
      const reply =
        typeof data === 'string'
          ? data
          : data.output ?? data.text ?? data.answer ?? data.message
          ?? (Array.isArray(data) && data[0]?.output)
          ?? JSON.stringify(data);

      pushMessage('agent', reply);
      setWebhookOk(true);
    } catch (err) {
      console.error('[FleetAgentBot]', err);
      pushMessage(
        'agent',
        `⚠️ I couldn't reach the TransitOps backend right now. ${
          WEBHOOK_URL
            ? 'The webhook returned an error — please try again in a moment.'
            : 'Set **VITE_N8N_WEBHOOK_URL** in your .env.local to connect me to n8n.'
        }`,
      );
      setWebhookOk(false);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, pushMessage]);

  /* ── Enter-key handler ── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const canSend = inputText.trim().length > 0 && !isLoading;
  const isGreeting = messages.length === 1 && messages[0].id === 0;

  /* ─────────────────────── Render ─────────────────────── */
  return (
    <div className={`fab-root ${isDark ? 'fab-dark' : 'fab-light'}`}>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fab-window"
            role="dialog"
            aria-label="TransitOps AI Dispatcher"
            initial={{ opacity: 0, y: 24, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.93 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="fab-header">
              <div className="fab-header__left">
                <div className="fab-header__avatar">
                  <Bot size={18} strokeWidth={2} />
                  <span className="fab-header__status-dot" />
                </div>
                <div className="fab-header__info">
                  <h3 className="fab-header__title">TransitOps AI Dispatcher</h3>
                  <div className="fab-header__subtitle">
                    {webhookOk ? (
                      <>
                        <Wifi size={10} className="fab-header__icon-ok" />
                        <span>Connected · Powered by n8n</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={10} className="fab-header__icon-err" />
                        <span>Webhook not configured</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="fab-header__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                type="button"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* Chat body */}
            <div className="fab-body" ref={chatBodyRef}>
              <div className="fab-messages">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}

                {/* Suggested prompts shown only when just the greeting is present */}
                {isGreeting && (
                  <SuggestedPrompts onSelect={(p) => handleSend(p)} />
                )}

                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input bar */}
            <div className="fab-footer">
              <div className="fab-input-wrapper">
                <textarea
                  ref={inputRef}
                  id="fleet-agent-input"
                  className="fab-input"
                  placeholder="Ask about your fleet…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isLoading}
                  aria-label="Message input"
                />
                <motion.button
                  className={`fab-send ${canSend ? 'fab-send--active' : ''}`}
                  onClick={() => handleSend()}
                  disabled={!canSend}
                  aria-label="Send message"
                  type="button"
                  whileTap={canSend ? { scale: 0.9 } : {}}
                >
                  <Send size={16} strokeWidth={2.2} />
                </motion.button>
              </div>
              <p className="fab-footer__hint">
                Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Toggle Button ── */}
      <motion.button
        className={`fab-btn ${isOpen ? 'fab-btn--open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        aria-expanded={isOpen}
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        animate={!isOpen ? { boxShadow: ['0 0 0 0 rgba(79,70,229,0.5)', '0 0 0 14px rgba(79,70,229,0)', '0 0 0 0 rgba(79,70,229,0)'] } : {}}
        transition={!isOpen ? { duration: 2.4, repeat: Infinity, repeatDelay: 1 } : {}}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X size={24} strokeWidth={2.2} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MessageSquare size={24} strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.span
              className="fab-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
