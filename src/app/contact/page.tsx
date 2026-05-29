"use client"
import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import { getContact, submitEnquiry } from '@/lib/api'
import type { Contact, EnquiryPayload } from '@/lib/api'

// ─── Form state ───────────────────────────────────────────────────────────────

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

const ContactPage = () => {
  const [contactInfo, setContactInfo] = useState<Contact | null>(null)
  const [form,        setForm]        = useState<EnquiryForm>(INITIAL_FORM)
  const [status,      setStatus]      = useState<SubmitStatus>('idle')
  const [errorMsg,    setErrorMsg]    = useState('')

  // ── Fetch contact info ────────────────────────────────────────────────────
  useEffect(() => {
    getContact().then((data) => {
      if (data) setContactInfo(data)
    })
  }, [])

  // ── Form change handler ───────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement
    const value  = target.type === 'checkbox' ? target.checked : target.value
    if (errorMsg)           setErrorMsg('')
    if (status === 'error') setStatus('idle')
    setForm(prev => ({ ...prev, [target.name]: value }))
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    // ── Client-side validation ─────────────────────────────────────────────
    if (!form.name.trim())         { setErrorMsg('Please enter your full name.');          return }
    if (!form.email.trim())        { setErrorMsg('Please enter your email address.');      return }
    if (!form.phone.trim())        { setErrorMsg('Please enter your phone number.');       return }
    if (!form.message.trim())      { setErrorMsg('Please enter a message.');               return }
    if (!form.terms_accepted)      { setErrorMsg('Please accept the Terms & Conditions.'); return }

    setStatus('loading')

    // ── Payload — typed as EnquiryPayload, terms_accepted is UI-only ──────
    const payload: EnquiryPayload = {
      name:    form.name.trim(),
      email:   form.email.trim(),
      phone:   form.phone.trim(),
      subject: form.subject.trim(), // required by EnquiryPayload (not optional)
      message: form.message.trim(),
    }

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

  const fullAddress = contactInfo
    ? [contactInfo.address, contactInfo.city, contactInfo.state, contactInfo.pincode]
        .filter(Boolean).join(', ')
    : ''

  return (
    <>
      <InnerPageHeader />
      <Breadcrumb
        title="Contact"
        subtitle="Contact Us Stay Connected How Can We Assist You"
        image='/assets/new-images/new-images/contact-bm.webp'
      />

      <style>{`
        .form-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 28px;
          font-size: 14px;
          line-height: 1.5;
        }
        .form-alert svg    { flex-shrink: 0; margin-top: 2px; }
        .form-alert p      { margin: 4px 0 0; opacity: .85; }
        .form-alert strong { display: block; font-size: 15px; }
        .form-alert--success { background:#e8f5e9; border:1px solid #66bb6a; color:#2e7d32; }
        .form-alert--error   { background:#fce4ec; border:1px solid #ef5350; color:#b71c1c; }

        .primary-btn4:disabled { opacity:.65; cursor:not-allowed; pointer-events:none; }

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
      `}</style>

      <div className="inner-contact-section two pt-120 mb-120" id="scroll-section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="row gy-5 align-items-center">

              {/* ── Left: Contact Info ── */}
              <div className="col-lg-4 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
                <div className="contact-content">
                  <div className="section-title two">
                    <span>
                      <svg width={9} height={14} viewBox="0 0 9 14" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.98296 6.85403C8.95783 6.74844 8.90581 6.65097 8.83186 6.57091C8.7579 6.49085 8.66448 6.43086 8.56049 6.39665L5.40652 5.35573L7.64645 0.92109C7.78706 0.642066 7.70293 0.302757 7.44742 0.120036C7.19067 -0.0620481 6.83912 -0.0346848 6.61687 0.186515L0.188418 6.55014C0.11097 6.62683 0.0545794 6.72182 0.024588 6.82611C-0.00540343 6.9304 -0.008003 7.04055 0.0170357 7.14612C0.042173 7.25171 0.0941932 7.34917 0.168144 7.42923C0.242096 7.50929 0.335517 7.56928 0.439513 7.60349L3.59348 8.64441L1.35355 13.0791C1.21294 13.3581 1.29707 13.6974 1.55258 13.8801C1.80847 14.0616 2.15934 14.0351 2.38313 13.8136L8.81158 7.45000C8.88903 7.37332 8.94542 7.27833 8.97541 7.17403C9.0054 7.06974 9.008 6.95959 8.98296 6.85403Z" />
                      </svg>
                      Get In Touch
                    </span>
                    <h2>Connected With Us</h2>
                  </div>
                  <svg className="arrow-vector" width={8} height={143} viewBox="0 0 8 143" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.33333 3C1.33333 4.47276 2.52724 5.66667 4 5.66667C5.47276 5.66667 6.66667 4.47276 6.66667 3C6.66667 1.52724 5.47276 0.333333 4 0.333333C2.52724 0.333333 1.33333 1.52724 1.33333 3ZM3.64645 142.354C3.84171 142.549 4.1583 142.549 4.35356 142.354L7.53554 139.172C7.7308 138.976 7.7308 138.66 7.53554 138.464C7.34028 138.269 7.0237 138.269 6.82843 138.464L4.00001 141.293L1.17158 138.464C0.976317 138.269 0.659734 138.269 0.464472 138.464C0.26921 138.66 0.26921 138.976 0.464472 139.172L3.64645 142.354ZM3.5 3L3.50001 142L4.50001 142L4.5 3L3.5 3Z" />
                  </svg>
                  <ul className="contact-list">

                    {contactInfo?.phone && (
                      <li className="single-contact">
                        <div className="icon">
                          <svg width={28} height={29} viewBox="0 0 28 29" xmlns="http://www.w3.org/2000/svg">
                            <path d="M27.2653 21.6503L21.598 17.8709C20.8788 17.3951 19.9147 17.5516 19.383 18.2306L17.7322 20.3531C17.6296 20.4885 17.4816 20.5822 17.3154 20.6172C17.1492 20.6522 16.9759 20.626 16.8275 20.5435L16.5134 20.3704C15.4725 19.803 14.1772 19.0966 11.5675 16.486C8.95784 13.8754 8.25001 12.5792 7.6826 11.5401L7.51042 11.2261C7.42683 11.0776 7.39968 10.904 7.43398 10.7372C7.46827 10.5703 7.56169 10.4215 7.69704 10.318L9.81816 8.66771C10.4968 8.13596 10.6536 7.17218 10.1784 6.45276L6.39895 0.785457C5.91192 0.0528623 4.9348 -0.167058 4.18082 0.286179L1.81096 1.70976C1.06634 2.1475 0.520053 2.85649 0.286612 3.68811C-0.56677 6.79751 0.0752209 12.1639 7.98033 20.0699C14.2687 26.3578 18.9501 28.0487 22.1677 28.0487C22.9083 28.0519 23.6459 27.9555 24.3608 27.7623C25.1925 27.5291 25.9016 26.9828 26.3391 26.2379L27.7641 23.8695C28.218 23.1153 27.9982 22.1376 27.2653 21.6503Z" />
                          </svg>
                        </div>
                        <div className="content">
                          <span>To More Inquiry</span>
                          <h6><a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a></h6>
                          {contactInfo.alt_phone && (
                            <h6><a href={`tel:${contactInfo.alt_phone}`}>{contactInfo.alt_phone}</a></h6>
                          )}
                        </div>
                      </li>
                    )}

                    {contactInfo?.email && (
                      <li className="single-contact">
                        <div className="icon">
                          <svg width={26} height={27} viewBox="0 0 26 27" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.6996 26.0522H1.29998C0.955309 26.0519 0.624854 25.9148 0.381135 25.6711C0.137416 25.4274 0.000344239 25.0969 8.47364e-08 24.7523V8.71919C-5.14206e-05 8.63681 0.023378 8.55613 0.0675423 8.48659C0.111707 8.41706 0.174776 8.36155 0.249359 8.32658C0.323942 8.29161 0.406948 8.27862 0.488649 8.28914C0.57035 8.29965 0.647361 8.33324 0.710655 8.38596L11.3428 17.2224C11.8091 17.6077 12.3952 17.8185 13.0002 17.8185C13.6052 17.8185 14.1913 17.6077 14.6577 17.2224L25.2889 8.38553C25.3523 8.33278 25.4293 8.29919 25.511 8.28869C25.5928 8.27819 25.6758 8.29121 25.7504 8.32624C25.825 8.36126 25.8881 8.41684 25.9322 8.48643C25.9763 8.55603 25.9997 8.63678 25.9996 8.71919V24.7523C25.9992 25.0969 25.8622 25.4274 25.6184 25.6711C25.3747 25.9148 25.0443 26.0519 24.6996 26.0522ZM0.866653 9.64261V24.7523C0.866653 24.9915 1.06078 25.1856 1.29998 25.1856H24.6996C24.8145 25.1856 24.9247 25.1399 25.006 25.0587C25.0873 24.9774 25.1329 24.8672 25.1329 24.7523V9.64261L15.2106 17.8888C14.5887 18.4028 13.807 18.6841 13.0002 18.6843C12.1933 18.6844 11.4116 18.4034 10.7894 17.8897L0.866653 9.64261Z" />
                          </svg>
                        </div>
                        <div className="content">
                          <span>To Send Mail</span>
                          <h6><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></h6>
                          {contactInfo.alt_email && (
                            <h6><a href={`mailto:${contactInfo.alt_email}`}>{contactInfo.alt_email}</a></h6>
                          )}
                        </div>
                      </li>
                    )}

                    {fullAddress && (
                      <li className="single-contact">
                        <div className="icon">
                          <svg width={26} height={27} viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 1C9.13401 1 6 4.13401 6 8C6 13.25 13 26 13 26C13 26 20 13.25 20 8C20 4.13401 16.866 1 13 1ZM13 11C11.3431 11 10 9.65685 10 8C10 6.34315 11.3431 5 13 5C14.6569 5 16 6.34315 16 8C16 9.65685 14.6569 11 13 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="content">
                          <span>Our Location</span>
                          <h6>
                            <a href={contactInfo?.map_embed_url ? '#map' : 'https://www.google.com/maps'} target="_blank" rel="noopener noreferrer">
                              {fullAddress}
                            </a>
                          </h6>
                        </div>
                      </li>
                    )}

                  </ul>
                </div>
              </div>

              {/* ── Right: Enquiry Form ── */}
              <div className="col-lg-8 wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
                <div className="contact-form-wrap two">

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
                          <label>Email Address <span style={{ color: '#e53935' }}>*</span></label>
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
                          <label>Phone Number <span style={{ color: '#e53935' }}>*</span></label>
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
                              id="contactCheck"
                              name="terms_accepted"
                              checked={form.terms_accepted}
                              onChange={handleChange}
                              style={{ flexShrink: 0 }}
                            />
                            <label className="form-check-label mb-0" htmlFor="contactCheck">
                              I have read &amp; accepted the Terms &amp; Conditions
                            </label>
                          </div>
                        </div>
                      </div>

                    </div>

                    <button
                      type="submit"
                      className="primary-btn4 btn-hover black-bg mt-2"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <>
                          <span className="btn-spinner" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Enquiry
                          <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                            <g>
                              <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                              <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                            </g>
                          </svg>
                        </>
                      )}
                      <span />
                    </button>
                  </form>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      {contactInfo?.map_embed_url && (
        <div className="contact-map-section mb-120" id="map">
          <div className="container">
            <iframe
              src={contactInfo.map_embed_url}
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

      <FooterTop />
      <Footer1 />
    </>
  )
}

export default ContactPage