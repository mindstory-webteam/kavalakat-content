'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2, Phone, Mail, Download } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  apiEndpoint?: string;
  brandColor?: string;
  brandName?: string;
  phoneNumber?: string;
  companyName?: string;
  email?: string;
  whatsappNumber?: string;
  brochureUrl?: string;        // ← NEW
  brochureLabel?: string;      // ← NEW (optional custom label)
}

export default function ChatbotWidget({ 
  apiEndpoint = '/api/chat',
  brandColor = '#0077be',
  brandName = 'AI Assistant',
  phoneNumber = '0487 244 0380',
  companyName = 'Your Company',
  email = 'contact@yourcompany.com',
  whatsappNumber = '61487244380',
  brochureUrl = '/brochure.pdf',          // ← NEW
  brochureLabel = 'Download Brochure'     // ← NEW
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm ${brandName} from ${companyName}. How can I help you today? If you'd like to speak with someone directly, feel free to use the contact buttons below.`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber.replace(/\s/g, '')}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

 const handleBrochure = () => {
  const link = document.createElement('a');
  link.href = brochureUrl;
  link.download = 'Kavalakat-Brochure.pdf'; // filename shown in download dialog
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.content || "Sorry, I couldn't process that.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try calling us directly or try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Shared style for all expandable side buttons
  const sideButtonStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: '12px',
    paddingRight: '12px',
    gap: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '14px',
    fontWeight: '600',
  };

  const labelStyle: React.CSSProperties = {
    opacity: 0,
    maxWidth: 0,
    transition: 'opacity 0.3s ease, max-width 0.3s ease',
    overflow: 'hidden',
  };

  const expandButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.width = 'auto';
    e.currentTarget.style.paddingRight = '16px';
  };

  const collapseButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.width = '48px';
    e.currentTarget.style.paddingRight = '12px';
  };

  return (
    <div className="chatbot-widget-container">
      {/* Contact Buttons */}
      <div
        style={{
          position: 'fixed',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'flex-end',
        }}
      >

        {/* ── BROCHURE DOWNLOAD BUTTON (NEW) ── */}
        <button
          onClick={handleBrochure}
          className="expandable-button"
          style={{ ...sideButtonStyle, backgroundColor: '#e67e22' }}
          onMouseEnter={expandButton}
          onMouseLeave={collapseButton}
          aria-label={brochureLabel}
        >
          <Download style={{ width: 20, height: 20, flexShrink: 0 }} />
          <span className="button-text" style={labelStyle}>
            {brochureLabel}
          </span>
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          className="expandable-button"
          style={{ ...sideButtonStyle, backgroundColor: '#25D366' }}
          onMouseEnter={expandButton}
          onMouseLeave={collapseButton}
          aria-label="WhatsApp"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="button-text" style={labelStyle}>WhatsApp</span>
        </button>

        {/* Phone Button */}
        <button
          onClick={handleCall}
          className="expandable-button"
          style={{ ...sideButtonStyle, backgroundColor: brandColor }}
          onMouseEnter={expandButton}
          onMouseLeave={collapseButton}
          aria-label={`Call ${phoneNumber}`}
        >
          <Phone style={{ width: 20, height: 20, flexShrink: 0 }} />
          <span className="button-text" style={labelStyle}>{phoneNumber}</span>
        </button>

        {/* Email Button */}
        <button
          onClick={handleEmail}
          className="expandable-button"
          style={{ ...sideButtonStyle, backgroundColor: brandColor }}
          onMouseEnter={expandButton}
          onMouseLeave={collapseButton}
          aria-label="Send email"
        >
          <Mail style={{ width: 20, height: 20, flexShrink: 0 }} />
          <span className="button-text" style={labelStyle}>{email}</span>
        </button>

        {/* Chatbot Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="expandable-button"
          style={{ ...sideButtonStyle, backgroundColor: brandColor }}
          onMouseEnter={expandButton}
          onMouseLeave={collapseButton}
          aria-label="Toggle chat"
        >
          {isOpen ? (
            <>
              <X style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span className="button-text" style={labelStyle}>Close Chat</span>
            </>
          ) : (
            <>
              <MessageCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span className="button-text" style={labelStyle}>Chat with us</span>
            </>
          )}
        </button>
      </div>

      {/* Chatbot Window — unchanged from your original */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            right: '90px',
            transform: 'translateY(-50%)',
            zIndex: 9999,
            width: '380px',
            maxWidth: 'calc(100vw - 2rem)',
            height: '600px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div style={{ padding: '1rem', backgroundColor: brandColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{brandName}</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Online now</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Close chat">
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((message) => (
              <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '75%', borderRadius: '16px', padding: '0.875rem 1rem', backgroundColor: message.role === 'user' ? brandColor : 'white', color: message.role === 'user' ? 'white' : '#1f2937', border: message.role === 'assistant' ? '1px solid #e5e7eb' : 'none', boxShadow: message.role === 'assistant' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</p>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem', display: 'block' }}>
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: 'white', color: '#1f2937', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '0.875rem 1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <Loader2 style={{ width: 20, height: 20, color: brandColor, animation: 'spin 1s linear infinite' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9375rem', outline: 'none' }}
                disabled={isLoading}
                onFocus={(e) => { e.currentTarget.style.borderColor = brandColor; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                style={{ padding: '0.75rem 1rem', backgroundColor: brandColor, color: 'white', border: 'none', borderRadius: '12px', cursor: !inputValue.trim() || isLoading ? 'not-allowed' : 'pointer', opacity: !inputValue.trim() || isLoading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '48px' }}
                aria-label="Send message"
              >
                <Send style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .expandable-button:hover .button-text {
          opacity: 1 !important;
          max-width: 300px !important;
        }
        .expandable-button:hover {
          transform: translateX(-4px);
        }
      `}</style>
    </div>
  );
}