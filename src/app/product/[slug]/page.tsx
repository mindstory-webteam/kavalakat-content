"use client"
import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'
import CompanyCard from '@/components/CompanyCard'
import { useParams } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.kavalakat.com/api"

// ─── Types ────────────────────────────────────────────────────────────────

/** Shape returned by /api/portfolio/page/ listing */
interface PortfolioListItem {
  id: number
  name: string
  slug?: string
  description: string
  image: string | null
  image_url: string | null
  category_name: string
  category_slug: string
  is_active: boolean
  order: number
}

/** Feature item inside features_json / features array */
interface Feature {
  title: string
  description: string
}

/** Brand item inside brands_json / brands array */
interface Brand {
  title: string
  description: string
  logo_url: string
}

/** Testimonial item inside testimonials_json / testimonials array */
interface Testimonial {
  title: string
  description: string
  client_name: string
}

/** Full detail shape from /api/portfolio/items/{id}/ */
interface PortfolioDetail {
  id: number
  name: string
  description: string
  image: string | null
  image_url: string | null
  tags: string
  category: number
  category_name: string
  category_slug: string
  is_featured: boolean
  is_active: boolean
  order: number
  // Hero
  hero_title: string
  banner_image: string
  banner_image_url: string
  // About
  about_title: string
  about_description: string
  about_image: string
  about_image_url: string
  // Features
  features_title: string
  features_image: string
  features_image_url: string
  features_json: string
  features: Feature[]
  // Brands
  brands_heading: string
  brands_json: string
  brands: Brand[]
  // Testimonials
  testimonials_json: string
  testimonials: Testimonial[]
  created_at: string
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function slugMatches(item: PortfolioListItem, slug: string) {
  return (
    (item.slug && item.slug === slug) ||
    (item.slug && item.slug.replace(/_/g, '-') === slug) ||
    nameToSlug(item.name) === slug
  )
}

function parseArr<T>(raw: T[] | string | null | undefined, fallback: T[] = []): T[] {
  if (Array.isArray(raw)) return raw
  if (!raw) return fallback
  try {
    const p = JSON.parse(raw as string)
    return Array.isArray(p) ? p : fallback
  } catch { return fallback }
}

// ─── Component ────────────────────────────────────────────────────────────

const TradingDetailPage = () => {
  const params  = useParams()
  const slug    = params?.slug as string

  const [item,         setItem]         = useState<PortfolioDetail | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(false)
  const [activeAcc,    setActiveAcc]    = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)

      try {
        // ── Step 1: get item ID from the portfolio listing ──────────────
        // This endpoint is proven to work (same as portfolio page)
        const pageRes = await fetch(`${API}/portfolio/page/`, { cache: 'no-store' })
        if (!pageRes.ok) throw new Error(`portfolio/page/ → ${pageRes.status}`)

        const pageJson = await pageRes.json()
        const page     = pageJson?.data ?? pageJson

        const allItems: PortfolioListItem[] = [
          ...(Array.isArray(page?.trading)      ? page.trading      : []),
          ...(Array.isArray(page?.distribution) ? page.distribution : []),
          ...(Array.isArray(page?.services)     ? page.services     : []),
        ]

        const match = allItems.find(i => slugMatches(i, slug))
        if (!match) throw new Error(`No item matched slug: ${slug}`)

        // ── Step 2: fetch full detail by numeric ID ─────────────────────
        const detailRes = await fetch(`${API}/portfolio/items/${match.id}/`, { cache: 'no-store' })
        if (!detailRes.ok) throw new Error(`portfolio/items/${match.id}/ → ${detailRes.status}`)

        const detailJson = await detailRes.json()
        const detail: PortfolioDetail = detailJson?.data ?? detailJson

        // Normalise array fields (API may return pre-parsed arrays or raw JSON strings)
        detail.features     = parseArr<Feature>(detail.features     ?? detail.features_json)
        detail.brands       = parseArr<Brand>(detail.brands         ?? detail.brands_json)
        detail.testimonials = parseArr<Testimonial>(detail.testimonials ?? detail.testimonials_json)

        setItem(detail)
      } catch (err) {
        console.error('TradingDetailPage error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) load()
  }, [slug])

  // ── Testimonial auto-slide ─────────────────────────────────────────────
  const testimonials = item?.testimonials ?? []

  useEffect(() => {
    if (!testimonials.length) return
    timerRef.current = setInterval(
      () => setCurrentSlide(p => (p + 1) % testimonials.length),
      4000
    )
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [testimonials.length, slug])

  const stopTimer  = () => { if (timerRef.current) clearInterval(timerRef.current) }
  const startTimer = () => {
    stopTimer()
    if (testimonials.length)
      timerRef.current = setInterval(
        () => setCurrentSlide(p => (p + 1) % testimonials.length),
        4000
      )
  }
  const next = () => { stopTimer(); setCurrentSlide(p => (p + 1) % testimonials.length); startTimer() }
  const prev = () => { stopTimer(); setCurrentSlide(p => (p - 1 + testimonials.length) % testimonials.length); startTimer() }

  const features = item?.features ?? []
  const brands   = item?.brands   ?? []

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <InnerPageHeader />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="kv-loader"><div /><div /><div /></div>
      </div>
      <FooterTop /><Footer1 />
      <style>{`.kv-loader{display:flex;gap:8px;align-items:flex-end}.kv-loader div{width:6px;background:#000;border-radius:3px;animation:kvb .8s ease infinite}.kv-loader div:nth-child(1){height:20px;animation-delay:0s}.kv-loader div:nth-child(2){height:32px;animation-delay:.15s}.kv-loader div:nth-child(3){height:20px;animation-delay:.3s}@keyframes kvb{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </>
  )

  if (error || !item) return (
    <>
      <InnerPageHeader />
      <div className="container pt-120 mb-120 text-center">
        <h2>{error ? 'Failed to Load' : 'Product Not Found'}</h2>
        <Link href="/product" className="primary-btn1 black-bg mt-4 d-inline-flex">
          <span>Back to Portfolio</span><span>Back to Portfolio</span>
        </Link>
      </div>
      <FooterTop /><Footer1 />
    </>
  )

  const heroParas = (item.about_description || item.description || '')
    .split('\n\n').filter(Boolean)

  return (
    <>
      <InnerPageHeader />
      <Breadcrumb
  title={item.name}
  subtitle={`${item.hero_title}`}
  image={item.banner_image_url || item.image_url || '/assets/new-images/bm/bm-3.jpeg'}
/>

      {/* ── Hero / About ── */}
      <div className="product-details-top-area pt-120 mb-120" id="scroll-section">
        <div className="container">
          <div className="row gy-md-5 gy-4 align-items-lg-end">
            <div className="col-lg-8 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="details-content">
                <h2>{item.hero_title || item.about_title || `Kavalakat — ${item.name}`}</h2>
                {heroParas.length
                  ? heroParas.map((p, i) => <p key={i} style={{ textAlign: 'justify' }}>{p}</p>)
                  : <p style={{ textAlign: 'justify' }}>{item.description}</p>
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
        </div>
      </div>

      {/* ── Features / FAQ ── */}
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
  {(item.features_title || `${item.name} Features`).charAt(0).toUpperCase() + 
   (item.features_title || `${item.name} Features`).slice(1).toLowerCase()}
</h2>
                    <div className="accordion" id="accordionExample">
                      {features.map((feat, idx) => (
                        <div className="accordion-item mb-3 animated-accordion" key={idx}>
                          <h2 className="accordion-header">
                            <button
                              className={`accordion-button ${activeAcc === idx ? '' : 'collapsed'}`}
                              type="button"
                              onClick={() => setActiveAcc(activeAcc === idx ? null : idx)}
                            >{feat.title}</button>
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

      {/* ── Brands ── */}
      {brands.length > 0 && (
        <div className="steel-partners-section mb-120">
          <div className="container">
            <div className="row mb-50">
              <div className="col-12">
                <h2 className="section-main-title">{item.brands_heading || `${item.name} Brands We Supply`}</h2>
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

      {/* ── Testimonials ── */}
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
                    {[['clutch-logo', 'https://clutch.co/'], ['google-logo', 'https://www.google.com/']].map(([logo, href]) => (
                      <li className="mb-3" key={logo}>
                        <a href={href} className="d-flex align-items-center gap-3 p-3 border rounded text-decoration-none">
                          <div>
                            <span className="d-block small text-muted">Review On</span>
                            <Image width={60} height={20} src={`/assets/img/home1/icon/${logo}.svg`} alt={logo} />
                          </div>
                          <div>
                            <ul className="star d-flex gap-1 list-unstyled mb-1">
                              {[...Array(4)].map((_, i) => <li key={i}><i className="bi bi-star-fill text-warning" /></li>)}
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
                        <div
                          style={{ width: 50, height: 50, borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: '#555', flexShrink: 0 }}
                        >
                          {(testimonials[currentSlide]?.client_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="mb-0">{testimonials[currentSlide]?.client_name || 'Anonymous'}</h5>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slider controls */}
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

      <style>{`
        .testimonial-card{animation:fadeSlide .5s ease}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .animated-accordion .accordion-collapse{overflow:hidden;transition:max-height .4s ease-in-out}
        .steel-partners-section{background:#fff;padding:80px 0}
        .section-main-title{font-size:3rem;font-weight:800;color:#000;margin:0 0 40px;line-height:1.2;letter-spacing:-.5px}
        .card-wrapper-small{height:420px;width:100%}
        .slider-btn{width:40px;height:40px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,border-color .2s}
        .slider-btn:hover{background:#000;color:#fff;border-color:#000}
        .slider-btn:hover svg path{stroke:#fff}
        .slide-indicator{width:8px;height:8px;border-radius:50%;border:none;background:#ddd;cursor:pointer;padding:0;transition:background .3s,transform .3s}
        .slide-indicator.active{background:#000;transform:scale(1.3)}
        @media(max-width:992px){.card-wrapper-small{height:400px}.section-main-title{font-size:2.5rem}}
        @media(max-width:768px){.card-wrapper-small{height:380px}.section-main-title{font-size:2rem;text-align:center}}
        @media(max-width:576px){.card-wrapper-small{height:auto;min-height:360px}}
      `}</style>

      <FooterTop />
      <Footer1 />
    </>
  )
}

export default TradingDetailPage