"use client"
import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useState, Component, ReactNode } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: number
  name: string
  description: string
  image: string | null
  image_url: string | null
  category_name: string
  category_slug: string
  is_active: boolean
  order: number
}

// ─── Constants ────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.kavalakat.com/api"

// ─── URL builder ──────────────────────────────────────────────────────────

function buildHref(item: PortfolioItem): string {
  try {
    const slug = (item.name || '').toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const section = (item.category_slug || "").toLowerCase().trim()
    if (section === "trading")      return `/product/${slug}`
    if (section === "distribution") return `/distribution/${slug}`
    if (section === "services")     return `/services/${slug}`
    return `/portfolio/${slug}`
  } catch {
    return '/portfolio'
  }
}

// ─── Error Boundary ───────────────────────────────────────────────────────

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.error('PortfolioPage error caught by boundary:', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#aaa' }}>
          <p>Something went wrong loading the portfolio.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ marginTop: 16, padding: '10px 24px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Arrow SVGs ───────────────────────────────────────────────────────────

const ArrowSvg = () => (
  <svg width={18} height={19} viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.0891088 0.0541992H18V3.40711L3.38614 18.054L0 14.7011L9.98019 4.81886L0.0891088 4.90709V0.0541992Z" />
    <path d="M18.0004 18.0543V6.76025L13.1885 11.5249V18.0543H18.0004Z" />
  </svg>
)

const ArrowSvgSm = () => (
  <svg width={13} height={13} viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.0891088 0.0541992H18V3.40711L3.38614 18.054L0 14.7011L9.98019 4.81886L0.0891088 4.90709V0.0541992Z" fill="currentColor" />
    <path d="M18.0004 18.0543V6.76025L13.1885 11.5249V18.0543H18.0004Z" fill="currentColor" />
  </svg>
)

// ─── Product Card ─────────────────────────────────────────────────────────

const ProductCard = ({ href, src, alt, title, desc, delay }: {
  href: string; src: string; alt: string; title: string; desc: string; delay: string
}) => {
  const [imgSrc, setImgSrc] = useState(src || '/assets/new-images/new-images/about-imges/img-1.webp')

  return (
    <div className="pg-card wow animate fadeInDown" data-wow-delay={delay} data-wow-duration="1500ms">
      <div className="pg-card-img">
        <Image
          width={400} height={280}
          src={imgSrc}
          alt={alt || 'Product image'}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onError={() => setImgSrc('/assets/new-images/new-images/about-imges/img-1.webp')}
        />
        <Link href={href} className="pg-card-arrow"><ArrowSvg /></Link>
      </div>
      <div className="pg-card-body">
        <h4 className="pg-card-title"><Link href={href}>{title}</Link></h4>
        <p className="pg-card-desc">{desc}</p>
        <Link href={href} className="pg-card-more">View Details <ArrowSvgSm /></Link>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="pg-card-skeleton">
    <div className="sk-img" />
    <div className="sk-body">
      <div className="sk-line short" />
      <div className="sk-line" />
      <div className="sk-line medium" />
    </div>
  </div>
)

// ─── Section Block ────────────────────────────────────────────────────────

const SectionBlock = ({
  eyebrow, title, items, loading, skeletonCount
}: {
  eyebrow: string
  title: string
  items: PortfolioItem[]
  loading: boolean
  skeletonCount: number
}) => (
  <div className="pg-division">
    <div className="pg-division-top">
      <span className="pg-div-eyebrow">{eyebrow}</span>
      <div className="pg-div-head-row">
        <h2 className="pg-div-title" dangerouslySetInnerHTML={{ __html: title }} />
        <Link href="/contact" className="pg-div-cta">CONTACT US NOW <ArrowSvgSm /></Link>
      </div>
      <div className="pg-div-rule" />
    </div>
    <div className="pg-grid pg-grid-3">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => <CardSkeleton key={i} />)
        : items.length === 0
          ? (
            <div className="pg-empty">
              <p>No items available yet. Check back soon.</p>
            </div>
          )
          : items.map((item, index) => (
            <ProductCard
              key={item.id}
              href={buildHref(item)}
              src={item.image_url || item.image || `/assets/new-images/products/p-${(index % 6) + 1}.jpeg`}
              alt={item.name}
              title={item.name}
              desc={item.description || ''}
              delay={`${(index + 1) * 100}ms`}
            />
          ))
      }
    </div>
  </div>
)

// ─── Inner Content ────────────────────────────────────────────────────────

const PortfolioContent = () => {
  const [trading,      setTrading]      = useState<PortfolioItem[]>([])
  const [distribution, setDistribution] = useState<PortfolioItem[]>([])
  const [services,     setServices]     = useState<PortfolioItem[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${API}/portfolio/page/`, { cache: 'no-store' })

        if (!res.ok) throw new Error(`Server returned ${res.status} ${res.statusText}`)

        const json = await res.json()
        const page = json?.data ?? json

        if (cancelled) return

        setTrading(      Array.isArray(page?.trading)      ? page.trading      : [])
        setDistribution( Array.isArray(page?.distribution) ? page.distribution : [])
        setServices(     Array.isArray(page?.services)     ? page.services     : [])

      } catch (err: unknown) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'Failed to load portfolio data'
        console.error('Portfolio fetch error:', msg)
        setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="pg-page pt-120 mb-120" id="scroll-section">
      <div className="container">

        {error && (
          <div className="pg-error-banner">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
            <span>Could not load portfolio data — {error}</span>
          </div>
        )}

        <SectionBlock
          eyebrow="01 — Trading"
          title="Building Materials<br/>&amp; Products"
          items={trading}
          loading={loading}
          skeletonCount={6}
        />
        <SectionBlock
          eyebrow="02 — Distribution"
          title="Our Brand<br/>Partners"
          items={distribution}
          loading={loading}
          skeletonCount={5}
        />
        <SectionBlock
          eyebrow="03 — Services"
          title="Hospitality &amp;<br/>Group Ventures"
          items={services}
          loading={loading}
          skeletonCount={3}
        />

      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

const PortfolioPage = () => (
  <>
    <InnerPageHeader />
    <Breadcrumb
      title="Our Portfolio"
      subtitle="Products Power Progress — Explore Our Offerings."
      image='/assets/new-images/bm/bm-2.jpeg'
    />
    <ErrorBoundary>
      <PortfolioContent />
    </ErrorBoundary>

    <style>{`
      .pg-page { background: #fff; }
      .pg-error-banner { display:flex; align-items:center; gap:10px; background:#fff8e1; border:1px solid #ffe082; color:#795548; padding:12px 20px; border-radius:6px; font-size:0.85rem; margin-bottom:40px; }
      .pg-division { padding:0 0 100px; border-bottom:1px solid #ebebeb; margin-bottom:80px; }
      .pg-division:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }
      .pg-division-top { padding:56px 0 0; margin-bottom:48px; }
      .pg-div-eyebrow { display:block; font-size:0.72rem; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#aaa; margin-bottom:14px; }
      .pg-div-head-row { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:32px; }
      .pg-div-title { font-size:clamp(2.2rem,4.5vw,3.6rem); font-weight:800; color:#0a0a0a; line-height:1.1; margin:0; letter-spacing:-1.5px; }
      .pg-div-cta { display:inline-flex; align-items:center; gap:8px; font-size:0.7rem; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:#999; text-decoration:underline; text-underline-offset:5px; text-decoration-color:#ccc; flex-shrink:0; padding-bottom:4px; transition:color .2s,text-decoration-color .2s; }
      .pg-div-cta:hover { color:#000; text-decoration-color:#000; }
      .pg-div-rule { width:100%; height:1px; background:#e0e0e0; }
      .pg-grid { display:grid; gap:24px; }
      .pg-grid-3 { grid-template-columns:repeat(3,1fr); }
      .pg-empty { grid-column:1/-1; text-align:center; padding:60px 20px; color:#aaa; font-size:0.9rem; border:2px dashed #e0e0e0; border-radius:8px; }
      .pg-card { border:1px solid #ebebeb; border-radius:4px; display:flex; flex-direction:column; background:#fff; transition:background .3s ease,box-shadow .3s ease; position:relative; overflow:hidden; }
      .pg-card:hover { background:#fafafa; box-shadow:0 4px 24px rgba(0,0,0,.07); }
      .pg-card-img { position:relative; width:100%; overflow:hidden; aspect-ratio:4/3; background:#f4f4f4; }
      .pg-card-img img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s ease; }
      .pg-card:hover .pg-card-img img { transform:scale(1.05); }
      .pg-card-arrow { position:absolute; bottom:0; right:0; width:40px; height:40px; background:#000; display:flex; align-items:center; justify-content:center; opacity:0; transform:translate(4px,4px); transition:opacity .25s ease,transform .25s ease; }
      .pg-card-arrow svg { fill:#fff; }
      .pg-card:hover .pg-card-arrow { opacity:1; transform:translate(0,0); }
      .pg-card-body { padding:24px 26px 28px; display:flex; flex-direction:column; gap:10px; flex:1; }
      .pg-card-title { font-size:0.95rem; font-weight:700; margin:0; line-height:1.3; }
      .pg-card-title a { color:#0a0a0a; text-decoration:none; transition:color .2s; }
      .pg-card-title a:hover { color:#444; }
      .pg-card-desc { font-size:0.8rem; color:#777; line-height:1.7; margin:0; flex:1; }
      .pg-card-more { display:inline-flex; align-items:center; gap:6px; font-size:0.68rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#000; text-decoration:none; margin-top:4px; transition:gap .2s; }
      .pg-card-more:hover { gap:10px; }
      .pg-card-skeleton { border:1px solid #ebebeb; border-radius:4px; overflow:hidden; }
      .sk-img { aspect-ratio:4/3; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
      .sk-body { padding:24px 26px; display:flex; flex-direction:column; gap:10px; }
      .sk-line { height:12px; border-radius:4px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
      .sk-line.short { width:40%; }
      .sk-line.medium { width:60%; }
      @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      @media (max-width:768px) {
        .pg-grid-3 { grid-template-columns:repeat(2,1fr); gap:16px; }
        .pg-div-head-row { flex-direction:column; align-items:flex-start; gap:16px; }
        .pg-div-title { font-size:2rem; letter-spacing:-0.5px; }
        .pg-division { padding-bottom:60px; margin-bottom:40px; }
        .pg-division-top { padding-top:40px; margin-bottom:32px; }
      }
      @media (max-width:480px) { .pg-grid-3 { grid-template-columns:1fr; gap:12px; } }
    `}</style>

    <FooterTop />
    <Footer1 />
  </>
)

export default PortfolioPage