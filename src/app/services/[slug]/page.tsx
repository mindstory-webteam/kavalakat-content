"use client"
import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'
import { useParams } from 'next/navigation'

/* ─────────────────────────────────────────────────
   API TYPES  (matches real /api/services/{id}/ response)
───────────────────────────────────────────────── */
interface CategoryDetail {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  color: string
  order: number
  is_active: boolean
  service_count: number
}

interface ServiceOffer {
  id: number
  service: number
  offer_title: string
  offer_icon: string
  short_description: string
  order: number
  is_active: boolean
}

interface ServiceFeature {
  id: number
  section: number
  feature_title: string
  feature_description: string
  order: number
}

interface ServiceFeatureSection {
  id: number
  service: number
  section_title: string
  left_main_image: string | null
  left_main_image_url: string | null
  main_description: string
  features: ServiceFeature[]
  updated_at: string
}

interface ServiceCounter {
  id: number
  service: number
  counter_title: string
  counter_number: string
  short_description: string
  icon: string
  order: number
  is_active: boolean
}

interface ServiceHighlight {
  id: number
  service?: number
  section_title?: string
  section_sub_title?: string
  highlight_title: string
  highlight_description: string
  highlight_video?: string | null
  highlight_video_url?: string | null
  poster?: string | null
  poster_url?: string | null
  display_order: number
  is_active?: boolean
}

interface NearbyPlace {
  id: number
  location: number
  nearby_place_name: string
  distance: string
  map_link?: string
  order?: number
}

interface ServiceLocation {
  id: number
  service: number
  location_main_title: string
  location_main_sub_title: string
  location_main_description: string
  left_main_image: string | null
  left_main_image_url: string | null
  nearby_places: NearbyPlace[]
  updated_at?: string
}

/**
 * Real about shape from /api/services/{id}/:
 * { left_side_image, left_side_image_url,
 *   gallery_image_1, gallery_image_1_url,
 *   gallery_image_2, gallery_image_2_url,
 *   gallery_image_3, gallery_image_3_url,
 *   main_title, sub_title, description, button_text, button_link }
 */
interface ServiceAbout {
  id: number
  service: number
  main_title?: string
  sub_title?: string
  description: string
  left_side_image: string | null
  left_side_image_url: string | null
  gallery_image_1?: string | null
  gallery_image_1_url?: string | null
  gallery_image_2?: string | null
  gallery_image_2_url?: string | null
  gallery_image_3?: string | null
  gallery_image_3_url?: string | null
  button_text?: string
  button_link?: string
  updated_at?: string
}

interface ServiceData {
  id: number
  name: string
  slug: string
  category: number
  category_detail: CategoryDetail
  description: string
  icon: string
  image: string | null
  image_url: string | null
  is_active: boolean
  is_featured: boolean
  order: number
  created_at: string
  about: ServiceAbout | null
  counters: ServiceCounter[]
  offers: ServiceOffer[]
  feature_section: ServiceFeatureSection | null
  highlights: ServiceHighlight[]
  location: ServiceLocation | null
}

/* List-item shape from /api/services/ */
interface ServiceListItem {
  id: number
  name: string
  slug?: string
  description: string
  image: string | null
  image_url: string | null
  category_name?: string
  category_slug?: string
  is_active: boolean
  order: number
}

/* ─────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────── */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.kavalakat.com/api').replace(/\/$/, '')

const FALLBACK_ICONS = ['🛋️', '🍽️', '📶', '🅿️', '🏢', '🔒', '🌿', '⚡', '🎯', '🏆']

const STATIC_FALLBACK_IMAGES = {
  hero: '/assets/new-images/bm/bm-Alite-Enclaves.png',
  gallery1: '/assets/new-images/products/p-2.jpeg',
  gallery2: '/assets/new-images/products/p-3.jpeg',
  about: '/assets/new-images/new-images/about-imges/img-1.webp',
}

/* ─────────────────────────────────────────────────
   SLUG HELPERS
───────────────────────────────────────────────── */
function nameToSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function slugMatches(item: ServiceListItem, slug: string) {
  return (
    item.slug === slug ||
    item.slug?.replace(/_/g, '-') === slug ||
    nameToSlug(item.name) === slug
  )
}

/* ─────────────────────────────────────────────────
   FETCH  — envelope-aware, slug → id → detail
───────────────────────────────────────────────── */
function unwrapEnvelope<T>(json: unknown): T | null {
  if (!json || typeof json !== 'object') return null
  const obj = json as Record<string, unknown>
  // { success, data: {...} }
  if ('data' in obj && obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return obj.data as T
  }
  // bare object
  if ('id' in obj) return obj as unknown as T
  return null
}

function extractListFromEnvelope(json: unknown): ServiceListItem[] {
  if (!json || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>

  // { success, data: [...] }
  if ('data' in obj && Array.isArray(obj.data)) return obj.data as ServiceListItem[]
  // { results: [...] }
  if ('results' in obj && Array.isArray(obj.results)) return obj.results as ServiceListItem[]
  // bare array
  if (Array.isArray(json)) return json as ServiceListItem[]
  return []
}

async function safeFetch(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchServiceBySlug(slug: string): Promise<ServiceData | null> {
  // 1️⃣ Try direct slug-based detail endpoint
  const directJson = await safeFetch(`${API_BASE}/services/${slug}/`)
  const directData = unwrapEnvelope<ServiceData>(directJson)
  if (directData?.id) return directData

  // 2️⃣ Fetch list, find matching item by slug
  const listJson = await safeFetch(`${API_BASE}/services/`)
  const items = extractListFromEnvelope(listJson)
  const match = items.find((item) => slugMatches(item, slug))
  if (!match) return null

  // 3️⃣ Fetch detail by numeric id
  const detailJson = await safeFetch(`${API_BASE}/services/${match.id}/`)
  return unwrapEnvelope<ServiceData>(detailJson)
}

/* ─────────────────────────────────────────────────
   ABOUT IMAGE HELPERS
───────────────────────────────────────────────── */
function getAboutGalleryImages(about: ServiceAbout | null): string[] {
  if (!about) return [STATIC_FALLBACK_IMAGES.gallery1, STATIC_FALLBACK_IMAGES.gallery2]
  const candidates = [
    about.gallery_image_1_url ?? about.gallery_image_1,
    about.gallery_image_2_url ?? about.gallery_image_2,
    about.gallery_image_3_url ?? about.gallery_image_3,
  ].filter((s): s is string => !!s && s.trim().length > 0)
  return candidates.length > 0 ? candidates : [STATIC_FALLBACK_IMAGES.gallery1, STATIC_FALLBACK_IMAGES.gallery2]
}

/* ─────────────────────────────────────────────────
   COUNT-UP HOOK
───────────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    if (!shouldStart) return

    let cancelled = false
    let startTime: number | null = null

    const step = (timestamp: number) => {
      if (cancelled) return
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }

    requestAnimationFrame(step)
    return () => { cancelled = true }
  }, [target, duration, shouldStart])

  return count
}

/* ─────────────────────────────────────────────────
   STAT ITEM
───────────────────────────────────────────────── */
function StatItem({ number, suffix, label, delay, shouldStart }: {
  number: number
  suffix: string
  label: string
  delay: number
  shouldStart: boolean
}) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(false)
    if (!shouldStart) return
    const t = setTimeout(() => setActive(true), delay)
    return () => clearTimeout(t)
  }, [shouldStart, delay, number])

  const count = useCountUp(number, 2000, active)

  return (
    <div className="alite-stat-item">
      <h3 className="alite-stat-number">{count}{suffix}</h3>
      <p className="alite-stat-label">{label}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────── */
const AliteEnclavesPage = () => {
  const params = useParams()
  const slug = params?.slug as string

  /* ── API State ── */
  const [serviceData, setServiceData] = useState<ServiceData | null>(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  /* ── UI State ── */
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)
  const [activeVideo, setActiveVideo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [statsVisible, setStatsVisible] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  /* ── Fetch ── */
  useEffect(() => {
    if (!slug) return
    setApiLoading(true)
    setApiError(null)

    fetchServiceBySlug(slug)
      .then((data) => {
        if (data) setServiceData(data)
        else setApiError(`No service found for slug: "${slug}"`)
      })
      .catch((err: unknown) => {
        setApiError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => setApiLoading(false))
  }, [slug])

  /* ─────────────────────────────────────────────────
     DERIVED DATA
  ───────────────────────────────────────────────── */
  const offers         = serviceData?.offers                                    ?? []
  const counters       = (serviceData?.counters ?? []).filter((c) => c.is_active)
  const featureSection = serviceData?.feature_section                           ?? null
  const features       = featureSection?.features                               ?? []
  const highlights     = serviceData?.highlights                                ?? []
  const location       = serviceData?.location                                  ?? null
  const nearbyPlaces   = location?.nearby_places                                ?? []
  const galleryImages  = getAboutGalleryImages(serviceData?.about ?? null)

  /* ─── Videos ─── */
  const STATIC_VIDEOS = [
    {
      src: '/assets/video/home5-video.mp4',
      poster: STATIC_FALLBACK_IMAGES.about,
      title: 'Welcome to Alite Enclaves',
      tag: 'Property Tour',
      desc: 'Take a full walkthrough of our premium service apartments, villas, and common areas.',
    },
    {
      src: '/assets/video/metal-industry.mp4',
      poster: STATIC_FALLBACK_IMAGES.about,
      title: 'Our Premium Room Experience',
      tag: 'Room Tour',
      desc: 'Explore our fully air-conditioned premium rooms with modern furnishings.',
    },
  ]

  const apiVideos = highlights
    .filter((h) => !!(h.highlight_video_url || h.highlight_video))
    .map((h) => ({
      src: (h.highlight_video_url ?? h.highlight_video ?? '') as string,
      poster: (h.poster_url ?? h.poster ?? serviceData?.image_url ?? STATIC_FALLBACK_IMAGES.hero) as string,
      title: h.highlight_title,
      tag: h.section_title ?? 'Highlight',
      desc: h.highlight_description ?? '',
    }))

  const videos = apiVideos.length > 0 ? apiVideos : STATIC_VIDEOS

  /* ─── Testimonials (static) ─── */
  const testimonials = [
    {
      quote: 'Perfect Stay for Business Travel!',
      text: 'Alite Enclaves gave us the comfort of home while on a long project assignment in Thrissur.',
      author: 'Rohit Sharma',
      role: 'Project Manager, Kochi',
      img: '/assets/new-images/icon-person/5856.jpg',
    },
    {
      quote: 'Best Service Apartments in Thrissur',
      text: 'Stayed here for a week with family during the Thrissur Pooram festival. Excellent location.',
      author: 'Anitha Nair',
      role: 'Family Traveller, Bangalore',
      img: '/assets/new-images/icon-person/5856.jpg',
    },
    {
      quote: 'Highly Recommended for Long Stays',
      text: 'The fully furnished apartment with kitchen facilities made our two-week stay very comfortable.',
      author: 'James Mathew',
      role: 'Corporate Guest, Chennai',
      img: '/assets/new-images/icon-person/5856.jpg',
    },
  ]

  /* ─── Amenities ─── */
  const amenities = offers.length > 0
    ? offers.map((o, i) => ({
        icon: o.offer_icon
          ? <img src={o.offer_icon} alt="" style={{ width: 32, height: 32, objectFit: 'contain' as const }} />
          : FALLBACK_ICONS[i % FALLBACK_ICONS.length],
        title: o.offer_title,
        desc: o.short_description,
      }))
    : [
        { icon: '🛋️', title: 'Fully Furnished Apartments', desc: 'Spacious 1 BHK, 2 BHK, and 4 BHK villas with premium furnishings.' },
        { icon: '🍽️', title: 'Private Kitchenettes', desc: 'Fully equipped kitchens with cooking essentials and dining area.' },
        { icon: '📶', title: 'High-Speed Wi-Fi', desc: 'Complimentary high-speed internet across all rooms and common areas.' },
        { icon: '🅿️', title: 'Dedicated Parking', desc: 'Secure private parking with 24-hour CCTV surveillance.' },
        { icon: '🏢', title: 'Mini Meeting Hall', desc: 'Well-equipped meeting room for small business gatherings.' },
        { icon: '🔒', title: '24/7 Security', desc: 'Round-the-clock security staff and CCTV monitoring.' },
      ]

  /* ─── Accordion items ─── */
  const accordionItems = features.length > 0
    ? features.map((f) => ({ id: `f${f.id}`, title: f.feature_title, content: f.feature_description || '—' }))
    : highlights.length > 0
      ? highlights.map((h) => ({ id: `h${h.id}`, title: h.highlight_title, content: h.highlight_description || '—' }))
      : [
          { id: 'a1', title: 'Service Apartments (1 BHK & 2 BHK)', content: 'Fully furnished apartments with separate living and sleeping areas, private kitchenette, and balcony.' },
          { id: 'a2', title: 'Premium Rooms', content: 'Air-conditioned rooms with modern furnishings and en-suite bathrooms.' },
          { id: 'a3', title: 'Villas (4 BHK)', content: 'Expansive 4 BHK villas for large families and extended stays.' },
          { id: 'a4', title: 'Mini Meeting Hall', content: 'Business gatherings, training sessions, and conferences with AV support.' },
        ]

  /* ─── Location items ─── */
  const locationItems = nearbyPlaces.length > 0
    ? nearbyPlaces.map((p) => ({ place: p.nearby_place_name, dist: p.distance }))
    : [
        { place: 'Thrissur Railway Station', dist: '0.5 km' },
        { place: 'Sakthan Thampuran Bus Stand', dist: '0.8 km' },
        { place: 'Vadakkumnathan Temple', dist: '1.2 km' },
        { place: 'Thrissur City Centre', dist: '1.0 km' },
        { place: 'Major Hospitals & Clinics', dist: '1.5 km' },
        { place: 'Shopping Malls & Markets', dist: '1.8 km' },
      ]

  /* ─── Stats: parse "200+" → { number: 200, suffix: "+" } ─── */
  const statItems = counters.length > 0
    ? counters.map((c, i) => {
        const raw = (c.counter_number ?? '').trim()
        const num = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0
        const suffix = raw.replace(/^\d+/, '')
        return { number: num, suffix, label: (c.counter_title ?? '').toUpperCase(), delay: i * 200 }
      })
    : [
        { number: 4,   suffix: '+',  label: 'ROOM CATEGORIES',   delay: 0   },
        { number: 100, suffix: '%',  label: 'GUEST SATISFACTION', delay: 200 },
        { number: 24,  suffix: '/7', label: 'FRONT DESK SUPPORT', delay: 400 },
        { number: 5,   suffix: '★',  label: 'GUEST EXPERIENCE',   delay: 600 },
      ]

  /* ─── Page meta ─── */
  const about = serviceData?.about ?? null

  const pageTitle           = serviceData?.name                                          ?? 'Alite Enclaves'
  // Breadcrumb subtitle: the top-level service Description field from the CMS edit page
  const pageSubtitle        = serviceData?.description ?? 'Premium Service Apartments in the Heart of Thrissur'
  // Breadcrumb / OG image: prefer service image, then about left_side_image
  const pageBreadcrumbImage = serviceData?.image_url
                           ?? about?.left_side_image_url
                           ?? about?.left_side_image
                           ?? STATIC_FALLBACK_IMAGES.about

  // Hero badge: about sub_title → category name → static fallback
  const heroCategory        = about?.sub_title || serviceData?.category_detail?.name    || 'Kavalakat Hospitality'
  // Hero heading: about main_title → service name → static fallback
  const heroTitle           = about?.main_title || serviceData?.name                    || 'Your Home Away from Home in Thrissur'
  // Hero description paragraphs: split about.description on blank line, or use service description
  const aboutDesc           = about?.description?.trim() ?? ''
  const descParagraphs      = aboutDesc
    ? aboutDesc.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : [serviceData?.description ?? 'Alite Enclaves is a premium hospitality venture by the Kavalakat Group.']
  const heroDesc1           = descParagraphs[0] ?? ''
  const heroDesc2           = descParagraphs[1] ?? ''   // empty string = don't render second <p>

  // Hero main image: about left_side_image → service image → static fallback
  const heroImage           = about?.left_side_image_url
                           ?? about?.left_side_image
                           ?? serviceData?.image_url
                           ?? STATIC_FALLBACK_IMAGES.hero

  const faqSectionTitle     = featureSection?.section_title                            ?? 'Room & Stay Options'
  const faqSectionDesc      = featureSection?.main_description                         ?? ''
  const faqSectionImage     = featureSection?.left_main_image_url                      ?? STATIC_FALLBACK_IMAGES.about
  const locationBadge       = location?.location_main_sub_title ?? location?.location_main_title ?? 'Thrissur City Centre'
  const locationImage       = location?.left_main_image_url                            ?? STATIC_FALLBACK_IMAGES.about
  const locationTitle       = location?.location_main_title                            ?? 'Perfectly Positioned in Thrissur'
  const locationDesc        = location?.location_main_description                      ?? 'Alite Enclaves enjoys a prime location in Thrissur city.'
  const heroBtnText         = about?.button_text?.trim() || 'Book Now'
  const heroBtnHref         = about?.button_link?.trim() || '/contact'

  /* ─────────────────────────────────────────────────
     INTERSECTION OBSERVER — stats counter
  ───────────────────────────────────────────────── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setStatsVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // Fallback: check if already in view when API data loads
  useEffect(() => {
    if (!serviceData || statsVisible || !statsRef.current) return
    const { top, bottom } = statsRef.current.getBoundingClientRect()
    if (top < window.innerHeight && bottom > 0) setStatsVisible(true)
  }, [serviceData, statsVisible])

  /* ─────────────────────────────────────────────────
     VIDEO CONTROLS
  ───────────────────────────────────────────────── */
  const formatTime = (secs: number): string => {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const switchVideo = useCallback((index: number) => {
    setActiveVideo(index)
    setCurrentTime(0)
    setProgress(0)
    setDuration(0)
    setIsPlaying(true)
  }, [])

  const handleVideoEnd    = useCallback(() => switchVideo((activeVideo + 1) % videos.length), [activeVideo, videos.length, switchVideo])
  const handleTimeUpdate  = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0)
  }, [])
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setIsPlaying(true) } else { v.pause(); setIsPlaying(false) }
  }
  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
  }
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.load()
    v.play().catch(() => setIsPlaying(false))
    setIsPlaying(true)
  }, [activeVideo])

  /* ─────────────────────────────────────────────────
     TESTIMONIAL SLIDER
  ───────────────────────────────────────────────── */
  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current)
    autoSlideRef.current = setInterval(() => setCurrentSlide((p) => (p + 1) % testimonials.length), 4000)
  }, [testimonials.length])

  const stopAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current)
  }, [])

  useEffect(() => { startAutoSlide(); return stopAutoSlide }, [startAutoSlide, stopAutoSlide])

  const nextSlide = () => { stopAutoSlide(); setCurrentSlide((p) => (p + 1) % testimonials.length); startAutoSlide() }
  const prevSlide = () => { stopAutoSlide(); setCurrentSlide((p) => (p - 1 + testimonials.length) % testimonials.length); startAutoSlide() }
  const goToSlide = (i: number) => { stopAutoSlide(); setCurrentSlide(i); startAutoSlide() }

  const toggleAccordion = (id: string) => setActiveAccordion(activeAccordion === id ? null : id)

  /* ─────────────────────────────────────────────────
     LOADING / ERROR STATES
  ───────────────────────────────────────────────── */
  if (apiLoading) return (
    <>
      <InnerPageHeader />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #e0e0e0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 16, color: '#888', fontSize: '0.9rem' }}>Loading…</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <FooterTop /><Footer1 />
    </>
  )

  if (apiError) return (
    <>
      <InnerPageHeader />
      <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#c00' }}>Failed to load service: {apiError}</p>
      </div>
      <FooterTop /><Footer1 />
    </>
  )

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <>
      <InnerPageHeader />
      <Breadcrumb title={pageTitle} subtitle={pageSubtitle} image={pageBreadcrumbImage} />

      {/* ── Section 1: Hero ── */}
      <div className="pt-120 mb-120">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-6 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="section-title mb-4">
                <span>{heroCategory}</span>
                <h2>{heroTitle}</h2>
              </div>
              {heroDesc1 && <p style={{ color: '#555', lineHeight: '1.85', marginBottom: '16px' }}>{heroDesc1}</p>}
              {heroDesc2 && <p style={{ color: '#555', lineHeight: '1.85', marginBottom: '32px' }}>{heroDesc2}</p>}
              <Link className="primary-btn1 black-bg" href={heroBtnHref}>
                <span>{heroBtnText}</span><span>{heroBtnText}</span>
                <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <g><path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" /><path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" /></g>
                </svg>
              </Link>
            </div>

            <div className="col-lg-6 wow animate fadeInRight" data-wow-delay="300ms" data-wow-duration="1500ms">
              <div className="alite-hero-img-grid">
                {/* Top: left_side_image */}
                <div className="alite-img-main">
                  <Image width={560} height={280} src={heroImage} alt={pageTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* Bottom: up to 3 gallery images */}
                {galleryImages.length > 0 && (
                  <div className="alite-img-row" style={{ gridTemplateColumns: `repeat(${Math.min(galleryImages.length, 3)}, 1fr)` }}>
                    {galleryImages.slice(0, 3).map((src, idx) => (
                      <div key={idx} className="alite-img-small">
                        <Image width={260} height={180} src={src} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Stats Bar ── */}
      <div className="alite-stats-bar mb-120" ref={statsRef}>
        <div className="container-fluid px-0">
          <div className="alite-stats-wrap">
            {statItems.map((s, i) => (
              <StatItem key={i} number={s.number} suffix={s.suffix} label={s.label} delay={s.delay} shouldStart={statsVisible} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Amenities ── */}
      <div className="mb-120">
        <div className="container">
          <div className="row mb-50">
            <div className="col-lg-7">
              <div className="section-title">
                <span>What We Offer</span>
                <h2>Amenities Designed for Your Comfort</h2>
              </div>
            </div>
          </div>
          <div className="row g-0">
            {amenities.map((item, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <div className="alite-amenity-card">
                  <div className="alite-amenity-icon">{item.icon}</div>
                  <h5 className="alite-amenity-title">{item.title}</h5>
                  <p className="alite-amenity-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 4: Room Types / FAQ ── */}
      <div className="product-dt-faq-section mb-120">
        <div className="container">
          <div className="product-dt-faq-wrapper">
            <div className="row g-0">
              <div className="col-lg-6 d-none d-lg-block">
                <div className="product-dt-faq-img">
                  <Image width={650} height={650} src={faqSectionImage} alt={faqSectionTitle} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="faq-content-area p-4">
                  <h2 className="mb-4">{faqSectionTitle}</h2>
                  {faqSectionDesc && <p style={{ color: '#777', marginBottom: 24, lineHeight: 1.75 }}>{faqSectionDesc}</p>}
                  <div className="faq-wrap">
                    <div className="accordion">
                      {accordionItems.map((item) => (
                        <div className="accordion-item mb-3 animated-accordion" key={item.id}>
                          <h2 className="accordion-header">
                            <button
                              className={`accordion-button ${activeAccordion === item.id ? '' : 'collapsed'}`}
                              type="button"
                              onClick={() => toggleAccordion(item.id)}
                            >
                              {item.title}
                            </button>
                          </h2>
                          <div
                            className={`accordion-collapse ${activeAccordion === item.id ? 'show' : ''}`}
                            style={{ maxHeight: activeAccordion === item.id ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease-in-out' }}
                          >
                            <div className="accordion-body">{item.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link className="primary-btn1 black-bg" href="/contact">
              <span>Enquire Now</span><span>Enquire Now</span>
              <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <g><path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" /><path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" /></g>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Section 5: Video Carousel ── */}
      <div className="alite-video-section mb-120">
        <div className="container">
          <div className="row mb-50">
            <div className="col-lg-7">
              <div className="section-title">
                <span>{highlights[0]?.section_title ?? `Experience ${pageTitle}`}</span>
                <h2>{highlights[0]?.section_sub_title ?? 'See What Makes Us Special'}</h2>
              </div>
            </div>
          </div>

          <div className="alite-video-carousel-wrap">
            {/* Main Player */}
            <div className="alite-video-main">
              <div className="alite-video-player-wrap">
                <video
                  ref={videoRef}
                  key={activeVideo}
                  poster={videos[activeVideo].poster}
                  muted={isMuted}
                  autoPlay
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnd}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                >
                  <source src={videos[activeVideo].src} type="video/mp4" />
                </video>
                <div className="alite-video-overlay" />
                <div className="alite-video-top">
                  <span className="alite-vplayer-tag">{videos[activeVideo].tag}</span>
                  <button className="alite-mute-btn" onClick={toggleMute} aria-label="Toggle mute">
                    {isMuted
                      ? <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                      : <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                    }
                  </button>
                </div>
                <button className="alite-center-play" onClick={togglePlay} aria-label="Play or pause">
                  {isPlaying
                    ? <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    : <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  }
                </button>
                <div className="alite-video-controls">
                  <div className="alite-progress-wrap" onClick={handleProgressClick}>
                    <div className="alite-progress-track">
                      <div className="alite-progress-fill" style={{ width: `${progress}%` }} />
                      <div className="alite-progress-thumb" style={{ left: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="alite-controls-row">
                    <div className="alite-time-display">
                      <span className="alite-time-current">{formatTime(currentTime)}</span>
                      <span className="alite-time-sep">/</span>
                      <span className="alite-time-total">{formatTime(duration)}</span>
                    </div>
                    <div className="alite-video-title-bar"><span>{videos[activeVideo].title}</span></div>
                    <div className="alite-nav-btns">
                      <button className="alite-nav-btn" onClick={() => switchVideo((activeVideo - 1 + videos.length) % videos.length)} aria-label="Previous">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
                      </button>
                      <button className="alite-nav-btn" onClick={() => switchVideo((activeVideo + 1) % videos.length)} aria-label="Next">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="alite-video-info">
                <span className="alite-video-tag">{videos[activeVideo].tag}</span>
                <h4 className="alite-video-title-text">{videos[activeVideo].title}</h4>
                <p className="alite-video-desc">{videos[activeVideo].desc}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="alite-video-sidebar">
              <p className="alite-sidebar-label">More Videos</p>
              {videos.map((video, index) => (
                <div key={index} className={`alite-video-thumb ${activeVideo === index ? 'active' : ''}`} onClick={() => switchVideo(index)}>
                  <div className="alite-thumb-img-wrap">
                    <img src={video.poster} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div className="alite-thumb-timer">
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                        {activeVideo === index && isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> : <path d="M8 5v14l11-7z" />}
                      </svg>
                      <span>{activeVideo === index ? `${formatTime(currentTime)} / ${formatTime(duration)}` : 'Play'}</span>
                    </div>
                    {activeVideo === index && (
                      <div className="alite-thumb-progress">
                        <div className="alite-thumb-progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="alite-thumb-info">
                    <span className="alite-thumb-tag">{video.tag}</span>
                    <p className="alite-thumb-title">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="alite-video-dots d-flex justify-content-center gap-2 mt-4 d-lg-none">
            {videos.map((_, i) => (
              <button key={i} onClick={() => switchVideo(i)} className={`alite-video-dot ${activeVideo === i ? 'active' : ''}`} aria-label={`Video ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 6: Location ── */}
      <div className="mb-120">
        <div className="container">
          <div className="row g-0 alite-location-wrap">
            <div className="col-lg-6">
              <div className="alite-location-img">
                <Image width={600} height={500} src={locationImage} alt="Location" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="alite-location-badge">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg>
                  <span>{locationBadge}</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="alite-location-content">
                <div className="section-title mb-4">
                  <span>Prime Location</span>
                  <h2>{locationTitle}</h2>
                </div>
                <p style={{ color: '#555', lineHeight: '1.85', marginBottom: '28px' }}>{locationDesc}</p>
                <ul className="alite-location-list">
                  {locationItems.map((loc, i) => (
                    <li key={i} className="alite-location-item">
                      <div className="alite-location-dot" />
                      <div className="alite-location-text">
                        <span className="alite-place-name">{loc.place}</span>
                        <span className="alite-place-dist">{loc.dist}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 7: Testimonials ── */}
      <div className="home1-testimonial-section">
        <div className="container-fluid">
          <div className="row gy-5">
            <div className="col-xl-4">
              <div className="testimonial-title-area">
                <div className="section-title">
                  <span>Our Guest Testimonials</span>
                  <h2>Trusted by Our Guests.</h2>
                </div>
                <ul className="rating-list mt-4">
                  {[
                    { href: 'https://clutch.co/', src: '/assets/img/home1/icon/clutch-logo.svg', alt: 'Clutch' },
                    { href: 'https://www.google.com/', src: '/assets/img/home1/icon/google-logo.svg', alt: 'Google' },
                  ].map((r) => (
                    <li key={r.alt} className="mb-3">
                      <a href={r.href} className={`single-rating ${r.alt === 'Google' ? 'google' : ''} d-flex align-items-center gap-3 p-3 border rounded`}>
                        <div className="review"><span className="d-block small">Review On</span><Image width={60} height={20} src={r.src} alt={r.alt} /></div>
                        <div className="rating">
                          <ul className="star d-flex gap-1">
                            {[...Array(4)].map((_, i) => <li key={i}><i className="bi bi-star-fill text-warning" /></li>)}
                            <li><i className="bi bi-star-half text-warning" /></li>
                          </ul>
                          <span className="small">(50 reviews)</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-xl-8">
              <div className="position-relative">
                <div className="testimonial-slider">
                  <div className="testimonial-card bg-white p-4 shadow-sm fade-in">
                    <svg className="quote mb-3" width={46} height={42} viewBox="0 0 46 42" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M19.3074 22.4375C19.0109 24.7824 18.4898 27.0555 17.9059 28.5469C15.8664 33.7848 11.2574 38.277 5.21094 40.9184C4.07891 41.4125 3.00977 41.2418 2.37188 40.4691C2.22813 40.2895 1.64415 39.1754 1.07813 38.0074L1.07111 37.9928C0.0628121 35.8959 0.0449269 35.8587 0.0449268 35.2402C0.0539122 34.0902 0.413287 33.668 2.06641 32.8773C5.27383 31.332 7.16055 29.5801 8.40039 26.9746C8.98438 25.7438 9.28086 24.8543 9.55938 23.4707C9.73907 22.5723 9.97266 20.5867 9.97266 19.9129C9.97266 19.7422 9.87383 19.7422 6.21719 19.7422L2.46172 19.7422L1.99454 19.5086C1.73399 19.3828 1.40157 19.1313 1.25782 18.9516C1.18695 18.8658 1.12525 18.7941 1.07158 18.7167C0.703361 18.1862 0.713199 17.3932 0.736722 10.0301L0.73675 10.0223C0.763674 2.37538 0.763737 2.3573 0.952347 1.99805C1.22188 1.50391 1.58125 1.15352 2.06641 0.928908C2.47071 0.740236 2.5336 0.740236 10.2871 0.740235L18.1035 0.740235L18.4719 0.937891C18.948 1.18945 19.3344 1.57578 19.55 2.01602C19.7117 2.33945 19.7207 2.68086 19.7207 10.2188C19.7207 18.3945 19.6848 19.4996 19.3074 22.4375Z" fill="currentColor" />
                    </svg>
                    <span className="d-block fw-bold mb-2">{testimonials[currentSlide].quote}</span>
                    <p className="mb-4">{testimonials[currentSlide].text}</p>
                    <div className="author-area d-flex align-items-center gap-3">
                      <div className="author-img">
                        <Image width={50} height={50} src={testimonials[currentSlide].img} alt={testimonials[currentSlide].author} className="rounded-circle" />
                      </div>
                      <div className="author-content">
                        <h5 className="mb-0">{testimonials[currentSlide].author}</h5>
                        <span className="small text-muted">{testimonials[currentSlide].role}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="slider-btn-grp d-flex gap-3 mt-4 justify-content-center">
                  <button className="slider-btn testimonial-slider-prev" onClick={prevSlide} aria-label="Previous">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <div className="d-flex align-items-center gap-2">
                    {testimonials.map((_, index) => (
                      <button key={index} className={`slide-indicator ${currentSlide === index ? 'active' : ''}`} onClick={() => goToSlide(index)} aria-label={`Slide ${index + 1}`} />
                    ))}
                  </div>
                  <button className="slider-btn testimonial-slider-next" onClick={nextSlide} aria-label="Next">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Zero border-radius ── */
        .alite-hero-img-grid,.alite-img-main,.alite-img-small,.alite-amenity-card,
        .alite-location-wrap,.alite-location-img,.alite-location-badge,
        .alite-video-main,.alite-video-player-wrap,.alite-video-sidebar,
        .alite-video-thumb,.alite-thumb-img-wrap,.alite-vplayer-tag,.alite-mute-btn,
        .alite-center-play,.alite-nav-btn,.alite-time-display,.alite-place-dist,
        .alite-video-tag,.alite-thumb-timer,.alite-video-dot,.alite-sidebar-label,
        .alite-progress-track,.alite-progress-fill,.alite-progress-thumb,
        .testimonial-card { border-radius: 0 !important; }

        /* ── Hero images ── */
        .alite-hero-img-grid { display: flex; flex-direction: column; gap: 4px; }
        .alite-img-main { width: 100%; height: 280px; overflow: hidden; }
        .alite-img-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 4px; }
        .alite-img-small { height: 160px; overflow: hidden; }

        /* ── Stats Bar ── */
        .alite-stats-bar { background: #000; padding: 60px 0; }
        .alite-stats-wrap { display: grid; grid-template-columns: repeat(4, 1fr); }
        .alite-stat-item { text-align: center; padding: 40px 20px; border-right: 1px solid rgba(255,255,255,0.08); }
        .alite-stat-item:last-child { border-right: none; }
        .alite-stat-number { font-size: 4rem; font-weight: 900; color: #fff; margin: 0 0 10px; line-height: 1; letter-spacing: -2px; }
        .alite-stat-label { color: rgba(255,255,255,0.45); font-size: 0.75rem; margin: 0; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; }

        /* ── Amenities ── */
        .alite-amenity-card { background: #fff; border: 1px solid #e8e8e8; border-top: none; border-left: none; padding: 36px 32px; height: 100%; transition: background 0.3s, box-shadow 0.3s; }
        .row.g-0 .col-lg-4:nth-child(3n) .alite-amenity-card { border-right: none; }
        .row.g-0 .col-lg-4:nth-child(-n+3) .alite-amenity-card { border-top: 1px solid #e8e8e8; }
        .row.g-0 .col-lg-4:nth-child(1) .alite-amenity-card,
        .row.g-0 .col-lg-4:nth-child(4) .alite-amenity-card { border-left: 1px solid #e8e8e8; }
        .alite-amenity-card:hover { background: #000; }
        .alite-amenity-card:hover .alite-amenity-title { color: #fff; }
        .alite-amenity-card:hover .alite-amenity-desc { color: rgba(255,255,255,0.6); }
        .alite-amenity-card:hover .alite-amenity-icon { filter: grayscale(1) brightness(5); }
        .alite-amenity-icon { font-size: 2rem; margin-bottom: 18px; display: block; transition: filter 0.3s; }
        .alite-amenity-title { font-weight: 700; color: #000; margin-bottom: 10px; font-size: 1rem; transition: color 0.3s; }
        .alite-amenity-desc { color: #777; font-size: 0.88rem; line-height: 1.75; margin: 0; transition: color 0.3s; }

        /* ── Location ── */
        .alite-location-wrap { overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.07); }
        .alite-location-img { position: relative; height: 100%; min-height: 460px; }
        .alite-location-img img { width: 100%; height: 100%; object-fit: cover; }
        .alite-location-badge { position: absolute; bottom: 20px; left: 20px; background: #fff; color: #000; padding: 10px 16px; display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.82rem; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .alite-location-content { background: #fff; padding: 60px 50px; height: 100%; display: flex; flex-direction: column; justify-content: center; }
        .alite-location-list { list-style: none; padding: 0; margin: 0; }
        .alite-location-item { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
        .alite-location-item:last-child { border-bottom: none; }
        .alite-location-dot { width: 8px; height: 8px; background: #000; flex-shrink: 0; }
        .alite-location-text { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .alite-place-name { font-weight: 600; color: #222; font-size: 0.9rem; }
        .alite-place-dist { font-size: 0.78rem; color: #888; background: #f5f5f5; padding: 3px 10px; }

        /* ── Video ── */
        .alite-video-section { background: #0a0a0a; padding: 80px 0; }
        .alite-video-section .section-title span { color: rgba(255,255,255,0.45); }
        .alite-video-section .section-title h2 { color: #fff; }
        .alite-video-carousel-wrap { display: grid; grid-template-columns: 1fr 290px; gap: 16px; align-items: start; }
        .alite-video-main { background: #111; overflow: hidden; box-shadow: 0 16px 64px rgba(0,0,0,0.5); }
        .alite-video-player-wrap { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; overflow: hidden; }
        .alite-video-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.85) 100%); pointer-events: none; z-index: 1; }
        .alite-video-top { position: absolute; top: 14px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between; z-index: 3; }
        .alite-vplayer-tag { background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); color: #fff; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 12px; border: 1px solid rgba(255,255,255,0.2); }
        .alite-mute-btn { background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
        .alite-mute-btn:hover { background: rgba(255,255,255,0.3); }
        .alite-center-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(255,255,255,0.18); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.3); color: #fff; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 3; transition: all 0.25s ease; opacity: 0; }
        .alite-video-player-wrap:hover .alite-center-play { opacity: 1; }
        .alite-center-play:hover { background: rgba(255,255,255,0.28); transform: translate(-50%,-50%) scale(1.08); }
        .alite-video-controls { position: absolute; bottom: 0; left: 0; right: 0; z-index: 3; padding: 0 16px 14px; }
        .alite-progress-wrap { cursor: pointer; padding: 8px 0; margin-bottom: 6px; }
        .alite-progress-track { position: relative; height: 3px; background: rgba(255,255,255,0.25); transition: height 0.2s; }
        .alite-progress-wrap:hover .alite-progress-track { height: 5px; }
        .alite-progress-fill { position: absolute; left: 0; top: 0; height: 100%; background: #fff; transition: width 0.1s linear; }
        .alite-progress-thumb { position: absolute; top: 50%; transform: translate(-50%,-50%); width: 12px; height: 12px; background: #fff; opacity: 0; transition: opacity 0.2s; }
        .alite-progress-wrap:hover .alite-progress-thumb { opacity: 1; }
        .alite-controls-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .alite-time-display { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; font-weight: 600; color: #fff; flex-shrink: 0; background: rgba(0,0,0,0.3); padding: 3px 10px; }
        .alite-time-sep { color: rgba(255,255,255,0.5); }
        .alite-time-total { color: rgba(255,255,255,0.65); }
        .alite-video-title-bar { flex: 1; text-align: center; font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .alite-nav-btns { display: flex; gap: 6px; flex-shrink: 0; }
        .alite-nav-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
        .alite-nav-btn:hover { background: rgba(255,255,255,0.3); }
        .alite-video-info { padding: 20px 24px; background: #111; border-top: 1px solid rgba(255,255,255,0.06); }
        .alite-video-tag { display: inline-block; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 3px 10px; margin-bottom: 8px; }
        .alite-video-title-text { font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .alite-video-desc { color: rgba(255,255,255,0.5); font-size: 0.85rem; line-height: 1.6; margin: 0; }
        .alite-video-sidebar { display: flex; flex-direction: column; gap: 8px; }
        .alite-sidebar-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.3); margin: 0 0 4px; }
        .alite-video-thumb { display: flex; gap: 10px; align-items: flex-start; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.06); padding: 10px; cursor: pointer; transition: all 0.25s ease; }
        .alite-video-thumb:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
        .alite-video-thumb.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.4); }
        .alite-thumb-img-wrap { position: relative; width: 82px; height: 56px; flex-shrink: 0; overflow: hidden; background: #222; }
        .alite-thumb-timer { position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 2px 5px; display: flex; align-items: center; gap: 3px; backdrop-filter: blur(4px); }
        .alite-thumb-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.2); }
        .alite-thumb-progress-fill { height: 100%; background: #fff; transition: width 0.1s linear; }
        .alite-thumb-info { flex: 1; min-width: 0; }
        .alite-thumb-tag { display: block; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.35); margin-bottom: 4px; }
        .alite-video-thumb.active .alite-thumb-tag { color: rgba(255,255,255,0.65); }
        .alite-thumb-title { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.6); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .alite-video-thumb.active .alite-thumb-title { color: #fff; }
        .alite-video-dot { width: 10px; height: 10px; background: rgba(255,255,255,0.2); border: none; padding: 0; cursor: pointer; transition: background 0.2s; }
        .alite-video-dot.active { background: #fff; }

        /* ── Animations ── */
        .testimonial-card { animation: fadeSlide 0.6s ease; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Responsive ── */
        @media (max-width: 1100px) { .alite-video-carousel-wrap { grid-template-columns: 1fr 240px; } }
        @media (max-width: 992px) {
          .alite-video-carousel-wrap { grid-template-columns: 1fr; }
          .alite-video-sidebar { flex-direction: row; flex-wrap: wrap; gap: 8px; }
          .alite-video-thumb { flex: 1 1 calc(50% - 8px); }
          .alite-sidebar-label { width: 100%; }
          .alite-stats-wrap { grid-template-columns: repeat(2, 1fr); }
          .alite-stat-item:nth-child(2) { border-right: none; }
          .alite-stat-item:nth-child(3) { border-top: 1px solid rgba(255,255,255,0.08); }
          .alite-location-content { padding: 40px 30px; }
        }
        @media (max-width: 768px) {
          .alite-video-sidebar { flex-direction: column; }
          .alite-video-thumb { flex: unset; }
          .alite-stat-number { font-size: 2.8rem; }
          .alite-img-main { height: 220px; }
          .alite-img-small { height: 130px; }
          .alite-location-img { min-height: 300px; }
          .alite-video-title-bar { display: none; }
          .alite-video-section { padding: 60px 0; }
        }
        @media (max-width: 576px) {
          .alite-stats-wrap { grid-template-columns: repeat(2, 1fr); }
          .alite-stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .alite-stat-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.08); }
        }
      `}</style>

      <FooterTop />
      <Footer1 />
    </>
  )
}

export default AliteEnclavesPage