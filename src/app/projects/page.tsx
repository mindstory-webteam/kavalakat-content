'use client'
import FooterTop from '@/components/FooterTop'
import HomepageBlogSection from '@/components/HomepageBlogSection'
import InnerPageHeader from '@/components/InnerPageHeader'
import React, { useState, useEffect, useCallback } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: number
  title: string
  description: string
  client: string
  client_logo: string
  client_logo_url: string
  client_location: string
  location: string
  year: number
  tag: string
  image: string
  image_url: string
  contact_url: string
  is_featured: boolean
  created_at: string
}

type ProjectsApiResponse =
  | Project[]
  | { results: Project[] }
  | { data: Project[]; success: boolean; pagination?: unknown }

function extractProjects(raw: ProjectsApiResponse): Project[] {
  if (Array.isArray(raw)) return raw
  if ('data' in raw && Array.isArray(raw.data)) return raw.data
  if ('results' in raw && Array.isArray(raw.results)) return raw.results
  return []
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.kavalakat.com/api'

const FALLBACK_IMAGE = '/assets/new-images/projects/project-1.jpg'
const FALLBACK_LOGO  = '/assets/new-images/clints/1 (1).jpg'

const stats = [
  { number: '500+', label: 'Projects Completed' },
  { number: '45+',  label: 'Years of Excellence' },
  { number: '200+', label: 'Industry Partners' },
  { number: '15+',  label: 'Skilled Professionals' },
]

// ─── Component ────────────────────────────────────────────────────────────────
const Page = () => {
  const [projects, setProjects]   = useState<Project[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/projects/`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw: ProjectsApiResponse = await res.json()
      const items = extractProjects(raw)
      // Featured first, then by created_at desc
      items.sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      setProjects(items)
    } catch (err) {
      console.error('[Projects] fetch failed:', err)
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  return (
    <>
      <InnerPageHeader />
      <Breadcrumb
        title="Our Projects"
        subtitle="Building Kerala's Future — Trusted by Government, Healthcare & Infrastructure Leaders."
        image="/assets/new-images/new-images/about-imges/projects.webp"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .psc-page {
          --font-manrope:     "Manrope", sans-serif;
          --font-dmsans:      "DM Sans", sans-serif;
          --white-color:      #ffffff;
          --dark-title-color: #1C1A1E;
          --title-color2:     #0160b2;
          --text-color:       #00000099;
          --primary-color1:   #0160b2;
          --borders-color:    #eee;
          --bg-light:         #f8f9fc;
        }

        .psc-stats { background: var(--primary-color1); padding: 50px 0; }
        .psc-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .psc-stat { text-align: center; padding: 0 24px; position: relative; }
        .psc-stat + .psc-stat::before {
          content: ''; position: absolute; left: 0; top: 18%; bottom: 18%;
          width: 1px; background: rgba(255,255,255,0.2);
        }
        .psc-stat-num {
          font-family: var(--font-manrope);
          font-size: clamp(32px, 3.8vw, 50px); font-weight: 800;
          color: #fff; line-height: 1; letter-spacing: -0.02em; margin-bottom: 8px;
        }
        .psc-stat-lbl {
          font-family: var(--font-dmsans); font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.7); letter-spacing: 0.08em; text-transform: uppercase;
        }

        .psc-section { font-family: var(--font-dmsans); background: var(--bg-light); padding: 100px 0 120px; }

        .psc-hdr { text-align: center; margin-bottom: 64px; }
        .psc-hdr h2 {
          font-family: var(--font-manrope); font-size: clamp(30px, 4vw, 50px);
          font-weight: 800; color: var(--dark-title-color); line-height: 1.1;
          margin: 0 0 16px; letter-spacing: -0.025em;
        }
        .psc-hdr h2 span { color: var(--title-color2); }
        .psc-hdr p { font-size: 15px; color: var(--text-color); max-width: 560px; margin: 0 auto; line-height: 1.76; }

        .psc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }

        .psc-card {
          background: #fff; overflow: hidden;
          box-shadow: 0 4px 24px rgba(1,96,178,0.1), 0 1px 4px rgba(0,0,0,0.04);
          transition: transform 0.38s cubic-bezier(0.16,1,0.3,1), box-shadow 0.38s;
          display: flex; flex-direction: column;
        }
        .psc-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(1,96,178,0.18), 0 4px 12px rgba(0,0,0,0.07);
        }

        .psc-img-wrap { position: relative; overflow: hidden; aspect-ratio: 16 / 10; }
        .psc-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s ease; }
        .psc-card:hover .psc-img-wrap img { transform: scale(1.06); }
        .psc-img-wrap::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(1,96,178,0.58) 0%, transparent 55%);
          opacity: 0.5; transition: opacity 0.38s;
        }
        .psc-card:hover .psc-img-wrap::after { opacity: 0.78; }

        .psc-badge {
          position: absolute; top: 14px; left: 14px; z-index: 2;
          font-family: var(--font-manrope); font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #fff;
          background: var(--primary-color1); padding: 5px 13px; border-radius: 100px;
          box-shadow: 0 3px 12px rgba(1,96,178,0.4);
        }
        .psc-featured-badge {
          position: absolute; top: 14px; right: 14px; z-index: 2;
          font-family: var(--font-manrope); font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: #fff;
          background: #e8a020; padding: 5px 11px; border-radius: 100px;
        }

        .psc-arr {
          position: absolute; bottom: 14px; right: 14px; z-index: 2;
          width: 38px; height: 38px; background: #fff; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: translateY(8px) scale(0.85);
          transition: opacity 0.28s, transform 0.28s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .psc-card:hover .psc-arr { opacity: 1; transform: translateY(0) scale(1); }
        .psc-arr svg { fill: var(--primary-color1); }

        .psc-body { padding: 20px 22px 22px; display: flex; flex-direction: column; flex: 1; }

        .psc-client {
          display: flex; align-items: center; gap: 11px;
          margin-bottom: 12px; padding-bottom: 12px;
          border-bottom: 1px solid var(--borders-color);
        }
        .psc-logo {
          width: 42px; height: 42px; border-radius: 9px;
          border: 1px solid var(--borders-color); background: #f5f5f5;
          flex-shrink: 0; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .psc-logo img { width: 100%; height: 100%; object-fit: contain; }
        .psc-client-info h5 {
          font-family: var(--font-manrope); font-size: 13.5px; font-weight: 700;
          color: var(--dark-title-color); margin: 0 0 2px; line-height: 1.3;
        }
        .psc-client-info span { font-size: 12px; color: var(--text-color); display: flex; align-items: center; gap: 4px; }

        .psc-body p { font-size: 14px; line-height: 1.72; color: var(--text-color); margin: 0 0 16px; flex: 1; }

        .psc-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-manrope); font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--primary-color1); text-decoration: none; transition: gap 0.2s;
        }
        .psc-link:hover { gap: 11px; }
        .psc-link svg { fill: var(--primary-color1); transition: transform 0.2s; }
        .psc-link:hover svg { transform: translate(2px,-2px); }

        .psc-skeleton {
          background: linear-gradient(90deg, #e8edf2 25%, #f5f7fa 50%, #e8edf2 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 4px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 1100px) { .psc-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) {
          .psc-grid { grid-template-columns: 1fr; }
          .psc-stats-grid { grid-template-columns: repeat(2,1fr); gap: 36px 0; }
          .psc-stat:nth-child(odd)::before { display: none; }
          .psc-section { padding: 70px 0 80px; }
          .psc-hdr { margin-bottom: 50px; }
        }
      `}</style>

      {/* ── Stats Band ── */}
      <div className="psc-stats psc-page">
        <div className="container">
          <div className="psc-stats-grid">
            {stats.map((s, i) => (
              <div className="psc-stat" key={i}>
                <div className="psc-stat-num">{s.number}</div>
                <div className="psc-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Projects Section ── */}
      <section className="psc-section psc-page" id="scroll-section">
        <div className="container">

          {/* Header */}
          <div className="psc-hdr wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
            <h2>Projects That <span>Define Us</span></h2>
            <p>
              From metro rail corridors to government hospitals — Kavalakat has
              been the trusted material supply partner for Kerala's most
              significant infrastructure developments.
            </p>
          </div>

          {/* ── Loading skeletons ── */}
          {loading && (
            <div className="psc-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="psc-card" key={i}>
                  <div className="psc-skeleton" style={{ aspectRatio: '16/10' }} />
                  <div className="psc-body" style={{ gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                      <div className="psc-skeleton" style={{ width: 42, height: 42, borderRadius: 9, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="psc-skeleton" style={{ height: 14, marginBottom: 6 }} />
                        <div className="psc-skeleton" style={{ height: 11, width: '60%' }} />
                      </div>
                    </div>
                    <div className="psc-skeleton" style={{ height: 11, marginBottom: 5 }} />
                    <div className="psc-skeleton" style={{ height: 11, marginBottom: 5 }} />
                    <div className="psc-skeleton" style={{ height: 11, width: '75%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 240 }}>
              <p className="text-danger mb-3">{error}</p>
              <button className="btn btn-outline-secondary" onClick={fetchProjects}>Try Again</button>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && projects.length === 0 && (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 240 }}>
              <p className="text-muted">No projects available.</p>
            </div>
          )}

          {/* ── Grid ── */}
          {!loading && !error && projects.length > 0 && (
            <div className="psc-grid">
              {projects.map((p, i) => {
                const imgSrc  = p.image_url  || p.image  || FALLBACK_IMAGE
                const logoSrc = p.client_logo_url || p.client_logo || FALLBACK_LOGO
                const location = p.client_location || p.location || ''

                return (
                  <div
                    className="psc-card wow animate fadeInUp"
                    data-wow-delay={`${200 + (i % 3) * 100}ms`}
                    data-wow-duration="1500ms"
                    key={p.id}
                  >
                    <div className="psc-img-wrap">
                      <Image
                        width={600} height={380}
                        src={imgSrc}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                      />
                      {p.tag && <span className="psc-badge">{p.tag}</span>}
                      {p.is_featured && (
                        <span className="psc-featured-badge">Featured</span>
                      )}
                      <div className="psc-arr">
                        <svg width={13} height={13} viewBox="0 0 35 35">
                          <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z"/>
                          <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z"/>
                        </svg>
                      </div>
                    </div>

                    <div className="psc-body">
                      <div className="psc-client">
                        <div className="psc-logo">
                          <Image
                            width={42} height={42}
                            src={logoSrc}
                            alt={p.client || p.title}
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO }}
                          />
                        </div>
                        <div className="psc-client-info">
                          <h5>{p.client || p.title}</h5>
                          {location && (
                            <span>
                              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              {location}
                            </span>
                          )}
                        </div>
                      </div>

                      <p>{p.description}</p>

                      <Link
                        href={p.contact_url || '/contact'}
                        className="psc-link"
                        target={p.contact_url ? '_blank' : undefined}
                        rel={p.contact_url ? 'noopener noreferrer' : undefined}
                      >
                        Get In Touch
                        <svg width={12} height={12} viewBox="0 0 35 35">
                          <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z"/>
                          <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </section>

      <HomepageBlogSection />
      <FooterTop />
      <Footer1 />
    </>
  )
}

export default Page