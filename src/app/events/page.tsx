'use client'
import FooterTop from '@/components/FooterTop'
import HomepageBlogSection from '@/components/HomepageBlogSection'
import InnerPageHeader from '@/components/InnerPageHeader'
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
interface EventItem {
  id: number
  title: string
  description: string
  organizer: string
  organizer_logo: string
  organizer_logo_url: string
  venue: string
  location: string
  event_date: string
  event_time: string
  tag: string
  image: string
  image_url: string
  images?: string[]
  registration_url: string
  is_featured: boolean
  created_at: string
}

type EventsApiResponse =
  | EventItem[]
  | { results: EventItem[] }
  | { data: EventItem[]; success: boolean; pagination?: unknown }

function extractEvents(raw: EventsApiResponse): EventItem[] {
  if (Array.isArray(raw)) return raw
  if ('data' in raw && Array.isArray(raw.data)) return raw.data
  if ('results' in raw && Array.isArray(raw.results)) return raw.results
  return []
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.kavalakat.com/api'

const FALLBACK_IMAGE = '/assets/new-images/projects/project-1.jpg'
const FALLBACK_LOGO  = '/assets/new-images/clints/1 (1).jpg'

// ─── Dummy fallback data ────────────────────────────────────────────────────
const DUMMY_EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'Kerala Build Expo 2026',
    description:
      "Kavalakat's flagship stall at Kerala's largest construction materials expo, showcasing our latest range of TMT bars, cement and plumbing solutions to over 5,000 visitors from across the state.",
    organizer: 'Kavalakat Group',
    organizer_logo: '/assets/new-images/clints/1 (1).jpg',
    organizer_logo_url: '',
    venue: 'International Trade Fair Complex',
    location: 'Kochi, Kerala',
    event_date: '2026-08-14',
    event_time: '10:00 AM - 6:00 PM',
    tag: 'Expo',
    image: '/assets/new-images/projects/project-1.jpg',
    image_url: '',
    images: [
      '/assets/new-images/projects/project-1.jpg',
      '/assets/new-images/projects/project-2.jpg',
      '/assets/new-images/projects/project-3.jpg',
    ],
    registration_url: '/contact',
    is_featured: true,
    created_at: '2026-06-01',
  },
  {
    id: 2,
    title: 'Contractor Partnership Meet',
    description:
      'An exclusive evening for our valued contractor partners, recognising long-standing collaborations and unveiling new bulk-order pricing tiers and credit schemes for the upcoming financial year.',
    organizer: 'Kavalakat Group',
    organizer_logo: '/assets/new-images/clints/1 (1).jpg',
    organizer_logo_url: '',
    venue: 'Hotel Crowne Plaza',
    location: 'Kozhikode, Kerala',
    event_date: '2026-07-02',
    event_time: '5:30 PM onwards',
    tag: 'Networking',
    image: '/assets/new-images/projects/project-2.jpg',
    image_url: '',
    images: [
      '/assets/new-images/projects/project-2.jpg',
      '/assets/new-images/projects/project-4.jpg',
      '/assets/new-images/projects/project-1.jpg',
    ],
    registration_url: '/contact',
    is_featured: false,
    created_at: '2026-05-20',
  },
  {
    id: 3,
    title: 'Site Safety & Materials Workshop',
    description:
      'A hands-on workshop for site engineers and supervisors covering safe handling and storage of construction materials, quality checks for steel and cement, and best practices for site logistics.',
    organizer: 'Kavalakat Academy',
    organizer_logo: '/assets/new-images/clints/1 (1).jpg',
    organizer_logo_url: '',
    venue: 'Kavalakat Training Centre',
    location: 'Thrissur, Kerala',
    event_date: '2026-06-25',
    event_time: '9:30 AM - 1:00 PM',
    tag: 'Workshop',
    image: '/assets/new-images/projects/project-3.jpg',
    image_url: '',
    images: [
      '/assets/new-images/projects/project-3.jpg',
      '/assets/new-images/projects/project-5.jpg',
    ],
    registration_url: '/contact',
    is_featured: true,
    created_at: '2026-05-10',
  },
  {
    id: 4,
    title: 'Republic Day CSR Drive',
    description:
      "Our annual community outreach programme — distributing essential building materials and toolkits to families rebuilding homes affected by last year's monsoon floods, in association with local panchayats.",
    organizer: 'Kavalakat Foundation',
    organizer_logo: '/assets/new-images/clints/1 (1).jpg',
    organizer_logo_url: '',
    venue: 'Chalakudy Panchayat Grounds',
    location: 'Thrissur, Kerala',
    event_date: '2026-01-26',
    event_time: '8:00 AM - 12:00 PM',
    tag: 'CSR',
    image: '/assets/new-images/projects/project-4.jpg',
    image_url: '',
    images: [
      '/assets/new-images/projects/project-4.jpg',
      '/assets/new-images/projects/project-6.jpg',
      '/assets/new-images/projects/project-2.jpg',
    ],
    registration_url: '/contact',
    is_featured: false,
    created_at: '2025-12-15',
  },
  {
    id: 5,
    title: 'New Product Launch: EcoBlend Cement',
    description:
      'The unveiling of our new low-carbon EcoBlend cement range, featuring live demonstrations, technical specification sessions and a Q&A with our materials engineering team.',
    organizer: 'Kavalakat Group',
    organizer_logo: '/assets/new-images/clints/1 (1).jpg',
    organizer_logo_url: '',
    venue: 'Kavalakat Head Office Auditorium',
    location: 'Palakkad, Kerala',
    event_date: '2026-09-05',
    event_time: '11:00 AM - 2:00 PM',
    tag: 'Product Launch',
    image: '/assets/new-images/projects/project-5.jpg',
    image_url: '',
    images: [
      '/assets/new-images/projects/project-5.jpg',
      '/assets/new-images/projects/project-1.jpg',
      '/assets/new-images/projects/project-3.jpg',
    ],
    registration_url: '/contact',
    is_featured: false,
    created_at: '2026-06-05',
  },
  {
    id: 6,
    title: 'Annual Dealers Conference 2025',
    description:
      'A retrospective of an outstanding year — our annual conference brought together over 150 dealers from across Kerala for award presentations, strategy sessions and a celebratory dinner.',
    organizer: 'Kavalakat Group',
    organizer_logo: '/assets/new-images/clints/1 (1).jpg',
    organizer_logo_url: '',
    venue: 'Lulu Convention Centre',
    location: 'Kochi, Kerala',
    event_date: '2025-11-18',
    event_time: '4:00 PM onwards',
    tag: 'Conference',
    image: '/assets/new-images/projects/project-6.jpg',
    image_url: '',
    images: [
      '/assets/new-images/projects/project-6.jpg',
      '/assets/new-images/projects/project-2.jpg',
      '/assets/new-images/projects/project-4.jpg',
    ],
    registration_url: '/contact',
    is_featured: false,
    created_at: '2025-11-01',
  },
]

// ─── Date helpers ───────────────────────────────────────────────────────────
function getDateParts(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return { day: '--', month: '---' }
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  }
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isUpcoming(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d.getTime() >= today.getTime()
}

function sortEvents(items: EventItem[]) {
  const out = [...items]
  out.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    const aUp = isUpcoming(a.event_date)
    const bUp = isUpcoming(b.event_date)
    if (aUp !== bUp) return aUp ? -1 : 1
    return new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  })
  return out
}

// ─── Image Carousel ─────────────────────────────────────────────────────────
function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const [srcMap, setSrcMap] = useState<Record<number, string>>({})

  useEffect(() => { setActive(0) }, [images])

  const total = images.length
  const goTo = (idx: number) => setActive(((idx % total) + total) % total)

  const getSrc = (idx: number) => srcMap[idx] || images[idx] || FALLBACK_IMAGE
  const onErr = (idx: number) => setSrcMap((m) => ({ ...m, [idx]: FALLBACK_IMAGE }))

  return (
    <div className="esc-carousel">
      <div className="esc-carousel-main">
        <Image
          key={active}
          src={getSrc(active)}
          alt={`${alt} — image ${active + 1}`}
          fill
          style={{ objectFit: 'cover' }}
          onError={() => onErr(active)}
        />

        {total > 1 && (
          <>
            <button
              type="button"
              className="esc-carousel-nav esc-carousel-prev"
              aria-label="Previous image"
              onClick={() => goTo(active - 1)}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className="esc-carousel-nav esc-carousel-next"
              aria-label="Next image"
              onClick={() => goTo(active + 1)}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className="esc-carousel-counter">{active + 1} / {total}</div>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="esc-carousel-dots">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`esc-carousel-dot ${idx === active ? 'is-active' : ''}`}
              aria-label={`Go to image ${idx + 1}`}
              onClick={() => goTo(idx)}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="esc-carousel-thumbs">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              className={`esc-carousel-thumb ${idx === active ? 'is-active' : ''}`}
              aria-label={`View image ${idx + 1}`}
              onClick={() => goTo(idx)}
            >
              <Image
                src={srcMap[idx] || src || FALLBACK_IMAGE}
                alt={`${alt} thumbnail ${idx + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                onError={() => setSrcMap((m) => ({ ...m, [idx]: FALLBACK_IMAGE }))}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Event Modal  (left: carousel  |  right: content) ──────────────────────
function EventModal({ event: e, onClose }: { event: EventItem; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const venue = e.venue || e.location || ''
  const upcoming = isUpcoming(e.event_date)
  const fullDate = formatFullDate(e.event_date)

  const images =
    e.images && e.images.length > 0
      ? e.images
      : [e.image_url || e.image || FALLBACK_IMAGE]

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="esc-modal-overlay"
      ref={overlayRef}
      onClick={(ev) => { if (ev.target === overlayRef.current) onClose() }}
    >
      <div className="esc-modal">
        {/* Close button */}
        <button type="button" className="esc-modal-close" aria-label="Close" onClick={onClose}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* ── Two-column layout ── */}
        <div className="esc-modal-inner">

          {/* LEFT — Carousel */}
          <div className="esc-modal-left">
            <ImageCarousel images={images} alt={e.title} />
          </div>

          {/* RIGHT — Content */}
          <div className="esc-modal-right">
            <div className="esc-modal-tags">
              {e.tag && <span className="esc-badge esc-badge-static">{e.tag}</span>}
              <span className={`esc-status esc-status-static ${upcoming ? 'is-upcoming' : 'is-past'}`}>
                {upcoming ? 'Upcoming' : 'Past Event'}
              </span>
            </div>

            <h3 className="esc-modal-title">{e.title}</h3>

            <div className="esc-modal-meta">
              {fullDate && (
                <span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {fullDate}
                </span>
              )}
              {e.event_time && (
                <span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {e.event_time}
                </span>
              )}
              {venue && (
                <span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {venue}
                </span>
              )}
              {e.organizer && (
                <span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {e.organizer}
                </span>
              )}
            </div>

            <p className="esc-modal-desc">{e.description}</p>

            <div className="esc-modal-actions">
              <button type="button" className="esc-link esc-link-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EventCard ───────────────────────────────────────────────────────────────
function EventCard({
  event: e,
  index: i,
  onView,
}: {
  event: EventItem
  index: number
  onView: (event: EventItem) => void
}) {
  const [imgSrc,  setImgSrc]  = useState<string>(e.image_url || e.image || FALLBACK_IMAGE)
  const [logoSrc, setLogoSrc] = useState<string>(e.organizer_logo_url || e.organizer_logo || FALLBACK_LOGO)

  const venue = e.venue || e.location || ''
  const { day, month } = getDateParts(e.event_date)
  const upcoming = isUpcoming(e.event_date)

  return (
    <div
      className="esc-card wow animate fadeInUp"
      data-wow-delay={`${200 + (i % 3) * 100}ms`}
      data-wow-duration="1500ms"
    >
      <button type="button" className="esc-img-wrap esc-img-btn" onClick={() => onView(e)} aria-label={`View details for ${e.title}`}>
        <Image
          width={600}
          height={380}
          src={imgSrc}
          alt={e.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />

        <div className="esc-date">
          <span className="esc-date-day">{day}</span>
          <span className="esc-date-month">{month}</span>
        </div>

        {e.tag && <span className="esc-badge">{e.tag}</span>}

        <span className={`esc-status ${upcoming ? 'is-upcoming' : 'is-past'}`}>
          {upcoming ? 'Upcoming' : 'Past Event'}
        </span>

        <div className="esc-arr">
          <svg width={13} height={13} viewBox="0 0 35 35">
            <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z"/>
            <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z"/>
          </svg>
        </div>
      </button>

      <div className="esc-body">
        <div className="esc-organizer">
          <div className="esc-logo">
            <Image
              width={42}
              height={42}
              src={logoSrc}
              alt={e.organizer || e.title}
              onError={() => setLogoSrc(FALLBACK_LOGO)}
            />
          </div>
          <div className="esc-organizer-info">
            <h5>{e.organizer || e.title}</h5>
            <div className="esc-meta-row">
              {venue && (
                <span>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {venue}
                </span>
              )}
              {e.event_time && (
                <span>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  {e.event_time}
                </span>
              )}
            </div>
          </div>
        </div>

        <h4 className="esc-title">{e.title}</h4>
        <p>{e.description}</p>

        <div className="esc-card-actions">
          <button type="button" className="esc-link" onClick={() => onView(e)}>
            View Details
            <svg width={12} height={12} viewBox="0 0 35 35">
              <path d="M0.173267 0H34.9999V6.51953L6.58414 34.9996L0 28.4801L19.4059 9.2646L0.173267 9.43616V0Z"/>
              <path d="M34.999 34.9996V13.0391L25.6426 22.3037V34.9996H34.999Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const Page = () => {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/events/`)
      // On any non-ok response (404, 500, etc.) silently fall back to
      // sample data — no throw, so no console error overlay in Next.js.
      if (!res.ok) {
        setEvents(sortEvents(DUMMY_EVENTS))
        return
      }
      const raw: EventsApiResponse = await res.json()
      const items = extractEvents(raw)
      const finalItems = items.length > 0 ? items : DUMMY_EVENTS
      setEvents(sortEvents(finalItems))
    } catch {
      // Network-level failure (offline, CORS, etc.) — also silent fallback.
      setEvents(sortEvents(DUMMY_EVENTS))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // ── Build filter tabs (All + each unique tag) with live counts ──
  const filters = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach((e) => {
      const tag = (e.tag || '').trim()
      if (!tag) return
      counts[tag] = (counts[tag] || 0) + 1
    })

    const tagList = Object.keys(counts).sort((a, b) => counts[b] - counts[a])

    return [
      { label: 'All', count: events.length },
      ...tagList.map((tag) => ({ label: tag, count: counts[tag] })),
    ]
  }, [events])

  // ── Filtered events based on active tab ──
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'All') return events
    return events.filter((e) => (e.tag || '').trim() === activeFilter)
  }, [events, activeFilter])

  // Reset to "All" if the currently active filter no longer exists
  useEffect(() => {
    if (activeFilter === 'All') return
    const exists = filters.some((f) => f.label === activeFilter)
    if (!exists) setActiveFilter('All')
  }, [filters, activeFilter])

  return (
    <>
      <InnerPageHeader />
      <Breadcrumb
        title="Our Events"
        subtitle="Bringing Kerala's Construction Community Together — Expos, Workshops & Industry Meets."
        image="/assets/new-images/new-images/about-imges/projects.webp"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .esc-page {
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

        .esc-section { font-family: var(--font-dmsans); background: var(--bg-light); padding: 100px 0 120px; }

        .esc-hdr { text-align: center; margin-bottom: 64px; }
        .esc-hdr h2 {
          font-family: var(--font-manrope); font-size: clamp(30px, 4vw, 50px);
          font-weight: 800; color: var(--dark-title-color); line-height: 1.1;
          margin: 0 0 16px; letter-spacing: -0.025em;
        }
        .esc-hdr h2 span { color: var(--title-color2); }
        .esc-hdr p { font-size: 15px; color: var(--text-color); max-width: 560px; margin: 0 auto; line-height: 1.76; }

        /* ══════════════════════════════════════════════════════
           FILTER TABS  (All / Service / Trading / Distribution style)
        ══════════════════════════════════════════════════════ */
        .esc-filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          margin-bottom: 48px;
          padding-bottom: 28px;
          border-bottom: 1px solid var(--borders-color);
        }

        .esc-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-manrope);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--dark-title-color);
          background: #fff;
          border: 1px solid var(--borders-color);
          border-radius: 100px;
          padding: 12px 22px;
          cursor: pointer;
          transition: background 0.25s, color 0.25s, border-color 0.25s, transform 0.2s;
        }
        .esc-filter-btn:hover {
          border-color: var(--primary-color1);
          color: var(--primary-color1);
          transform: translateY(-1px);
        }
        .esc-filter-btn.is-active {
          background: var(--dark-title-color);
          border-color: var(--dark-title-color);
          color: #fff;
        }
        .esc-filter-btn.is-active:hover {
          color: #fff;
          transform: none;
        }

        .esc-filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 6px;
          border-radius: 50%;
          background: #eef0f3;
          color: var(--dark-title-color);
          font-family: var(--font-manrope);
          font-size: 11px;
          font-weight: 700;
        }
        .esc-filter-btn.is-active .esc-filter-count {
          background: rgba(255,255,255,0.18);
          color: #fff;
        }

        .esc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }

        .esc-card {
          background: #fff; overflow: hidden;
          box-shadow: 0 4px 24px rgba(1,96,178,0.1), 0 1px 4px rgba(0,0,0,0.04);
          transition: transform 0.38s cubic-bezier(0.16,1,0.3,1), box-shadow 0.38s;
          display: flex; flex-direction: column;
        }
        .esc-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(1,96,178,0.18), 0 4px 12px rgba(0,0,0,0.07);
        }

        .esc-img-wrap { position: relative; overflow: hidden; aspect-ratio: 16 / 10; }
        .esc-img-btn {
          display: block; width: 100%; padding: 0; border: none; background: none;
          cursor: pointer; text-align: left;
        }
        .esc-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s ease; }
        .esc-card:hover .esc-img-wrap img { transform: scale(1.06); }
        .esc-img-wrap::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(1,96,178,0.58) 0%, transparent 55%);
          opacity: 0.5; transition: opacity 0.38s; pointer-events: none;
        }
        .esc-card:hover .esc-img-wrap::after { opacity: 0.78; }

        .esc-date {
          position: absolute; top: 14px; left: 14px; z-index: 2;
          background: #fff; border-radius: 10px; padding: 6px 12px;
          display: flex; flex-direction: column; align-items: center; line-height: 1.1;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          min-width: 50px;
        }
        .esc-date-day {
          font-family: var(--font-manrope); font-size: 18px; font-weight: 800;
          color: var(--dark-title-color);
        }
        .esc-date-month {
          font-family: var(--font-manrope); font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; color: var(--primary-color1); margin-top: 2px;
        }

        .esc-badge {
          position: absolute; top: 14px; right: 14px; z-index: 2;
          font-family: var(--font-manrope); font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #fff;
          background: var(--primary-color1); padding: 5px 13px; border-radius: 100px;
          box-shadow: 0 3px 12px rgba(1,96,178,0.4);
        }

        .esc-status {
          position: absolute; bottom: 14px; left: 14px; z-index: 2;
          font-family: var(--font-manrope); font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 100px; color: #fff;
        }
        .esc-status.is-upcoming { background: #1fa14d; }
        .esc-status.is-past { background: rgba(0,0,0,0.45); }

        .esc-arr {
          position: absolute; bottom: 14px; right: 14px; z-index: 2;
          width: 38px; height: 38px; background: #fff; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: translateY(8px) scale(0.85);
          transition: opacity 0.28s, transform 0.28s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .esc-card:hover .esc-arr { opacity: 1; transform: translateY(0) scale(1); }
        .esc-arr svg { fill: var(--primary-color1); }

        .esc-body { padding: 20px 22px 22px; display: flex; flex-direction: column; flex: 1; }

        .esc-organizer {
          display: flex; align-items: center; gap: 11px;
          margin-bottom: 12px; padding-bottom: 12px;
          border-bottom: 1px solid var(--borders-color);
        }
        .esc-logo {
          width: 42px; height: 42px; border-radius: 9px;
          border: 1px solid var(--borders-color); background: #f5f5f5;
          flex-shrink: 0; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .esc-logo img { width: 100%; height: 100%; object-fit: contain; }
        .esc-organizer-info h5 {
          font-family: var(--font-manrope); font-size: 13.5px; font-weight: 700;
          color: var(--dark-title-color); margin: 0 0 2px; line-height: 1.3;
        }
        .esc-meta-row { display: flex; flex-wrap: wrap; gap: 10px; }
        .esc-meta-row span { font-size: 12px; color: var(--text-color); display: flex; align-items: center; gap: 4px; }

        .esc-title {
          font-family: var(--font-manrope); font-size: 16px; font-weight: 700;
          color: var(--dark-title-color); margin: 0 0 8px; line-height: 1.35;
        }

        .esc-body p { font-size: 14px; line-height: 1.72; color: var(--text-color); margin: 0 0 16px; flex: 1; }

        .esc-card-actions { display: flex; align-items: center; gap: 12px; }

        .esc-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-manrope); font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--primary-color1); text-decoration: none; transition: gap 0.2s, background 0.2s, color 0.2s;
          background: none; border: none; padding: 0; cursor: pointer;
        }
        .esc-link:hover { gap: 11px; }
        .esc-link svg { fill: var(--primary-color1); transition: transform 0.2s; }
        .esc-link:hover svg { transform: translate(2px,-2px); }

        .esc-link-ghost {
          color: var(--text-color); padding: 10px 22px; border-radius: 100px;
          border: 1px solid var(--borders-color); font-size: 11px;
        }
        .esc-link-ghost:hover { color: var(--dark-title-color); border-color: #ccc; }

        .esc-skeleton {
          background: linear-gradient(90deg, #e8edf2 25%, #f5f7fa 50%, #e8edf2 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 4px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* ── Empty filtered state ── */
        .esc-empty-filter {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; min-height: 200px; gap: 14px;
        }
        .esc-empty-filter p { font-size: 14px; color: var(--text-color); margin: 0; }
        .esc-empty-filter button {
          font-family: var(--font-manrope); font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #fff; background: var(--primary-color1); border: none;
          padding: 11px 26px; border-radius: 100px; cursor: pointer; transition: opacity 0.2s;
        }
        .esc-empty-filter button:hover { opacity: 0.85; }

        /* ══════════════════════════════════════════════════════
           MODAL  —  left carousel  |  right content
        ══════════════════════════════════════════════════════ */
        .esc-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(5px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: esc-fade-in 0.22s ease;
        }
        @keyframes esc-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .esc-modal {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          width: 100%;
          max-width: 960px;
          max-height: 90vh;
          position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.28);
          animation: esc-pop-in 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes esc-pop-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Two-column inner wrapper */
        .esc-modal-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 0;
          max-height: 90vh;
        }

        /* LEFT PANEL — carousel */
        .esc-modal-left {
          background: #0d1a2b;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          min-height: 0;
        }

        /* RIGHT PANEL — content */
        .esc-modal-right {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 32px 30px 30px;
          font-family: var(--font-dmsans);
        }

        .esc-modal-close {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.92); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--dark-title-color);
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
          transition: background 0.2s, transform 0.2s;
        }
        .esc-modal-close:hover { background: #fff; transform: scale(1.08); }

        .esc-modal-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
        .esc-badge-static, .esc-status-static {
          position: static !important;
          box-shadow: none;
        }

        .esc-modal-title {
          font-family: var(--font-manrope); font-size: clamp(18px, 2.2vw, 26px);
          font-weight: 800; color: var(--dark-title-color); line-height: 1.25;
          margin: 0 0 16px;
        }

        .esc-modal-meta {
          display: flex; flex-direction: column; gap: 9px;
          margin-bottom: 18px; padding-bottom: 18px;
          border-bottom: 1px solid var(--borders-color);
        }
        .esc-modal-meta span {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 13px; color: var(--text-color); line-height: 1.5;
        }
        .esc-modal-meta svg { color: var(--primary-color1); flex-shrink: 0; margin-top: 1px; }

        .esc-modal-desc {
          font-size: 14px; line-height: 1.85; color: var(--text-color);
          margin: 0 0 24px; flex: 1;
        }

        .esc-modal-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: auto; }

        /* ── Carousel inside modal ── */
        .esc-carousel { display: flex; flex-direction: column; height: 100%; }

        .esc-carousel-main {
          position: relative; width: 100%;
          flex: 1;
          min-height: 260px;
          background: #0d1a2b; overflow: hidden;
        }
        .esc-carousel-main img { object-fit: cover; }

        .esc-carousel-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.85); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--dark-title-color);
          transition: background 0.2s, transform 0.2s;
          z-index: 3;
        }
        .esc-carousel-nav:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
        .esc-carousel-prev { left: 12px; }
        .esc-carousel-next { right: 12px; }

        .esc-carousel-counter {
          position: absolute; bottom: 12px; right: 12px; z-index: 3;
          background: rgba(0,0,0,0.5); color: #fff;
          font-family: var(--font-manrope); font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 100px; letter-spacing: 0.05em;
        }

        .esc-carousel-dots {
          display: none; /* hidden when thumbs are visible */
        }

        /* Thumbnail strip */
        .esc-carousel-thumbs {
          display: flex; gap: 6px; padding: 10px 12px;
          background: #0d1a2b; overflow-x: auto;
          scrollbar-width: none;
        }
        .esc-carousel-thumbs::-webkit-scrollbar { display: none; }

        .esc-carousel-thumb {
          position: relative; flex-shrink: 0;
          width: 58px; height: 42px; border-radius: 6px; overflow: hidden;
          border: 2px solid transparent; cursor: pointer; padding: 0;
          background: #1a2d42; transition: border-color 0.2s, transform 0.2s;
        }
        .esc-carousel-thumb.is-active { border-color: #fff; transform: scale(1.05); }
        .esc-carousel-thumb img { object-fit: cover; }

        /* ═══ RESPONSIVE ════════════════════════════════════════════════════ */

        /* Tablet: 2 cols grid stays, modal stacks */
        @media (max-width: 1100px) {
          .esc-grid { grid-template-columns: repeat(2, 1fr); }
          .esc-modal { max-width: 740px; }
        }

        /* Phablet: modal flips to single column */
        @media (max-width: 760px) {
          .esc-modal-inner {
            grid-template-columns: 1fr;
            max-height: 90vh;
            overflow-y: auto;
          }
          .esc-modal-left {
            height: 260px;
            flex-shrink: 0;
          }
          .esc-carousel { height: 100%; }
          .esc-carousel-main { flex: 1; min-height: 0; height: 100%; }
          .esc-carousel-thumbs { padding: 8px 10px; }
          .esc-carousel-thumb { width: 48px; height: 36px; }
          .esc-modal-right { padding: 22px 20px 24px; overflow-y: visible; }
          .esc-modal { border-radius: 14px; max-height: 92vh; overflow-y: auto; }
        }

        /* Mobile: single column card grid */
        @media (max-width: 640px) {
          .esc-grid { grid-template-columns: 1fr; }
          .esc-section { padding: 70px 0 80px; }
          .esc-hdr { margin-bottom: 50px; }
          .esc-filters { gap: 10px; margin-bottom: 32px; padding-bottom: 22px; }
          .esc-filter-btn { padding: 10px 16px; font-size: 11px; }
          .esc-filter-count { min-width: 20px; height: 20px; font-size: 10px; }
          .esc-modal { border-radius: 12px; max-height: 94vh; }
          .esc-modal-overlay { padding: 12px; }
          .esc-modal-left { height: 220px; }
          .esc-modal-title { font-size: 18px; }
        }

        /* Very small screens */
        @media (max-width: 400px) {
          .esc-modal-left { height: 190px; }
          .esc-modal-right { padding: 16px 16px 20px; }
          .esc-carousel-thumb { width: 40px; height: 30px; }
        }
      `}</style>

      {/* ── Events Section ── */}
      <section className="esc-section esc-page" id="scroll-section">
        <div className="container">

          {/* Header */}
          <div className="esc-hdr wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
            <h2>Events That <span>Bring Us Together</span></h2>
            <p>
              From industry expos to on-site workshops — explore the events
              where Kavalakat connects with builders, partners and the
              communities we serve across Kerala.
            </p>
          </div>

          {/* ── Category Filter Tabs ── */}
          {!loading && !error && events.length > 0 && filters.length > 1 && (
            <div className="esc-filters" role="tablist" aria-label="Filter events by category">
              {filters.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === f.label}
                  className={`esc-filter-btn ${activeFilter === f.label ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(f.label)}
                >
                  {f.label}
                  <span className="esc-filter-count">{f.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Loading skeletons ── */}
          {loading && (
            <div className="esc-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="esc-card" key={i}>
                  <div className="esc-skeleton" style={{ aspectRatio: '16/10' }} />
                  <div className="esc-body" style={{ gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                      <div className="esc-skeleton" style={{ width: 42, height: 42, borderRadius: 9, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="esc-skeleton" style={{ height: 14, marginBottom: 6 }} />
                        <div className="esc-skeleton" style={{ height: 11, width: '60%' }} />
                      </div>
                    </div>
                    <div className="esc-skeleton" style={{ height: 14, marginBottom: 8, width: '85%' }} />
                    <div className="esc-skeleton" style={{ height: 11, marginBottom: 5 }} />
                    <div className="esc-skeleton" style={{ height: 11, marginBottom: 5 }} />
                    <div className="esc-skeleton" style={{ height: 11, width: '75%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 240 }}>
              <p className="text-danger mb-3">{error}</p>
              <button className="btn btn-outline-secondary" onClick={fetchEvents}>Try Again</button>
            </div>
          )}

          {/* ── Empty (no events at all) ── */}
          {!loading && !error && events.length === 0 && (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 240 }}>
              <p className="text-muted">No events available.</p>
            </div>
          )}

          {/* ── Empty (filter has no matches) ── */}
          {!loading && !error && events.length > 0 && filteredEvents.length === 0 && (
            <div className="esc-empty-filter">
              <p>No events found in &ldquo;{activeFilter}&rdquo;.</p>
              <button type="button" onClick={() => setActiveFilter('All')}>View All Events</button>
            </div>
          )}

          {/* ── Grid ── */}
          {!loading && !error && filteredEvents.length > 0 && (
            <div className="esc-grid">
              {filteredEvents.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} onView={setActiveEvent} />
              ))}
            </div>
          )}

        </div>
      </section>

      {activeEvent && (
        <EventModal event={activeEvent} onClose={() => setActiveEvent(null)} />
      )}

      <HomepageBlogSection />
      <FooterTop />
      <Footer1 />
    </>
  )
}

export default Page