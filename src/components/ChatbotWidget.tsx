'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, MessageCircle, Loader2, Phone, Mail, Download, User, CheckCircle2, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id        : string;
  role      : 'user' | 'assistant';
  content   : string;
  timestamp : Date;
}

interface ChatbotWidgetProps {
  apiEndpoint    ?: string;
  leadsEndpoint  ?: string;
  brandColor     ?: string;
  brandName      ?: string;
  companyName    ?: string;
  phoneNumber    ?: string;
  email          ?: string;
  whatsappNumber ?: string;
  brochureUrl    ?: string;
  brochureLabel  ?: string;
}

// ─── Quick reply suggestions ──────────────────────────────────────────────────

const QUICK_REPLIES = [
  { label: '📋 Our Services',   msg: 'What services do you offer?' },
  { label: '🏗️ Portfolio',      msg: 'Show me your portfolio' },
  { label: '📍 Location',       msg: 'Where are you located?' },
  { label: '📞 Contact',        msg: 'How can I contact you?' },
  { label: '💼 Careers',        msg: 'Are you hiring?' },
  { label: '🏢 About Us',       msg: 'Tell me about Kavalakat' },
  { label: '📝 Get a Quote',    msg: 'I would like to get a quote' },
];

// ─── Session key ──────────────────────────────────────────────────────────────

function getSessionKey(): string {
  if (typeof window === 'undefined') return 'ssr';
  const KEY = 'kav_chat_session';
  let k = sessionStorage.getItem(KEY);
  if (!k) {
    k = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, k);
  }
  return k;
}

// ─── Bold / bullet renderer ───────────────────────────────────────────────────

function RenderMessage({ content, color }: { content: string; color: string }) {
  const lines = content.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} style={{ fontWeight: 700 }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        });
        return (
          <p key={i} style={{ margin: i === 0 ? 0 : '3px 0 0', lineHeight: 1.5 }}>
            {rendered}
          </p>
        );
      })}
    </div>
  );
}

// ─── Lead capture form (inline bubble) ─────────────────────────────────────────

interface LeadFormProps {
  color        : string;
  defaultQuery : string;
  submitting   : boolean;
  error        : string;
  onSubmit     : (name: string, phone: string, email: string, query: string) => void;
  onDismiss    : () => void;
}

function LeadCaptureForm({ color, defaultQuery, submitting, error, onSubmit, onDismiss }: LeadFormProps) {
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState(defaultQuery);

  const inputStyle: React.CSSProperties = {
    width       : '100%',
    padding     : '9px 12px',
    border      : '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize    : '0.83rem',
    outline     : 'none',
    fontFamily  : 'inherit',
    color       : '#1e293b',
    marginBottom: '8px',
    boxSizing   : 'border-box',
  };

  const canSubmit = name.trim().length > 0 && (phone.trim().length > 0 || email.trim().length > 0);

  return (
    <div style={{
      background   : 'white',
      border       : '1.5px solid #e2e8f0',
      borderRadius : '14px',
      padding      : '14px',
      boxShadow    : '0 2px 10px rgba(0,0,0,0.06)',
      animation    : 'kavFadeIn 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          backgroundColor: `${color}1a`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={15} />
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
          Leave your details — we'll get back to you!
        </div>
      </div>

      <input
        type="text" placeholder="Your name *" value={name}
        onChange={e => setName(e.target.value)} style={inputStyle}
        onFocus={e => (e.currentTarget.style.borderColor = color)}
        onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
      />
      <input
        type="tel" placeholder="Phone number" value={phone}
        onChange={e => setPhone(e.target.value)} style={inputStyle}
        onFocus={e => (e.currentTarget.style.borderColor = color)}
        onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
      />
      <input
        type="email" placeholder="Email address" value={email}
        onChange={e => setEmail(e.target.value)} style={inputStyle}
        onFocus={e => (e.currentTarget.style.borderColor = color)}
        onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
      />
      <textarea
        placeholder="What are you looking for?" value={query}
        onChange={e => setQuery(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: 'none', marginBottom: '4px' }}
        onFocus={e => (e.currentTarget.style.borderColor = color)}
        onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
      />

      <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 10px' }}>
        Please share a phone number or an email so we can reach you.
      </p>

      {error && (
        <p style={{ fontSize: '0.72rem', color: '#ef4444', margin: '0 0 8px' }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={() => onSubmit(name.trim(), phone.trim(), email.trim(), query.trim())}
          style={{
            flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
            backgroundColor: !canSubmit || submitting ? '#cbd5e1' : color,
            color: 'white', fontSize: '0.82rem', fontWeight: 700,
            cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          {submitting ? <Loader2 size={14} style={{ animation: 'kavSpin 0.8s linear infinite' }} /> : 'Submit'}
        </button>
        <button
          type="button" onClick={onDismiss}
          style={{
            padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
            backgroundColor: 'white', color: '#64748b', fontSize: '0.82rem',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatbotWidget({
  apiEndpoint    = 'https://api.kavalakat.com/api/chat/',
  leadsEndpoint,
  brandColor     = '#0077be',
  brandName      = 'AI Assistant',
  companyName    = 'Kavalakat',
  phoneNumber    = '0487 244 0380',
  email          = 'contact@kavalakat.com',
  whatsappNumber = '916238000000',
  brochureUrl    = '/kavalakat-brochure.pdf',
  brochureLabel  = 'Download Brochure',
}: ChatbotWidgetProps) {

  const [isOpen,        setIsOpen]        = useState(false);
  const [inputValue,    setInputValue]    = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [showQuickReply,setShowQuickReply]= useState(true);
  const [sessionKey]                      = useState<string>(getSessionKey);
  const [messages,      setMessages]      = useState<Message[]>([
    {
      id       : 'welcome',
      role     : 'assistant',
      content  : `Hi! 👋 I'm ${brandName} from ${companyName}.\n\nHow can I help you today? Use the quick buttons below or type your question!`,
      timestamp: new Date(),
    },
  ]);

  // ── Lead capture state ──────────────────────────────────────────────────────
  const [showLeadForm,   setShowLeadForm]   = useState(false);
  const [leadSubmitted,  setLeadSubmitted]  = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError,      setLeadError]      = useState('');
  const [lastUserQuery,  setLastUserQuery]  = useState('');
  const leadPromptedRef = useRef(false); // only auto-prompt once per session

  const resolvedLeadsEndpoint = leadsEndpoint ?? `${apiEndpoint.replace(/\/?$/, '/')}leads/`;

  // ── Brochure download state ──────────────────────────────────────────────
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showLeadForm]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Contact handlers ──────────────────────────────────────────────────────

  const handleCall = useCallback(() => {
    window.location.href = `tel:${phoneNumber.replace(/\s/g, '')}`;
  }, [phoneNumber]);

  const handleEmail = useCallback(() => {
    window.location.href = `mailto:${email}`;
  }, [email]);

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  }, [whatsappNumber]);

  // ── Brochure download (blob-based, with fallback) ───────────────────────
  //
  // Why not just `a.href = brochureUrl; a.click()`?
  // The `download` attribute only forces a save when the file is same-origin
  // AND the server doesn't send `Content-Disposition: inline`. On many live
  // setups (CDN, S3, subdomain, misconfigured static host) the browser just
  // opens/previews the PDF instead of downloading it. Fetching the file as a
  // blob and creating an object URL sidesteps all of that — as long as the
  // file is reachable and (if cross-origin) CORS-enabled.

  const handleBrochure = useCallback(async () => {
    if (isDownloading) return;
    setDownloadError(false);
    setIsDownloading(true);

    try {
      const res = await fetch(brochureUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'Kavalakat-Brochure.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Free memory once the browser has had a chance to start the download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Brochure download failed:', err);
      setDownloadError(true);

      // Fallback: open in a new tab so the user can at least view/save it
      // manually (e.g. Ctrl/Cmd+S), even if CORS or headers blocked the blob fetch.
      window.open(brochureUrl, '_blank', 'noopener,noreferrer');

      // Clear the error indicator after a few seconds
      setTimeout(() => setDownloadError(false), 4000);
    } finally {
      setIsDownloading(false);
    }
  }, [brochureUrl, isDownloading]);

  // ── Lead submit ───────────────────────────────────────────────────────────

  const submitLead = useCallback(async (name: string, phone: string, formEmail: string, query: string) => {
    setLeadSubmitting(true);
    setLeadError('');
    try {
      const res = await fetch(resolvedLeadsEndpoint, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          session_key: sessionKey,
          name,
          phone,
          email: formEmail,
          query: query || lastUserQuery || 'General enquiry from chatbot',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const firstError =
          (data && (data.non_field_errors?.[0] || data.name?.[0] || data.email?.[0] || data.phone?.[0])) ||
          'Please check your details and try again.';
        setLeadError(firstError);
        return;
      }

      setLeadSubmitted(true);
      setShowLeadForm(false);
      setMessages(prev => [
        ...prev,
        {
          id       : (Date.now() + 2).toString(),
          role     : 'assistant',
          content  : data.message || "Thanks! We've received your details and our team will reach out shortly. 🙌",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('Lead submit error:', err);
      setLeadError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLeadSubmitting(false);
    }
  }, [resolvedLeadsEndpoint, sessionKey, lastUserQuery]);

  // ── Core send ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isLoading) return;

    // Hide quick replies after first message
    setShowQuickReply(false);
    setLastUserQuery(text);

    const userMsg: Message = {
      id       : Date.now().toString(),
      role     : 'user',
      content  : text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch(apiEndpoint, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          session_key: sessionKey,
          message    : text,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id       : (Date.now() + 1).toString(),
          role     : 'assistant',
          content  : data.message || "Sorry, I couldn't process that.",
          timestamp: new Date(),
        },
      ]);

      // Show the lead-capture form once, when the backend signals buying intent
      if (data.capture_lead && !leadSubmitted && !leadPromptedRef.current) {
        leadPromptedRef.current = true;
        setShowLeadForm(true);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id       : (Date.now() + 1).toString(),
          role     : 'assistant',
          content  : `Sorry, something went wrong. 😔\nPlease call us at ${phoneNumber} or try again!`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, apiEndpoint, sessionKey, phoneNumber, leadSubmitted]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  // ── Side button styles ────────────────────────────────────────────────────

  const sideBtn: React.CSSProperties = {
    width         : '48px',
    height        : '48px',
    borderRadius  : '24px',
    color         : 'white',
    border        : 'none',
    cursor        : 'pointer',
    display       : 'flex',
    alignItems    : 'center',
    justifyContent: 'flex-start',
    paddingLeft   : '12px',
    paddingRight  : '12px',
    gap           : '10px',
    boxShadow     : '0 4px 12px rgba(0,0,0,0.18)',
    transition    : 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
    overflow      : 'hidden',
    whiteSpace    : 'nowrap',
    fontSize      : '13px',
    fontWeight    : '600',
  };

  const labelStyle: React.CSSProperties = {
    opacity   : 0,
    maxWidth  : '0',
    overflow  : 'hidden',
    transition: 'opacity 0.28s ease, max-width 0.28s ease',
  };

  const expandBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.width        = 'auto';
    el.style.paddingRight = '16px';
    el.style.transform    = 'translateX(-4px)';
    const span = el.querySelector<HTMLSpanElement>('.btn-label');
    if (span) { span.style.opacity = '1'; span.style.maxWidth = '200px'; }
  };

  const collapseBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.width        = '48px';
    el.style.paddingRight = '12px';
    el.style.transform    = 'translateX(0)';
    const span = el.querySelector<HTMLSpanElement>('.btn-label');
    if (span) { span.style.opacity = '0'; span.style.maxWidth = '0'; }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── Side buttons ──────────────────────────────────────────────────── */}
      <div style={{
        position      : 'fixed',
        right         : '1rem',
        top           : '50%',
        transform     : 'translateY(-50%)',
        zIndex        : 9999,
        display       : 'flex',
        flexDirection : 'column',
        gap           : '10px',
        alignItems    : 'flex-end',
      }}>

        {/* Brochure */}
        <button onClick={handleBrochure}
          disabled={isDownloading}
          style={{
            ...sideBtn,
            backgroundColor: downloadError ? '#dc2626' : '#e67e22',
            cursor: isDownloading ? 'wait' : 'pointer',
          }}
          onMouseEnter={expandBtn} onMouseLeave={collapseBtn}
          aria-label={downloadError ? 'Download failed — opening in new tab instead' : brochureLabel}
          title={downloadError ? 'Download failed — opened in a new tab instead' : brochureLabel}>
          {isDownloading ? (
            <Loader2 size={20} style={{ flexShrink: 0, animation: 'kavSpin 0.8s linear infinite' }} />
          ) : downloadError ? (
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
          ) : (
            <Download size={20} style={{ flexShrink: 0 }} />
          )}
          <span className="btn-label" style={labelStyle}>
            {isDownloading ? 'Downloading…' : downloadError ? 'Opened in new tab' : brochureLabel}
          </span>
        </button>

        {/* WhatsApp */}
        <button onClick={handleWhatsApp}
          style={{ ...sideBtn, backgroundColor: '#25D366' }}
          onMouseEnter={expandBtn} onMouseLeave={collapseBtn}
          aria-label="WhatsApp" title="WhatsApp">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="btn-label" style={labelStyle}>WhatsApp</span>
        </button>

        {/* Phone */}
        <button onClick={handleCall}
          style={{ ...sideBtn, backgroundColor: brandColor }}
          onMouseEnter={expandBtn} onMouseLeave={collapseBtn}
          aria-label={`Call ${phoneNumber}`} title={phoneNumber}>
          <Phone size={20} style={{ flexShrink: 0 }} />
          <span className="btn-label" style={labelStyle}>{phoneNumber}</span>
        </button>

        {/* Email */}
        <button onClick={handleEmail}
          style={{ ...sideBtn, backgroundColor: brandColor }}
          onMouseEnter={expandBtn} onMouseLeave={collapseBtn}
          aria-label={`Email ${email}`} title={email}>
          <Mail size={20} style={{ flexShrink: 0 }} />
          <span className="btn-label" style={labelStyle}>{email}</span>
        </button>

        {/* Chat toggle */}
        <button
          onClick={() => setIsOpen(v => !v)}
          style={{
            ...sideBtn,
            backgroundColor: brandColor,
            boxShadow: isOpen ? `0 4px 20px ${brandColor}66` : '0 4px 12px rgba(0,0,0,0.18)',
          }}
          onMouseEnter={expandBtn} onMouseLeave={collapseBtn}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}>
          {isOpen ? (
            <><X size={20} style={{ flexShrink: 0 }} />
            <span className="btn-label" style={labelStyle}>Close Chat</span></>
          ) : (
            <><MessageCircle size={20} style={{ flexShrink: 0 }} />
            <span className="btn-label" style={labelStyle}>Chat with us</span></>
          )}
        </button>
      </div>

      {/* ── Chat window ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat Assistant"
          aria-modal="true"
          style={{
            position        : 'fixed',
            top             : '50%',
            right           : '80px',
            transform       : 'translateY(-50%)',
            zIndex          : 9998,
            width           : '390px',
            maxWidth        : 'calc(100vw - 100px)',
            height          : '620px',
            maxHeight       : 'calc(100vh - 40px)',
            backgroundColor : 'white',
            borderRadius    : '18px',
            boxShadow       : '0 25px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.08)',
            display         : 'flex',
            flexDirection   : 'column',
            overflow        : 'hidden',
            border          : '1px solid #e5e7eb',
            animation       : 'kavSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >

          {/* Header */}
          <div style={{
            padding    : '14px 16px',
            background : `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
            color      : 'white',
            display    : 'flex',
            alignItems : 'center',
            justifyContent: 'space-between',
            flexShrink : 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MessageCircle size={21} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0, lineHeight: 1.2 }}>
                  {brandName}
                </h3>
                <p style={{
                  fontSize: '0.78rem', opacity: 0.9, margin: '3px 0 0',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <span style={{
                    display: 'inline-block', width: '7px', height: '7px',
                    borderRadius: '50%', background: '#4ade80',
                    animation: 'kavPulse 2s infinite',
                  }} />
                  Online now
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!leadSubmitted && (
                <button
                  onClick={() => { setLeadError(''); setShowLeadForm(true); }}
                  title="Request a callback"
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                    cursor: 'pointer', height: '32px', borderRadius: '8px', padding: '0 10px',
                    display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 600,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
                  <User size={14} /> Callback
                </button>
              )}
              <button onClick={() => setIsOpen(false)} aria-label="Close chat"
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                  cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div role="log" aria-live="polite" style={{
            flex: 1, overflowY: 'auto', padding: '14px',
            backgroundColor: '#f8fafc',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'kavFadeIn 0.22s ease',
              }}>
                <div style={{
                  maxWidth       : '80%',
                  borderRadius   : msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  padding        : '10px 14px',
                  backgroundColor: msg.role === 'user' ? brandColor : 'white',
                  color          : msg.role === 'user' ? 'white' : '#1e293b',
                  border         : msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                  boxShadow      : msg.role === 'assistant'
                    ? '0 1px 4px rgba(0,0,0,0.06)'
                    : `0 2px 8px ${brandColor}33`,
                }}>
                  <div style={{ fontSize: '0.875rem', margin: 0, wordBreak: 'break-word' }}>
                    <RenderMessage content={msg.content} color={brandColor} />
                  </div>
                  <span style={{
                    fontSize: '0.67rem', opacity: 0.55, marginTop: '5px',
                    display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Quick reply buttons — shown only at start */}
            {showQuickReply && !isLoading && (
              <div style={{ animation: 'kavFadeIn 0.3s ease' }}>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0 8px' }}>
                  Quick questions:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_REPLIES.map(qr => (
                    <button
                      key={qr.msg}
                      onClick={() => sendMessage(qr.msg)}
                      style={{
                        background   : 'white',
                        border       : `1.5px solid ${brandColor}44`,
                        borderRadius : '20px',
                        padding      : '5px 12px',
                        fontSize     : '0.75rem',
                        fontWeight   : '500',
                        color        : brandColor,
                        cursor       : 'pointer',
                        transition   : 'all 0.15s',
                        fontFamily   : 'inherit',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = brandColor;
                        (e.currentTarget as HTMLButtonElement).style.color = 'white';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'white';
                        (e.currentTarget as HTMLButtonElement).style.color = brandColor;
                      }}
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing dots */}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'kavFadeIn 0.2s ease' }}>
                <div style={{
                  backgroundColor: 'white', border: '1px solid #e2e8f0',
                  borderRadius: '4px 16px 16px 16px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  {[0, 160, 320].map(delay => (
                    <span key={delay} style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      backgroundColor: brandColor, opacity: 0.6,
                      display: 'inline-block',
                      animation: `kavBounce 1.2s ${delay}ms infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Lead capture form */}
            {showLeadForm && !leadSubmitted && (
              <LeadCaptureForm
                color={brandColor}
                defaultQuery={lastUserQuery}
                submitting={leadSubmitting}
                error={leadError}
                onSubmit={submitLead}
                onDismiss={() => setShowLeadForm(false)}
              />
            )}

            {/* Lead submitted confirmation chip */}
            {leadSubmitted && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.75rem', color: '#16a34a', padding: '4px 2px',
              }}>
                <CheckCircle2 size={14} /> Thanks — we've got your details!
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding        : '12px 14px',
            backgroundColor: 'white',
            borderTop      : '1px solid #f1f5f9',
            display        : 'flex',
            gap            : '8px',
            flexShrink     : 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              aria-label="Type your message"
              style={{
                flex        : 1,
                padding     : '10px 14px',
                border      : '1.5px solid #e2e8f0',
                borderRadius: '10px',
                fontSize    : '0.875rem',
                outline     : 'none',
                fontFamily  : 'inherit',
                transition  : 'border-color 0.2s, box-shadow 0.2s',
                color       : '#1e293b',
                background  : '#f8fafc',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = brandColor;
                e.currentTarget.style.boxShadow   = `0 0 0 3px ${brandColor}20`;
                e.currentTarget.style.background  = '#fff';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow   = 'none';
                e.currentTarget.style.background  = '#f8fafc';
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send"
              style={{
                width          : '42px',
                height         : '42px',
                borderRadius   : '10px',
                backgroundColor: !inputValue.trim() || isLoading ? '#cbd5e1' : brandColor,
                color          : 'white',
                border         : 'none',
                cursor         : !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer',
                display        : 'flex',
                alignItems     : 'center',
                justifyContent : 'center',
                flexShrink     : 0,
                transition     : 'all 0.15s',
                boxShadow      : !inputValue.trim() || isLoading ? 'none' : `0 2px 8px ${brandColor}44`,
              }}
              onMouseEnter={e => {
                if (!inputValue.trim() || isLoading) return;
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              {isLoading
                ? <Loader2 size={17} style={{ animation: 'kavSpin 0.8s linear infinite' }} />
                : <Send size={17} />
              }
            </button>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center', fontSize: '0.66rem', color: '#94a3b8',
            padding: '5px 0 8px', backgroundColor: 'white', flexShrink: 0,
          }}>
            Powered by {companyName} · Smart Assistant
          </div>

        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes kavSlideIn {
          from { opacity: 0; transform: translateY(calc(-50% + 24px)) scale(0.96); }
          to   { opacity: 1; transform: translateY(-50%) scale(1); }
        }
        @keyframes kavFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kavBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-6px); }
        }
        @keyframes kavSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes kavPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}