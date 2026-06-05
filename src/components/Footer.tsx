// ✅ FILE PATH: src/components/Footer.tsx
"use client"
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { getContact } from '@/lib/api'
import type { Contact } from '@/lib/api'
import { useNavData } from '@/hooks/useNavData'

// ─── Sub-components ───────────────────────────────────────────────────────────
const LinkArrow = () => (
  <svg width={9} height={9} viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.0445549 0H9.00008V1.67647L1.69308 9L0 7.32353L4.99014 2.38235L0.0445549 2.42647V0Z" />
    <path d="M9.0002 8.9996V3.35254L6.59424 5.73489V8.9996H9.0002Z" />
  </svg>
)

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <Link href={href} className="footer-nav-link">
      <span className="footer-nav-arrow"><LinkArrow /></span>
      <span className="footer-nav-text">{label}</span>
    </Link>
  </li>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const Footer = () => {
  const [contactInfo, setContactInfo] = useState<Contact | null>(null)

  // ── Shared nav data (same hook as Header & InnerPageHeader) ───────────────
  const { footer: navItems } = useNavData()

  // ── Fetch contact ──────────────────────────────────────────────────────────
  useEffect(() => {
    getContact().then((data) => { if (data) setContactInfo(data) })
  }, [])

  const fullAddress = contactInfo
    ? [contactInfo.address, contactInfo.city, contactInfo.state, contactInfo.pincode].filter(Boolean).join(', ')
    : ""

  return (
    <footer className="footer-section style-3">
      <div className="footer-wrapper">
        <div className="container">

          {/* Top bar */}
          <div className="footer-top-area">
            <div className="row g-4 align-items-center">
              <div className="col-md-3">
                <Link href="/" className="footer-logo">
                  <img width={160} height={50} src="/assets/new-images/logo/KavalakkatLogo-theme.png" alt="" />
                </Link>
              </div>
              <div className="col-md-5 d-flex justify-content-md-center">
                <p>Welcome to Kavalakat where innovation meet our passion in a journey that started dream.</p>
              </div>
              <div className="col-md-4 d-flex justify-content-md-end" />
            </div>
          </div>

          <div className="footer-menu-and-address-wrap">
            <div className="row align-items-start">

              {/* Address */}
              <div className="col-lg-3 col-md-12 footer-address-col">
                <div className="footer-widget">
                  <div className="address-area">
                    <ul className="address-list">
                      {fullAddress && (
                        <li className="single-address">
                          {contactInfo?.city && <span>{contactInfo.city}</span>}
                          <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                            {fullAddress}
                          </a>
                        </li>
                      )}
                    </ul>
                    <Link href="/contact" className="location-btn">View All Factory Location</Link>
                  </div>
                </div>
              </div>

              {/* Nav columns */}
              <div className="col-lg-9 col-md-12 mt-5">
                <div className="footer-menu">
                  <div className="row gy-5">

                    {/* About — always static */}
                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-6 d-flex justify-content-lg-center">
                      <div className="footer-widget">
                        <div className="widget-title"><h5>About</h5></div>
                        <ul className="footer-nav-list">
                          <NavLink href="/projects" label="Projects" />
                          <NavLink href="/gallery"  label="Gallery" />
                          <NavLink href="/blog"     label="Blog" />
                          <NavLink href="/contact"  label="Contact" />
                          <NavLink href="/career"   label="Career's" />
                        </ul>
                      </div>
                    </div>

                    {/* Trading — only renders when data exists */}
                    {navItems.trading.length > 0 && (
                      <div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-6 d-flex justify-content-lg-center">
                        <div className="footer-widget">
                          <div className="widget-title"><h5>Trading</h5></div>
                          <ul className="footer-nav-list">
                            {navItems.trading.map(n => (
                              <NavLink key={n.href} href={n.href} label={n.name} />
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Distribution — only renders when data exists */}
                    {navItems.distribution.length > 0 && (
                      <div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-6 d-flex justify-content-lg-center">
                        <div className="footer-widget">
                          <div className="widget-title"><h5>Distribution</h5></div>
                          <ul className="footer-nav-list">
                            {navItems.distribution.map(n => (
                              <NavLink key={n.href} href={n.href} label={n.name} />
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Services — only renders when data exists */}
                    {navItems.services.length > 0 && (
                      <div className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-6 d-flex justify-content-lg-center">
                        <div className="footer-widget">
                          <div className="widget-title"><h5>Services</h5></div>
                          <ul className="footer-nav-list">
                            {navItems.services.map(n => (
                              <NavLink key={n.href} href={n.href} label={n.name} />
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Extra categories (beyond trading / distribution / services) */}
                    {navItems.extra.map(group => (
                      <div key={group.slug} className="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-6 d-flex justify-content-lg-center">
                        <div className="footer-widget">
                          <div className="widget-title"><h5>{group.label}</h5></div>
                          <ul className="footer-nav-list">
                            {group.items.map(n => (
                              <NavLink key={n.href} href={n.href} label={n.name} />
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom-wrap">
        <div className="container">
          <div className="footer-bottom">
            <div className="copyright-area">
              <p>Copyright 2026 <Link href="/">Kavalakat</Link> | Design By <a href="https://mindstory.in/" style={{ color: 'orange' }}>Mindstory</a></p>
            </div>
            <ul className="social-area">
              {contactInfo?.linkedin  && <li><a href={contactInfo.linkedin}  target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin" />LinkedIn</a></li>}
              {contactInfo?.facebook  && <li><a href={contactInfo.facebook}  target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook" />Facebook</a></li>}
              {contactInfo?.instagram && <li><a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram" />Instagram</a></li>}
              {contactInfo?.youtube   && <li><a href={contactInfo.youtube}   target="_blank" rel="noopener noreferrer"><i className="bi bi-youtube" />YouTube</a></li>}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Address column overflow fix ── */
        .footer-address-col {
          min-width: 0;
          overflow: hidden;
        }
        .footer-address-col .footer-widget {
          max-width: 100%;
          overflow: hidden;
        }
        .footer-address-col .address-area,
        .footer-address-col .address-list {
          max-width: 100%;
        }
        .footer-address-col .single-address {
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          max-width: 100%;
        }
        .footer-address-col .single-address span,
        .footer-address-col .single-address a {
          display: block;
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          max-width: 100%;
        }

        /* ── Nav columns: prevent shrink overflow ── */
        .footer-menu .footer-widget {
          min-width: 0;
          width: 100%;
        }

        /* ── Responsive: stack address above nav on tablet/mobile ── */
        @media (max-width: 991px) {
          .footer-address-col {
            margin-bottom: 2rem;
          }
          .col-lg-9.col-md-12.mt-5 {
            margin-top: 0 !important;
          }
        }

        /* ── Nav list styles ── */
        .footer-nav-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0}
        .footer-nav-list li{border-bottom:1px solid rgba(255,255,255,0.07)}
        .footer-nav-list li:first-child{border-top:1px solid rgba(255,255,255,0.07)}
        .footer-nav-link{display:flex;align-items:center;gap:10px;padding:9px 0;text-decoration:none;color:inherit;transition:gap .22s ease,color .22s ease}
        .footer-nav-link:hover{gap:14px;color:#0160b2}
        .footer-nav-arrow{display:inline-flex;align-items:center;flex-shrink:0;opacity:0;transform:translateX(-4px);transition:opacity .22s ease,transform .22s ease}
        .footer-nav-link:hover .footer-nav-arrow{opacity:1;transform:translateX(0)}
        .footer-nav-arrow svg path{fill:currentColor}
        .footer-nav-text{font-size:.875rem;font-weight:500;line-height:1.4;transition:transform .22s ease;text-transform: uppercase;}
        .footer-nav-link:hover .footer-nav-text{transform:translateX(2px)}
      `}</style>
    </footer>
  )
}

export default Footer