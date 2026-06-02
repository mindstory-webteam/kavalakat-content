"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  FocusEvent,
} from "react";
import { Send, X, MessageCircle, Loader2, Phone, Mail, Download } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id        : string;
  role      : "user" | "assistant";
  content   : string;
  timestamp : Date;
}

interface ChatbotWidgetProps {
  apiEndpoint    ?: string;
  brandColor     ?: string;
  brandName      ?: string;
  companyName    ?: string;
  phoneNumber    ?: string;
  email          ?: string;
  whatsappNumber ?: string;
  brochureUrl    ?: string;
  brochureLabel  ?: string;
}

// ─── Session key ──────────────────────────────────────────────────────────────

function getOrCreateSessionKey(): string {
  const KEY = "kavalakat_chat_session";
  if (typeof window === "undefined") return "ssr-session";
  let k = sessionStorage.getItem(KEY);
  if (!k) {
    k = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, k);
  }
  return k;
}

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────

const WhatsAppIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatbotWidget({
  apiEndpoint    = "https://api.kavalakat.com/api/chat/",
  brandColor     = "#0077be",
  brandName      = "Kavalakat AI",
  companyName    = "Kavalakat",
  phoneNumber    = "0487 244 0380",
  email          = "contact@kavalakat.com",
  whatsappNumber = "916238000000",
  brochureUrl    = "/kavalakat-brochure.pdf",
  brochureLabel  = "Download Brochure",
}: ChatbotWidgetProps) {

  const [isOpen,     setIsOpen]     = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [sessionKey]                = useState<string>(getOrCreateSessionKey);
  const [messages,   setMessages]   = useState<Message[]>([
    {
      id        : "welcome",
      role      : "assistant",
      content   : `Hello! 👋 Welcome to Kavalakat. I'm here to help you.\n\nYou can ask me about:\n• Our services\n• Contact information\n• Job openings\n• About our company\n\nHow can I assist you today? 😊`,
      timestamp : new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Contact handlers ──────────────────────────────────────────────────────

  const handleCall = useCallback(() => {
    window.location.href = `tel:${phoneNumber.replace(/\s/g, "")}`;
  }, [phoneNumber]);

  const handleEmail = useCallback(() => {
    window.location.href = `mailto:${email}`;
  }, [email]);

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/${whatsappNumber}`, "_blank");
  }, [whatsappNumber]);

  const handleBrochure = useCallback(() => {
    const a = document.createElement("a");
    a.href     = brochureUrl;
    a.download = "Kavalakat-Brochure.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [brochureUrl]);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id        : Date.now().toString(),
      role      : "user",
      content   : text,
      timestamp : new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch(apiEndpoint, {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ session_key: sessionKey, message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // handles both { message: "..." } and { content: "..." }
      const reply = data.message || data.content || "Sorry, I couldn't process that.";

      setMessages(prev => [
        ...prev,
        {
          id        : (Date.now() + 1).toString(),
          role      : "assistant",
          content   : reply,
          timestamp : new Date(),
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          id        : (Date.now() + 1).toString(),
          role      : "assistant",
          content   : "Sorry, I ran into a problem. Please try again or contact us directly!",
          timestamp : new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, apiEndpoint, sessionKey]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // ── Side button helpers ───────────────────────────────────────────────────

  const sideBtn: React.CSSProperties = {
    width          : "48px",
    height         : "48px",
    borderRadius   : "24px",
    color          : "white",
    border         : "none",
    cursor         : "pointer",
    display        : "flex",
    alignItems     : "center",
    justifyContent : "flex-start",
    paddingLeft    : "13px",
    paddingRight   : "13px",
    gap            : "10px",
    boxShadow      : "0 4px 14px rgba(0,0,0,0.20)",
    transition     : "all 0.26s cubic-bezier(0.4,0,0.2,1)",
    overflow       : "hidden",
    whiteSpace     : "nowrap",
    fontSize       : "13px",
    fontWeight     : "600",
    fontFamily     : "inherit",
  };

  const expandBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.width        = "auto";
    e.currentTarget.style.paddingRight = "18px";
    e.currentTarget.style.transform    = "translateX(-4px)";
    e.currentTarget.style.boxShadow    = "0 6px 20px rgba(0,0,0,0.28)";
    const span = e.currentTarget.querySelector<HTMLSpanElement>(".btn-label");
    if (span) { span.style.opacity = "1"; span.style.maxWidth = "200px"; }
  };

  const collapseBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.width        = "48px";
    e.currentTarget.style.paddingRight = "13px";
    e.currentTarget.style.transform    = "translateX(0)";
    e.currentTarget.style.boxShadow    = "0 4px 14px rgba(0,0,0,0.20)";
    const span = e.currentTarget.querySelector<HTMLSpanElement>(".btn-label");
    if (span) { span.style.opacity = "0"; span.style.maxWidth = "0"; }
  };

  const labelStyle: React.CSSProperties = {
    opacity    : 0,
    maxWidth   : "0",
    overflow   : "hidden",
    transition : "opacity 0.26s ease, max-width 0.26s ease",
  };

  const onInputFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = brandColor;
    e.currentTarget.style.boxShadow   = `0 0 0 3px ${brandColor}22`;
  };
  const onInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#e5e7eb";
    e.currentTarget.style.boxShadow   = "none";
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Keyframe styles ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes kSlideIn {
          from { opacity: 0; transform: translateY(calc(-50% + 20px)) scale(0.96); }
          to   { opacity: 1; transform: translateY(-50%) scale(1); }
        }
        @keyframes kFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-6px); }
        }
        @keyframes kSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes kPulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
      `}</style>

      {/* ── Side action buttons ──────────────────────────────────────────── */}
      <div
        style={{
          position      : "fixed",
          right         : "1rem",
          top           : "50%",
          transform     : "translateY(-50%)",
          zIndex        : 9999,
          display       : "flex",
          flexDirection : "column",
          gap           : "10px",
          alignItems    : "flex-end",
        }}
        role="complementary"
        aria-label="Contact options"
      >
        {/* Brochure */}
        <button
          onClick={handleBrochure}
          style={{ ...sideBtn, backgroundColor: "#e67e22" }}
          onMouseEnter={expandBtn}
          onMouseLeave={collapseBtn}
          aria-label={brochureLabel}
          title={brochureLabel}
        >
          <Download size={20} style={{ flexShrink: 0 }} />
          <span className="btn-label" style={labelStyle}>{brochureLabel}</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          style={{ ...sideBtn, backgroundColor: "#25D366" }}
          onMouseEnter={expandBtn}
          onMouseLeave={collapseBtn}
          aria-label="Chat on WhatsApp"
          title="WhatsApp"
        >
          <WhatsAppIcon />
          <span className="btn-label" style={labelStyle}>WhatsApp</span>
        </button>

        {/* Phone */}
        <button
          onClick={handleCall}
          style={{ ...sideBtn, backgroundColor: brandColor }}
          onMouseEnter={expandBtn}
          onMouseLeave={collapseBtn}
          aria-label={`Call ${phoneNumber}`}
          title={phoneNumber}
        >
          <Phone size={20} style={{ flexShrink: 0 }} />
          <span className="btn-label" style={labelStyle}>{phoneNumber}</span>
        </button>

        {/* Email */}
        <button
          onClick={handleEmail}
          style={{ ...sideBtn, backgroundColor: brandColor }}
          onMouseEnter={expandBtn}
          onMouseLeave={collapseBtn}
          aria-label={`Email ${email}`}
          title={email}
        >
          <Mail size={20} style={{ flexShrink: 0 }} />
          <span className="btn-label" style={labelStyle}>{email}</span>
        </button>

        {/* Chat toggle */}
        <button
          onClick={() => setIsOpen(v => !v)}
          style={{
            ...sideBtn,
            backgroundColor : brandColor,
            boxShadow       : isOpen
              ? `0 4px 24px ${brandColor}66`
              : "0 4px 14px rgba(0,0,0,0.20)",
          }}
          onMouseEnter={expandBtn}
          onMouseLeave={collapseBtn}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          title={isOpen ? "Close chat" : "Chat with us"}
        >
          {isOpen ? (
            <>
              <X size={20} style={{ flexShrink: 0 }} />
              <span className="btn-label" style={labelStyle}>Close Chat</span>
            </>
          ) : (
            <>
              <MessageCircle size={20} style={{ flexShrink: 0 }} />
              <span className="btn-label" style={labelStyle}>Chat with us</span>
            </>
          )}
        </button>
      </div>

      {/* ── Chat window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Chat Assistant"
          aria-modal="true"
          style={{
            position        : "fixed",
            top             : "50%",
            right           : "72px",
            transform       : "translateY(-50%)",
            zIndex          : 9998,
            width           : "380px",
            maxWidth        : "calc(100vw - 90px)",
            height          : "580px",
            maxHeight       : "calc(100vh - 40px)",
            backgroundColor : "#fff",
            borderRadius    : "20px",
            boxShadow       : "0 30px 70px rgba(0,0,0,0.20), 0 6px 20px rgba(0,0,0,0.08)",
            display         : "flex",
            flexDirection   : "column",
            overflow        : "hidden",
            border          : "1px solid #e8ecf0",
            animation       : "kSlideIn 0.32s cubic-bezier(0.34,1.4,0.64,1) forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding     : "16px 18px",
              background  : `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
              color       : "white",
              display     : "flex",
              alignItems  : "center",
              gap         : "12px",
              flexShrink  : 0,
              position    : "relative",
              overflow    : "hidden",
            }}
          >
            {/* decorative circle bg */}
            <div style={{
              position     : "absolute", top: -20, right: -20,
              width        : 100, height: 100,
              borderRadius : "50%",
              background   : "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }} />
            <div style={{
              position     : "absolute", bottom: -30, right: 60,
              width        : 80, height: 80,
              borderRadius : "50%",
              background   : "rgba(255,255,255,0.04)",
              pointerEvents: "none",
            }} />

            {/* Avatar */}
            <div style={{
              width          : 42,
              height         : 42,
              borderRadius   : "50%",
              background     : "rgba(255,255,255,0.18)",
              border         : "2px solid rgba(255,255,255,0.3)",
              display        : "flex",
              alignItems     : "center",
              justifyContent : "center",
              flexShrink     : 0,
            }}>
              <MessageCircle size={20} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontWeight: 700, fontSize: "15px", margin: 0, lineHeight: 1.2 }}>
                {brandName}
              </h3>
              <p style={{
                fontSize   : "12px",
                opacity    : 0.88,
                margin     : "3px 0 0",
                display    : "flex",
                alignItems : "center",
                gap        : "5px",
              }}>
                <span style={{
                  display        : "inline-block",
                  width          : 7,
                  height         : 7,
                  borderRadius   : "50%",
                  background     : "#4ade80",
                  boxShadow      : "0 0 6px #4ade80",
                  animation      : "kPulse 2s ease-in-out infinite",
                }} />
                Online · Typically replies instantly
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background     : "rgba(255,255,255,0.15)",
                border         : "none",
                color          : "white",
                cursor         : "pointer",
                width          : 32,
                height         : 32,
                borderRadius   : "10px",
                display        : "flex",
                alignItems     : "center",
                justifyContent : "center",
                transition     : "background 0.2s",
                flexShrink     : 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              <X size={17} />
            </button>
          </div>

          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            style={{
              flex            : 1,
              overflowY       : "auto",
              padding         : "16px 14px",
              background      : "#f5f7fa",
              display         : "flex",
              flexDirection   : "column",
              gap             : "12px",
              scrollbarWidth  : "thin",
              scrollbarColor  : "#d1d5db transparent",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                style={{
                  display        : "flex",
                  justifyContent : msg.role === "user" ? "flex-end" : "flex-start",
                  animation      : `kFadeUp 0.22s ease ${idx === messages.length - 1 ? "0ms" : "0ms"} both`,
                  gap            : "8px",
                  alignItems     : "flex-end",
                }}
              >
                {/* Bot avatar for assistant messages */}
                {msg.role === "assistant" && (
                  <div style={{
                    width          : 28,
                    height         : 28,
                    borderRadius   : "50%",
                    background     : brandColor,
                    display        : "flex",
                    alignItems     : "center",
                    justifyContent : "center",
                    flexShrink     : 0,
                    marginBottom   : "2px",
                  }}>
                    <MessageCircle size={13} color="white" />
                  </div>
                )}

                <div style={{
                  maxWidth        : "75%",
                  borderRadius    : msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  padding         : "10px 14px",
                  backgroundColor : msg.role === "user" ? brandColor : "#ffffff",
                  color           : msg.role === "user" ? "white" : "#1f2937",
                  border          : msg.role === "assistant" ? "1px solid #e8ecf0" : "none",
                  boxShadow       : msg.role === "assistant"
                    ? "0 2px 8px rgba(0,0,0,0.06)"
                    : `0 2px 8px ${brandColor}44`,
                }}>
                  <p style={{
                    fontSize   : "13.5px",
                    lineHeight : 1.6,
                    margin     : 0,
                    whiteSpace : "pre-wrap",
                    wordBreak  : "break-word",
                  }}>
                    {msg.content}
                  </p>
                  <span style={{
                    fontSize  : "10.5px",
                    opacity   : 0.55,
                    marginTop : "5px",
                    display   : "block",
                    textAlign : msg.role === "user" ? "right" : "left",
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{
                display        : "flex",
                justifyContent : "flex-start",
                gap            : "8px",
                alignItems     : "flex-end",
                animation      : "kFadeUp 0.2s ease both",
              }}>
                <div style={{
                  width          : 28, height: 28, borderRadius: "50%",
                  background     : brandColor,
                  display        : "flex", alignItems: "center", justifyContent: "center",
                  flexShrink     : 0, marginBottom: "2px",
                }}>
                  <MessageCircle size={13} color="white" />
                </div>
                <div style={{
                  background   : "white",
                  border       : "1px solid #e8ecf0",
                  borderRadius : "18px 18px 18px 4px",
                  padding      : "12px 16px",
                  boxShadow    : "0 2px 8px rgba(0,0,0,0.06)",
                  display      : "flex",
                  alignItems   : "center",
                  gap          : "5px",
                }}
                  aria-label="AI is typing"
                >
                  {[0, 160, 320].map(delay => (
                    <span key={delay} style={{
                      width           : 7, height: 7,
                      borderRadius    : "50%",
                      backgroundColor : brandColor,
                      opacity         : 0.75,
                      animation       : `kBounce 1.2s ${delay}ms ease-in-out infinite`,
                      display         : "block",
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply suggestions (shown only when no conversation yet) */}
          {messages.length === 1 && !isLoading && (
            <div style={{
              padding    : "8px 14px",
              background : "#f5f7fa",
              borderTop  : "1px solid #eef0f4",
              display    : "flex",
              gap        : "6px",
              flexWrap   : "wrap",
            }}>
              {["Our services", "Contact details", "Job openings"].map(q => (
                <button
                  key={q}
                  onClick={() => { setInputValue(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                  style={{
                    background   : "white",
                    border       : `1.5px solid ${brandColor}44`,
                    borderRadius : "20px",
                    padding      : "5px 12px",
                    fontSize     : "12px",
                    color        : brandColor,
                    cursor       : "pointer",
                    fontWeight   : 600,
                    fontFamily   : "inherit",
                    transition   : "all 0.18s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background   = brandColor;
                    e.currentTarget.style.color        = "white";
                    e.currentTarget.style.borderColor  = brandColor;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background   = "white";
                    e.currentTarget.style.color        = brandColor;
                    e.currentTarget.style.borderColor  = `${brandColor}44`;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div style={{
            padding         : "12px 14px",
            backgroundColor : "white",
            borderTop       : "1px solid #eef0f4",
            display         : "flex",
            gap             : "8px",
            flexShrink      : 0,
            alignItems      : "center",
          }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              placeholder="Type your message..."
              disabled={isLoading}
              aria-label="Type your message"
              style={{
                flex        : 1,
                padding     : "10px 14px",
                border      : "1.5px solid #e5e7eb",
                borderRadius: "12px",
                fontSize    : "13.5px",
                outline     : "none",
                fontFamily  : "inherit",
                transition  : "border-color 0.2s, box-shadow 0.2s",
                color       : "#1f2937",
                background  : "#fafbfc",
                lineHeight  : 1.4,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              style={{
                padding         : "10px 12px",
                backgroundColor : !inputValue.trim() || isLoading ? "#cbd5e1" : brandColor,
                color           : "white",
                border          : "none",
                borderRadius    : "12px",
                cursor          : !inputValue.trim() || isLoading ? "not-allowed" : "pointer",
                display         : "flex",
                alignItems      : "center",
                justifyContent  : "center",
                minWidth        : 42,
                height          : 42,
                transition      : "background-color 0.2s, transform 0.12s, box-shadow 0.2s",
                boxShadow       : !inputValue.trim() || isLoading
                  ? "none"
                  : `0 3px 10px ${brandColor}55`,
                flexShrink      : 0,
              }}
              onMouseEnter={e => {
                if (!inputValue.trim() || isLoading) return;
                (e.currentTarget as HTMLButtonElement).style.transform  = "scale(1.07)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 5px 16px ${brandColor}66`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform  = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = !inputValue.trim() || isLoading
                  ? "none"
                  : `0 3px 10px ${brandColor}55`;
              }}
            >
              {isLoading
                ? <Loader2 size={17} style={{ animation: "kSpin 0.8s linear infinite" }} />
                : <Send size={17} />
              }
            </button>
          </div>

          {/* Footer */}
          <div style={{
            textAlign       : "center",
            fontSize        : "10.5px",
            color           : "#b0b8c4",
            padding         : "6px 0 8px",
            backgroundColor : "white",
            borderTop       : "1px solid #f4f6f8",
            flexShrink      : 0,
            letterSpacing   : "0.01em",
          }}>
            Powered by <strong style={{ color: "#94a3b8" }}>Claude AI</strong> · {companyName}
          </div>
        </div>
      )}
    </div>
  );
}