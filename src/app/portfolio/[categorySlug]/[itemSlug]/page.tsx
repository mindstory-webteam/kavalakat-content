"use client"
// ✅ FILE PATH: src/app/portfolio/[categorySlug]/[itemSlug]/page.tsx
//
// KEY INSIGHT (from serializer fields inspection):
// The LIST endpoint /portfolio/items/ already returns ALL rich data:
//   about_description, features, brands, testimonials, etc.
// So we DON'T need the detail endpoint for content — list is the source of truth.
// Detail endpoint is only called as a bonus for any extra fields it may add.
// The old `...detail` spread was WIPING good list data with empty detail strings — FIXED.

import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'
import CompanyCard from '@/components/CompanyCard'
import { useParams } from 'next/navigation'

const API = 'https://api.kavalakat.com/api'
const PLACEHOLDER = '/assets/new-images/bm/bm-3.jpeg'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature     { title: string; description: string }
interface Brand       { title: string; description: string; logo_url: string }
interface Testimonial { title: string; description: string; client_name: string }

interface PortfolioItem {
  id: number
  name: string
  description: string
  image_url: string | null
  banner_image_url: string | null
  category_name: string
  category_slug: string
  is_featured: boolean
  is_active: boolean
  order: number
  // Hero / About
  hero_title: string
  about_title: string
  about_description: string
  about_image_url: string | null
  // Features
  features_title: string
  features_image_url: string | null
  features_json: string
  features: Feature[]
  // Brands
  brands_heading: string
  brands_json: string
  brands: Brand[]
  // Testimonials
  testimonials_json: string
  testimonials: Testimonial[]
  // ✅ bottom_html — will be available once backend adds to serializer fields
  bottom_html?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/_/g, '-').replace(/\s+/g, '-')
}

function slugMatches(item: PortfolioItem, slug: string): boolean {
  const target = norm(slug)
  return [
    norm(toSlug(item.name)),
    norm(item.name),
  ].some(c => c === target)
}

function parseArr<T>(raw: T[] | string | null | undefined): T[] {
  if (Array.isArray(raw)) return raw
  if (!raw) return []
  try {
    const p = JSON.parse(raw as string)
    return Array.isArray(p) ? p : []
  } catch { return [] }
}

/** Pick first non-empty string */
function firstStr(...vals: (string | null | undefined)[]): string {
  for (const v of vals) { if (v && v.trim()) return v.trim() }
  return ''
}

/** Pick first non-null/undefined */
function firstDefined<T>(...vals: (T | null | undefined)[]): T | null {
  for (const v of vals) { if (v != null) return v }
  return null
}

/** Normalise a raw API payload into PortfolioItem */
function normalise(raw: Record<string, unknown>): PortfolioItem {
  return {
    id:                (raw.id as number)               ?? 0,
    name:              (raw.name as string)              ?? '',
    description:       (raw.description as string)       ?? '',
    image_url:         firstDefined(raw.image_url as string | null, raw.image as string | null),
    banner_image_url:  firstDefined(raw.banner_image_url as string | null, raw.banner_image as string | null),
    category_name:     (raw.category_name as string)     ?? '',
    category_slug:     (raw.category_slug as string)     ?? '',
    is_featured:       (raw.is_featured as boolean)      ?? false,
    is_active:         (raw.is_active as boolean)        ?? true,
    order:             (raw.order as number)             ?? 0,
    // Hero / About
    hero_title:        (raw.hero_title as string)        ?? '',
    about_title:       (raw.about_title as string)       ?? '',
    about_description: (raw.about_description as string) ?? '',
    about_image_url:   firstDefined(raw.about_image_url as string | null, raw.about_image as string | null),
    // Features
    features_title:    (raw.features_title as string)    ?? '',
    features_image_url:firstDefined(raw.features_image_url as string | null, raw.features_image as string | null),
    features_json:     (raw.features_json as string)     ?? '',
    features:          parseArr<Feature>((raw.features   ?? raw.features_json) as Feature[] | string),
    // Brands
    brands_heading:    (raw.brands_heading as string)    ?? '',
    brands_json:       (raw.brands_json as string)       ?? '',
    brands:            parseArr<Brand>((raw.brands       ?? raw.brands_json) as Brand[] | string),
    // Testimonials
    testimonials_json: (raw.testimonials_json as string) ?? '',
    testimonials:      parseArr<Testimonial>((raw.testimonials ?? raw.testimonials_json) as Testimonial[] | string),
    // bottom_html — optional until backend adds to serializer
    bottom_html:       (raw.bottom_html as string)       ?? '',
  }
}

/**
 * ✅ FIXED MERGE: only override list values with detail values when detail has content.
 * List already has ALL data — detail is bonus only.
 */
function mergeWithDetail(list: PortfolioItem, detail: PortfolioItem): PortfolioItem {
  return {
    // Always keep list identity fields
    id:           list.id,
    is_active:    list.is_active,
    is_featured:  list.is_featured,
    order:        list.order,
    // Strings: prefer detail only when non-empty, else keep list
    name:              firstStr(detail.name,              list.name),
    description:       firstStr(detail.description,       list.description),
    category_name:     firstStr(detail.category_name,     list.category_name),
    category_slug:     firstStr(detail.category_slug,     list.category_slug),
    hero_title:        firstStr(detail.hero_title,        list.hero_title),
    about_title:       firstStr(detail.about_title,       list.about_title),
    about_description: firstStr(detail.about_description, list.about_description, list.description),
    features_title:    firstStr(detail.features_title,    list.features_title),
    brands_heading:    firstStr(detail.brands_heading,    list.brands_heading),
    features_json:     firstStr(detail.features_json,     list.features_json),
    brands_json:       firstStr(detail.brands_json,       list.brands_json),
    testimonials_json: firstStr(detail.testimonials_json, list.testimonials_json),
    bottom_html:       firstStr(detail.bottom_html,       list.bottom_html),
    // Images: prefer detail if non-null, else list
    image_url:          firstDefined(detail.image_url,          list.image_url),
    banner_image_url:   firstDefined(detail.banner_image_url,   list.banner_image_url),
    about_image_url:    firstDefined(detail.about_image_url,    list.about_image_url),
    features_image_url: firstDefined(detail.features_image_url, list.features_image_url),
    // Arrays: prefer detail if non-empty, else list
    features:     detail.features.length     ? detail.features     : list.features,
    brands:       detail.brands.length       ? detail.brands       : list.brands,
    testimonials: detail.testimonials.length ? detail.testimonials : list.testimonials,
  }
}

// ─── Fetch all paginated list items ──────────────────────────────────────────

async function fetchAllItems(): Promise<PortfolioItem[]> {
  const collected: PortfolioItem[] = []
  let page = 1

  while (true) {
    const res = await fetch(`${API}/portfolio/items/?page=${page}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`List fetch failed: ${res.status}`)

    const json = await res.json()

    // Handle { success, data: [] } or { results: [] } or plain array
    const raw: Record<string, unknown>[] =
      json.data    ??
      json.results ??
      (Array.isArray(json) ? json : [])

    raw.filter(i => i.is_active !== false).forEach(i => collected.push(normalise(i)))

    // Support both custom and DRF pagination
    if (!(json.pagination?.next || json.next)) break
    page++
  }

  return collected
}

// ─── Component ────────────────────────────────────────────────────────────────

const PortfolioDetailPage = () => {
  const params       = useParams()
  const categorySlug = (params?.categorySlug ?? '') as string
  const itemSlug     = (params?.itemSlug     ?? '') as string

  const [item,         setItem]         = useState<PortfolioItem | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [notFound,     setNotFound]     = useState(false)
  const [activeAcc,    setActiveAcc]    = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!itemSlug) return

    const load = async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)
      setItem(null)

      try {
        // ── Step 1: Fetch all list items (already has ALL content fields) ──────
        console.log('[Portfolio] fetching list…')
        const allItems = await fetchAllItems()
        console.log(`[Portfolio] ${allItems.length} active items loaded`)

        // ── Step 2: Match by name slug + optional category match ──────────────
        const exactMatch = allItems.find(i =>
          slugMatches(i, itemSlug) && norm(i.category_slug) === norm(categorySlug)
        )
        const looseMatch = allItems.find(i => slugMatches(i, itemSlug))
        const listItem   = exactMatch ?? looseMatch ?? null

        if (!listItem) {
          console.warn('[Portfolio] no match:', itemSlug, categorySlug)
          setNotFound(true)
          return
        }

        console.log('[Portfolio] matched:', listItem.id, listItem.name,
          '| features:', listItem.features.length,
          '| brands:', listItem.brands.length,
          '| testimonials:', listItem.testimonials.length)

        // ── Step 3: Try detail endpoint for any EXTRA fields (bonus only) ─────
        // List already has everything — detail is only for fields not in list
        // (e.g. bottom_html once backend adds it). Falls back silently.
        try {
          const detailRes = await fetch(`${API}/portfolio/items/${listItem.id}/`, {
            headers: { Accept: 'application/json' },
          })
          if (!detailRes.ok) throw new Error(`Detail ${detailRes.status}`)

          const detailJson = await detailRes.json()
          // Unwrap envelope: { success, data: {} } or direct object
          const rawDetail: Record<string, unknown> =
            detailJson?.data !== undefined && !Array.isArray(detailJson.data)
              ? detailJson.data
              : detailJson

          const detail = normalise(rawDetail)
          const merged = mergeWithDetail(listItem, detail)

          console.log('[Portfolio] detail merged — bottom_html:', merged.bottom_html ? 'YES' : 'no')
          setItem(merged)

        } catch (detailErr) {
          // Detail failed — list data is complete, use it directly
          console.warn('[Portfolio] detail skipped:', detailErr)
          setItem(listItem)
        }

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[Portfolio] fatal error:', msg)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [itemSlug, categorySlug])

  // ── Testimonial auto-slide ─────────────────────────────────────────────────
  const testimonials = item?.testimonials ?? []

  useEffect(() => {
    if (!testimonials.length) return
    timerRef.current = setInterval(
      () => setCurrentSlide(p => (p + 1) % testimonials.length), 4000
    )
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [testimonials.length, itemSlug])

  const stopTimer  = () => { if (timerRef.current) clearInterval(timerRef.current) }
  const startTimer = () => {
    stopTimer()
    if (testimonials.length)
      timerRef.current = setInterval(
        () => setCurrentSlide(p => (p + 1) % testimonials.length), 4000
      )
  }
  const next = () => { stopTimer(); setCurrentSlide(p => (p + 1) % testimonials.length); startTimer() }
  const prev = () => { stopTimer(); setCurrentSlide(p => (p - 1 + testimonials.length) % testimonials.length); startTimer() }

  const features = item?.features ?? []
  const brands   = item?.brands   ?? []

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <InnerPageHeader />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="kv-loader"><div /><div /><div /></div>
      </div>
      <FooterTop /><Footer1 />
      <style>{loaderCss}</style>
    </>
  )

  // ── Not Found ──────────────────────────────────────────────────────────────
  if (notFound) return (
    <>
      <InnerPageHeader />
      <div className="container pt-120 mb-120 text-center">
        <h2>Product Not Found</h2>
        <p className="mb-4" style={{ color: '#666' }}>
          We couldn&apos;t find <strong>&quot;{itemSlug}&quot;</strong> in <strong>&quot;{categorySlug}&quot;</strong>.<br />
          It may have been moved or the link is incorrect.
        </p>
        <Link href="/product" className="primary-btn1 black-bg mt-2 d-inline-flex">
          <span>View All Products</span><span>View All Products</span>
        </Link>
      </div>
      <FooterTop /><Footer1 />
    </>
  )

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !item) return (
    <>
      <InnerPageHeader />
      <div className="container pt-120 mb-120 text-center">
        <h2>Failed to Load</h2>
        <p className="mb-4" style={{ color: '#666' }}>Something went wrong. Please try again.</p>
        {error && (
          <p style={{ fontSize: '0.8rem', color: '#999', fontFamily: 'monospace', marginBottom: 24 }}>
            {error}
          </p>
        )}
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button onClick={() => window.location.reload()} className="primary-btn1 black-bg d-inline-flex">
            <span>Try Again</span><span>Try Again</span>
          </button>
          <Link href="/product" className="primary-btn1 black-bg d-inline-flex">
            <span>Back to Products</span><span>Back to Products</span>
          </Link>
        </div>
      </div>
      <FooterTop /><Footer1 />
    </>
  )

  // Split about_description into paragraphs (double-newline separated)
  const heroParas = (item.about_description || item.description || '')
    .split('\n\n').filter(Boolean)

  return (
    <>
      <InnerPageHeader />

      <Breadcrumb
        title={item.name}
        subtitle={item.hero_title}
        image={item.banner_image_url || item.image_url || PLACEHOLDER}
      />

      {/* ── Hero / About ───────────────────────────────────────────────────── */}
      <div className="product-details-top-area pt-120 mb-120" id="scroll-section">
        <div className="container">
          <div className="row gy-md-5 gy-4 align-items-lg-end">

            <div className="col-lg-8 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="details-content">
                <h2>{item.hero_title || item.about_title || `Kavalakat — ${item.name}`}</h2>
                {heroParas.length > 0
                  ? heroParas.map((p, i) => <p key={i} style={{ textAlign: 'justify' }}>{p}</p>)
                  : <p style={{ textAlign: 'justify', opacity: 0.6 }}>{item.description || item.name}</p>
                }
              </div>
            </div>

            <div className="col-lg-4 wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="product-img">
                <Image
                  width={340} height={270}
                  src={item.about_image_url || item.image_url || '/assets/new-images/new-images/about-imges/img-1.webp'}
                  alt={item.name}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            </div>
          </div>

          {/* ✅ Bottom HTML — rendered below about section, inside container */}
          {item.bottom_html && item.bottom_html.trim() && (
            <div
              className="portfolio-bottom-html mt-5"
              dangerouslySetInnerHTML={{ __html: item.bottom_html }}
            />
          )}
        </div>
      </div>

      {/* ── Features / FAQ ─────────────────────────────────────────────────── */}
      {features.length > 0 && (
        <div className="product-dt-faq-section mb-120">
          <div className="container">
            <div className="product-dt-faq-wrapper">
              <div className="row g-0">
                <div className="col-lg-6 d-none d-lg-block">
                  <div className="product-dt-faq-img">
                    <Image
                      width={650} height={650}
                      src={item.features_image_url || '/assets/new-images/about-page/cement/cement-prodect-page.png'}
                      alt="Features"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="faq-content-area p-4">
                    <h2 className="mb-4">
                      {(() => {
                        const t = item.features_title || `${item.name} Features`
                        return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
                      })()}
                    </h2>
                    <div className="accordion" id="accordionExample">
                      {features.map((feat, idx) => (
                        <div className="accordion-item mb-3 animated-accordion" key={idx}>
                          <h2 className="accordion-header">
                            <button
                              className={`accordion-button ${activeAcc === idx ? '' : 'collapsed'}`}
                              type="button"
                              onClick={() => setActiveAcc(activeAcc === idx ? null : idx)}
                            >
                              {feat.title}
                            </button>
                          </h2>
                          <div
                            className={`accordion-collapse ${activeAcc === idx ? 'show' : ''}`}
                            style={{
                              maxHeight: activeAcc === idx ? '500px' : '0',
                              overflow: 'hidden',
                              transition: 'max-height .4s ease-in-out',
                            }}
                          >
                            <div className="accordion-body">{feat.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Link className="primary-btn1 black-bg" href="/contact">
                <span>Contact With Us</span><span>Contact With Us</span>
                <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                    <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                  </g>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Brands ─────────────────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <div className="steel-partners-section mb-120">
          <div className="container">
            <div className="row mb-50">
              <div className="col-12">
                <h2 className="section-main-title">
                  {item.brands_heading || `${item.name} Brands We Supply`}
                </h2>
              </div>
            </div>
            <div className="row g-4 justify-content-center">
              {brands.map((brand, i) => (
                <div key={i} className="col-lg-4 col-md-6 col-sm-12">
                  <div className="card-wrapper-small">
                    <CompanyCard
                      logo={brand.logo_url || ''}
                      logoAlt={brand.title}
                      companyName={brand.title}
                      description={brand.description}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <div className="home1-testimonial-section mb-120">
          <div className="container-fluid">
            <div className="row gy-5">
              <div className="col-xl-4">
                <div className="testimonial-title-area">
                  <div className="section-title">
                    <span>Our Client Testimonial</span>
                    <h2>Trusted by Our Partners.</h2>
                  </div>
                  <ul className="rating-list mt-4 list-unstyled">
                    {[
                      ['clutch-logo', 'https://clutch.co/'],
                      ['google-logo', 'https://www.google.com/'],
                    ].map(([logo, href]) => (
                      <li className="mb-3" key={logo}>
                        <a href={href} className="d-flex align-items-center gap-3 p-3 border rounded text-decoration-none">
                          <div>
                            <span className="d-block small text-muted">Review On</span>
                            <Image width={60} height={20} src={`/assets/img/home1/icon/${logo}.svg`} alt={logo} />
                          </div>
                          <div>
                            <ul className="star d-flex gap-1 list-unstyled mb-1">
                              {[...Array(4)].map((_, i) => (
                                <li key={i}><i className="bi bi-star-fill text-warning" /></li>
                              ))}
                              <li><i className="bi bi-star-half text-warning" /></li>
                            </ul>
                            <span className="small text-muted">(50 reviews)</span>
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
                    <div className="testimonial-card bg-white p-4 rounded shadow-sm" key={currentSlide}>
                      <svg className="quote mb-3" width={46} height={42} viewBox="0 0 46 42" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M19.3074 22.4375C19.0109 24.7824 18.4898 27.0555 17.9059 28.5469C15.8664 33.7848 11.2574 38.277 5.21094 40.9184C4.07891 41.4125 3.00977 41.2418 2.37188 40.4691C2.22813 40.2895 1.64415 39.1754 1.07813 38.0074L1.07111 37.9928C0.0628121 35.8959 0.0449269 35.8587 0.0449268 35.2402C0.0539122 34.0902 0.413287 33.668 2.06641 32.8773C5.27383 31.332 7.16055 29.5801 8.40039 26.9746C8.98438 25.7438 9.28086 24.8543 9.55938 23.4707C9.73907 22.5723 9.97266 20.5867 9.97266 19.9129C9.97266 19.7422 9.87383 19.7422 6.21719 19.7422L2.46172 19.7422L1.99454 19.5086C1.73399 19.3828 1.40157 19.1313 1.25782 18.9516C1.18695 18.8658 1.12525 18.7941 1.07158 18.7167C0.703361 18.1862 0.713199 17.3932 0.736722 10.0301L0.73675 10.0223C0.763674 2.37538 0.763737 2.3573 0.952347 1.99805C1.22188 1.50391 1.58125 1.15352 2.06641 0.928908C2.47071 0.740236 2.5336 0.740236 10.2871 0.740235L18.1035 0.740235L18.4719 0.937891C18.948 1.18945 19.3344 1.57578 19.55 2.01602C19.7117 2.33945 19.7207 2.68086 19.7207 10.2188C19.7207 18.3945 19.6848 19.4996 19.3074 22.4375Z" fill="currentColor" />
                      </svg>
                      <span className="d-block fw-bold mb-2">{testimonials[currentSlide]?.title}</span>
                      <p className="mb-4">{testimonials[currentSlide]?.description}</p>
                      <div className="author-area d-flex align-items-center gap-3">
                        <div style={{
                          width: 50, height: 50, borderRadius: '50%', background: '#e0e0e0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '1.2rem', color: '#555', flexShrink: 0,
                        }}>
                          {(testimonials[currentSlide]?.client_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="mb-0">{testimonials[currentSlide]?.client_name || 'Anonymous'}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="slider-btn-grp d-flex gap-3 mt-4 justify-content-center align-items-center">
                    <button className="slider-btn" onClick={prev} aria-label="Previous">
                      <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div className="d-flex align-items-center gap-2">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          className={`slide-indicator ${currentSlide === i ? 'active' : ''}`}
                          onClick={() => { stopTimer(); setCurrentSlide(i); startTimer() }}
                          aria-label={`Slide ${i + 1}`}
                        />
                      ))}
                    </div>
                    <button className="slider-btn" onClick={next} aria-label="Next">
                      <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{pageStyles}</style>
      <FooterTop />
      <Footer1 />
    </>
  )
}

export default PortfolioDetailPage

// ─── Styles ───────────────────────────────────────────────────────────────────

const loaderCss = `
  .kv-loader{display:flex;gap:8px;align-items:flex-end}
  .kv-loader div{width:6px;background:#000;border-radius:3px;animation:kvb .8s ease infinite}
  .kv-loader div:nth-child(1){height:20px;animation-delay:0s}
  .kv-loader div:nth-child(2){height:32px;animation-delay:.15s}
  .kv-loader div:nth-child(3){height:20px;animation-delay:.3s}
  @keyframes kvb{0%,100%{opacity:.3}50%{opacity:1}}
`

const pageStyles = `
  ${loaderCss}

  /* Testimonial slide animation */
  .testimonial-card{animation:fadeSlide .5s ease}
  @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  /* Accordion */
  .animated-accordion .accordion-collapse{overflow:hidden;transition:max-height .4s ease-in-out}

  /* Brands section */
  .steel-partners-section{background:#fff;padding:80px 0}
  .section-main-title{font-size:3rem;font-weight:800;color:#000;margin:0 0 40px;line-height:1.2;letter-spacing:-.5px}
  .card-wrapper-small{height:420px;width:100%}

  /* Slider controls */
  .slider-btn{width:40px;height:40px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,border-color .2s}
  .slider-btn:hover{background:#000;color:#fff;border-color:#000}
  .slider-btn:hover svg path{stroke:#fff}
  .slide-indicator{width:8px;height:8px;border-radius:50%;border:none;background:#ddd;cursor:pointer;padding:0;transition:background .3s,transform .3s}
  .slide-indicator.active{background:#000;transform:scale(1.3)}

  /* ── Bottom HTML block (portfolio CMS inject) ── */
  .portfolio-bottom-html {
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(0,0,0,0.08);
  }
  .portfolio-bottom-html h1,
  .portfolio-bottom-html h2,
  .portfolio-bottom-html h3,
  .portfolio-bottom-html h4 { margin-top:0; margin-bottom:1rem; font-weight:700; line-height:1.3; }
  .portfolio-bottom-html p   { margin-bottom:1.25rem; line-height:1.8; }
  .portfolio-bottom-html ul,
  .portfolio-bottom-html ol  { margin-bottom:1.25rem; padding-left:1.5rem; }
  .portfolio-bottom-html li  { margin-bottom:.5rem; }
  .portfolio-bottom-html img { max-width:100%; height:auto; border-radius:8px; margin:1.5rem 0; }
  .portfolio-bottom-html table { width:100%; border-collapse:collapse; margin-bottom:1.5rem; }
  .portfolio-bottom-html th,
  .portfolio-bottom-html td  { border:1px solid #ddd; padding:8px 12px; text-align:left; }
  .portfolio-bottom-html strong { font-weight:700; }
  .portfolio-bottom-html a   { text-decoration:underline; }
  .portfolio-bottom-html iframe { max-width:100%; border-radius:8px; margin:1rem 0; }
  .portfolio-bottom-html .cta-banner {
    background:rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.1);
    border-radius:8px; padding:1.5rem 2rem; margin:1rem 0;
    display:flex; align-items:center; justify-content:space-between;
    flex-wrap:wrap; gap:1rem;
  }
  .portfolio-bottom-html .cta-banner h3 { margin:0; font-size:1.1rem; }
  .portfolio-bottom-html .btn {
    display:inline-block; padding:10px 24px; border-radius:4px;
    font-weight:600; text-decoration:none !important; transition:opacity .2s; cursor:pointer;
  }
  .portfolio-bottom-html .btn:hover { opacity:.85; }

  /* Responsive */
  @media(max-width:992px){
    .card-wrapper-small{height:400px}
    .section-main-title{font-size:2.5rem}
  }
  @media(max-width:768px){
    .card-wrapper-small{height:380px}
    .section-main-title{font-size:2rem;text-align:center}
    .portfolio-bottom-html .cta-banner{flex-direction:column;text-align:center}
  }
  @media(max-width:576px){
    .card-wrapper-small{height:auto;min-height:360px}
  }
`