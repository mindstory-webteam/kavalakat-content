"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { submitEnquiry } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnquiryForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  terms_accepted: boolean
}

const INITIAL_FORM: EnquiryForm = {
  name: '', email: '', phone: '',
  subject: '', message: '', terms_accepted: false,
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

// ─── Component ────────────────────────────────────────────────────────────────

const HomeContactSection = () => {
  const [openAccordion, setOpenAccordion] = useState('collapseOne')
  const [form,          setForm]          = useState<EnquiryForm>(INITIAL_FORM)
  const [status,        setStatus]        = useState<SubmitStatus>('idle')
  const [errorMsg,      setErrorMsg]      = useState('')

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? '' : id)
  }

  // ── Form change handler ───────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement
    const value  = target.type === 'checkbox' ? target.checked : target.value
    if (errorMsg)           setErrorMsg('')
    if (status === 'error') setStatus('idle')
    setForm(prev => ({ ...prev, [target.name]: value }))
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!form.name.trim())    { setErrorMsg('Please enter your full name.');          return }
    if (!form.email.trim())   { setErrorMsg('Please enter your email address.');      return }
    if (!form.phone.trim())   { setErrorMsg('Please enter your phone number.');       return }
    if (!form.message.trim()) { setErrorMsg('Please enter a message.');               return }
    if (!form.terms_accepted) { setErrorMsg('Please accept the Terms & Conditions.'); return }

    setStatus('loading')

    const payload: Record<string, string | boolean> = {
      name:           form.name.trim(),
      email:          form.email.trim(),
      phone:          form.phone.trim(),
      message:        form.message.trim(),
      terms_accepted: form.terms_accepted,
    }
    if (form.subject.trim()) payload.subject = form.subject.trim()

    try {
      await submitEnquiry(payload)
      setStatus('success')
      setForm(INITIAL_FORM)
    } catch (err: any) {
      setStatus('error')
      let msg = 'Something went wrong. Please try again or call us directly.'
      try {
        const raw     = err?.message ?? ''
        const jsonStr = raw.replace(/^API error \[\d+\] on [^:]+:\s*/, '')
        const parsed  = JSON.parse(jsonStr)
        if (typeof parsed.detail === 'string') {
          msg = parsed.detail
        } else if (typeof parsed.message === 'string') {
          msg = parsed.message
        } else {
          const firstKey = Object.keys(parsed)[0]
          if (firstKey) {
            const val = parsed[firstKey]
            msg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val)
          }
        }
      } catch { /* keep generic message */ }
      setErrorMsg(msg)
    }
  }

  return (
    <>
      <style>{`
        .form-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 24px;
          font-size: 14px;
          line-height: 1.5;
        }
        .form-alert svg    { flex-shrink: 0; margin-top: 2px; }
        .form-alert p      { margin: 4px 0 0; opacity: .85; }
        .form-alert strong { display: block; font-size: 15px; }
        .form-alert--success { background:#e8f5e9; border:1px solid #66bb6a; color:#2e7d32; }
        .form-alert--error   { background:#fce4ec; border:1px solid #ef5350; color:#b71c1c; }

        @keyframes kcSpin { to { transform: rotate(360deg); } }
        .btn-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: kcSpin .7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        .primary-btn3:disabled { opacity: .65; cursor: not-allowed; pointer-events: none; }
      `}</style>

      <div className="home5-contact-section mb-120">
        <div className="container">
          <div className="row gy-5">

            {/* ── Left: FAQ Accordion ── */}
            <div className="col-lg-5">
              <div className="section-title four mb-60 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                <h2>Get In Touch With Us.</h2>
              </div>
              <div className="faq-wrap two">
                <div className="accordion" id="accordionExample">

                  {[
                    {
                      id: 'collapseOne',
                      headingId: 'headingOne',
                      question: '01. What construction materials does Kavalakat supply?',
                      answer: 'We supply TMT steel bars, MS structurals, cement (Ultratech, JSW, Chettinad Anjani), paints (Dulux), white cement (Birla White), construction chemicals and more.',
                    },
                    {
                      id: 'collapseTwo',
                      headingId: 'headingTwo',
                      question: '2. Which districts does Kavalakat serve?',
                      answer: 'We operate across all districts of Kerala from our branches in Thrissur, Palakkad, Ernakulam, Idukki, and Trivandrum, Kannur plus Coimbatore in Tamil Nadu, with capability to serve across South India.',
                    },
                    {
                      id: 'collapseThree',
                      headingId: 'headingThree',
                      question: '3. Are you an authorized dealer for SAIL TMT?',
                      answer: 'Yes. We are the exclusive authorized distributor of SAIL SEQR TMT Rebars for the Thrissur-to-Trivandrum corridor, appointed directly by Steel Authority of India Ltd.',
                    },
                    {
                      id: 'collapseFour',
                      headingId: 'headingFour',
                      question: '4. How much steel does Kavalakat handle monthly?',
                      answer: 'We handle over 10,000+ MT of steel per month including ~5,000–5,500 MT of Vizag TMT, ~1,500 MT of SAIL, ~2,000 MT of Shyam Steel, and ~2,000–2,500 MT of MS Structurals.',
                    },
                    {
                      id: 'collapseFive',
                      headingId: 'headingFive',
                      question: '5. How do I place an order?',
                      answer: 'Call us at 0487 244 0380 or email info@kavalakat.com. You can also visit our nearest branch for product consultation and pricing.',
                    },
                  ].map(({ id, headingId, question, answer }) => (
                    <div key={id} className="accordion-item wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                      <h2 className="accordion-header" id={headingId}>
                        <button
                          className={`accordion-button ${openAccordion !== id ? 'collapsed' : ''}`}
                          type="button"
                          onClick={() => toggleAccordion(id)}
                          aria-expanded={openAccordion === id}
                          aria-controls={id}
                        >
                          {question}
                        </button>
                      </h2>
                      <div
                        id={id}
                        className={`accordion-collapse collapse ${openAccordion === id ? 'show' : ''}`}
                        aria-labelledby={headingId}
                      >
                        <div className="accordion-body">{answer}</div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>

            {/* ── Right: Contact Form ── */}
            <div className="col-lg-7 d-flex align-items-lg-end wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="contact-form-wrap three" style={{ width: '100%' }}>

                {/* Success alert */}
                {status === 'success' && (
                  <div className="form-alert form-alert--success">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <strong>Thank you for reaching out!</strong>
                      <p>Your enquiry has been submitted. We&apos;ll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {/* Error alert */}
                {errorMsg && (
                  <div className="form-alert form-alert--error">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <strong>Oops!</strong>
                      <p>{errorMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-4">

                    <div className="col-md-12">
                      <div className="form-inner">
                        <label>Full Name <span style={{ color: '#e53935' }}>*</span></label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-inner">
                        <label>Email <span style={{ color: '#e53935' }}>*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-inner">
                        <label>Phone <span style={{ color: '#e53935' }}>*</span></label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-inner">
                        <label>Subject</label>
                        <input
                          type="text"
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          placeholder="Brief subject (optional)"
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="form-inner">
                        <label>Message <span style={{ color: '#e53935' }}>*</span></label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help you..."
                          rows={5}
                        />
                      </div>
                    </div>

                    <div className="col-lg-12">
                      <div className="form-inner2">
                        <div className="form-check d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="homeContactCheck"
                            name="terms_accepted"
                            checked={form.terms_accepted}
                            onChange={handleChange}
                            style={{ flexShrink: 0 }}
                          />
                          <label className="form-check-label mb-0" htmlFor="homeContactCheck">
                            I have read &amp; accepted Terms &amp; Conditions.
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="about-btn mt-3">
                    <button
                      type="submit"
                      className="primary-btn3"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <>
                          <span className="btn-spinner" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <span>Send Message</span>
                          <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                            <g>
                              <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                              <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                            </g>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default HomeContactSection