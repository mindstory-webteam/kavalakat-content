'use client'

import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'
import { buildPortfolioHref, normalisePortfolioItem } from '@/lib/api'
import type { PortfolioItem } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.kavalakat.com/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingItem {
  id: number
  name: string
  slug: string
  href: string
  imageUrl: string
  description: string
  categoryName: string
  categoryColor: string
  order: number
}

interface ServiceListItem {
  id: number
  name: string
  slug: string
  description: string
  image_url: string | null
  icon: string
  is_active: boolean
  is_featured: boolean
  order: number
  category_detail?: {
    id: number
    name: string
    slug: string
    color: string
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function unwrapEnvelope(json: any): any {
  if (json !== null && typeof json === 'object' && !Array.isArray(json) && 'success' in json && 'data' in json) {
    return json.data
  }
  return json
}

function toSlug(s: string): string {
  return (s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const FALLBACK_IMG = '/assets/new-images/products/p-1.jpeg'

function cleanSrc(src: string | null | undefined): string {
  const s = (src || '').trim()
  return s && s !== 'null' ? s : FALLBACK_IMG
}

// ─── Safe Image ───────────────────────────────────────────────────────────────

function SafeImage({ src, alt, width, height, style }: {
  src: string; alt: string; width: number; height: number
  style?: React.CSSProperties
}) {
  const [imgSrc, setImgSrc] = useState(cleanSrc(src))
  useEffect(() => setImgSrc(cleanSrc(src)), [src])
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
      onError={() => setImgSrc(FALLBACK_IMG)}
    />
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-lg-4 col-md-6">
          <div className="portfolio-card-skeleton">
            <div className="skel-img" />
            <div className="skel-body">
              <div className="skel-tag" />
              <div className="skel-title" />
              <div className="skel-desc" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioListingPage() {
  const [tradingItems,      setTradingItems]      = useState<ListingItem[]>([])
  const [distributionItems, setDistributionItems] = useState<ListingItem[]>([])
  const [serviceItems,      setServiceItems]      = useState<ListingItem[]>([])
  const [loadingPortfolio,  setLoadingPortfolio]  = useState(true)
  const [loadingServices,   setLoadingServices]   = useState(true)

  // ── Fetch trading + distribution from portfolio API ───────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingPortfolio(true)
      try {
        const trading:      ListingItem[] = []
        const distribution: ListingItem[] = []

        // Try portfolio/page/ first
        try {
          const res = await fetch(`${API}/portfolio/page/`)
          if (res.ok) {
            const json = await res.json()
            const page = unwrapEnvelope(json)
            const hasData = page?.trading?.length || page?.distribution?.length
            if (hasData) {
              ;(page.trading ?? []).forEach((i: PortfolioItem) => {
                const n = normalisePortfolioItem(i)
                trading.push({
                  id: n.id, name: n.name, slug: toSlug(n.name),
                  href: buildPortfolioHref(n),
                  imageUrl: (n as any).imageUrl || FALLBACK_IMG,
                  description: (n as any).description || '',
                  categoryName: (n as any).categoryName || 'Trading',
                  categoryColor: (n as any).categoryColor || '#000',
                  order: (n as any).order ?? 0,
                })
              })
              ;(page.distribution ?? []).forEach((i: PortfolioItem) => {
                const n = normalisePortfolioItem(i)
                distribution.push({
                  id: n.id, name: n.name, slug: toSlug(n.name),
                  href: buildPortfolioHref(n),
                  imageUrl: (n as any).imageUrl || FALLBACK_IMG,
                  description: (n as any).description || '',
                  categoryName: (n as any).categoryName || 'Distribution',
                  categoryColor: (n as any).categoryColor || '#000',
                  order: (n as any).order ?? 0,
                })
              })
              setTradingItems(trading)
              setDistributionItems(distribution)
              return
            }
          }
        } catch { /* fall through */ }

        // Fallback: flat items list
        const res  = await fetch(`${API}/portfolio/items/`)
        if (!res.ok) return
        const json = await res.json()
        const data = unwrapEnvelope(json)
        const allItems: PortfolioItem[] = Array.isArray(data) ? data : (data.results ?? data.items ?? [])

        allItems
          .filter((i: any) => i.is_active !== false)
          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
          .forEach((item: PortfolioItem) => {
            const n    = normalisePortfolioItem(item)
            const href = buildPortfolioHref(n)
            const entry: ListingItem = {
              id: n.id, name: n.name, slug: toSlug(n.name), href,
              imageUrl: (n as any).imageUrl || FALLBACK_IMG,
              description: (n as any).description || '',
              categoryName: (n as any).categoryName || '',
              categoryColor: (n as any).categoryColor || '#000',
              order: (n as any).order ?? 0,
            }
            if (href.startsWith('/product/'))           trading.push(entry)
            else if (href.startsWith('/distribution/')) distribution.push(entry)
          })

        setTradingItems(trading)
        setDistributionItems(distribution)
      } catch {
        // silently ignore
      } finally {
        setLoadingPortfolio(false)
      }
    }
    load()
  }, [])

  // ── Fetch services from /api/services/ ───────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingServices(true)
      try {
        const services: ListingItem[] = []
        let url: string | null = `${API}/services/?is_active=true`
        while (url) {
          const res  = await fetch(url, { cache: 'no-store' })
          if (!res.ok) break
          const json = await res.json()
          const items: ServiceListItem[] = Array.isArray(json?.results)
            ? json.results
            : Array.isArray(json?.data)
              ? json.data
              : Array.isArray(json) ? json : []
          items.forEach((svc) => {
            if (svc.is_active === false) return
            const slug = svc.slug || toSlug(svc.name)
            services.push({
              id:            svc.id,
              name:          svc.name,
              slug,
              href:          `/services/${slug}`,
              imageUrl:      cleanSrc(svc.image_url),
              description:   svc.description || '',
              categoryName:  svc.category_detail?.name || 'Services',
              categoryColor: svc.category_detail?.color || '#0057C8',
              order:         svc.order ?? 0,
            })
          })
          url = json?.next ?? null
        }
        services.sort((a, b) => a.order - b.order)
        setServiceItems(services)
      } catch {
        // silently ignore
      } finally {
        setLoadingServices(false)
      }
    }
    load()
  }, [])

  const isLoading = loadingPortfolio || loadingServices
  const hasAny    = tradingItems.length || distributionItems.length || serviceItems.length

  return (
    <>
      <InnerPageHeader />

      <Breadcrumb
        title="Our Portfolio"
        subtitle="Trading, Distribution & Services — All Under One Roof."
        image="/assets/new-images/bm/bm-3.jpeg"
      />

      <div className="portfolio-listing-page pt-120 mb-120">
        <div className="container">

          {/* ── Section intro ── */}
          <div className="row mb-60">
            <div className="col-lg-8">
              <div className="section-title">
                <span>What We Do</span>
                <h2>Our Business Portfolio</h2>
              </div>
              <p style={{ color: '#666', lineHeight: 1.85, marginTop: 16 }}>
                Kavalakat Group operates across trading, distribution, and hospitality services — bringing trust, quality, and expertise to every segment we serve.
              </p>
            </div>
          </div>

          {/* ── Loading state ── */}
          {isLoading && !hasAny && (
            <div className="row g-4">
              <CardSkeleton count={6} />
            </div>
          )}

          {/* ── Trading Section ── */}
          {(tradingItems.length > 0 || loadingPortfolio) && (
            <div className="portfolio-section mb-80">
              <div className="portfolio-section-header mb-40">
                <div className="portfolio-section-label">Trading</div>
                <h3 className="portfolio-section-title">Trading Division</h3>
                <div className="portfolio-section-line" />
              </div>
              <div className="row g-4">
                {loadingPortfolio && tradingItems.length === 0
                  ? <CardSkeleton count={3} />
                  : tradingItems.map((item) => (
                    <div key={item.id} className="col-lg-4 col-md-6">
                      <PortfolioCard item={item} />
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── Distribution Section ── */}
          {(distributionItems.length > 0 || loadingPortfolio) && (
            <div className="portfolio-section mb-80">
              <div className="portfolio-section-header mb-40">
                <div className="portfolio-section-label">Distribution</div>
                <h3 className="portfolio-section-title">Distribution Division</h3>
                <div className="portfolio-section-line" />
              </div>
              <div className="row g-4">
                {loadingPortfolio && distributionItems.length === 0
                  ? <CardSkeleton count={3} />
                  : distributionItems.map((item) => (
                    <div key={item.id} className="col-lg-4 col-md-6">
                      <PortfolioCard item={item} />
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── Services Section ── */}
          {(serviceItems.length > 0 || loadingServices) && (
            <div className="portfolio-section mb-80">
              <div className="portfolio-section-header mb-40">
                <div className="portfolio-section-label">Services</div>
                <h3 className="portfolio-section-title">Services Division</h3>
                <div className="portfolio-section-line" />
              </div>
              <div className="row g-4">
                {loadingServices && serviceItems.length === 0
                  ? <CardSkeleton count={3} />
                  : serviceItems.map((item) => (
                    <div key={item.id} className="col-lg-4 col-md-6">
                      <PortfolioCard item={item} />
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {!isLoading && !hasAny && (
            <div className="text-center py-5">
              <p style={{ color: '#777', fontSize: '1.1rem' }}>No portfolio items found.</p>
              <Link href="/contact" className="primary-btn1 black-bg mt-4 d-inline-flex">
                <span>Contact Us</span><span>Contact Us</span>
              </Link>
            </div>
          )}

        </div>
      </div>

      <style>{`
        /* ── Section header ── */
        .portfolio-section-header { display: flex; align-items: center; gap: 20px; }
        .portfolio-section-label {
          background: #000; color: #fff; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; padding: 5px 14px;
          white-space: nowrap;
        }
        .portfolio-section-title { margin: 0; font-size: 1.75rem; font-weight: 800; color: #000; white-space: nowrap; }
        .portfolio-section-line { flex: 1; height: 1px; background: #e0e0e0; }

        /* ── Card ── */
        .portfolio-card {
          position: relative; overflow: hidden; background: #fff;
          border: 1px solid #e8e8e8; transition: box-shadow 0.3s ease;
          height: 100%;
        }
        .portfolio-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
        .portfolio-card-img {
          position: relative; height: 240px; overflow: hidden; background: #f5f5f5;
        }
        .portfolio-card-img img { transition: transform 0.5s ease; }
        .portfolio-card:hover .portfolio-card-img img { transform: scale(1.06); }
        .portfolio-card-overlay {
          position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .portfolio-card:hover .portfolio-card-overlay { opacity: 1; }
        .portfolio-card-overlay-btn {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          background: #fff; color: #000; font-size: 0.75rem; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase; padding: 10px 22px;
          white-space: nowrap; text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .portfolio-card-overlay-btn:hover { background: #000; color: #fff; }
        .portfolio-card-body { padding: 24px 24px 28px; }
        .portfolio-card-tag {
          display: inline-block; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; color: #0057C8;
          margin-bottom: 10px;
        }
        .portfolio-card-name {
          font-size: 1.15rem; font-weight: 800; color: #000; margin: 0 0 10px;
          line-height: 1.3;
        }
        .portfolio-card-desc {
          font-size: 0.875rem; color: #777; line-height: 1.7; margin: 0 0 18px;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .portfolio-card-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: #000; text-decoration: none;
          border-bottom: 1.5px solid #000; padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .portfolio-card-link:hover { color: #0057C8; border-color: #0057C8; }
        .portfolio-card-link svg { transition: transform 0.2s; }
        .portfolio-card-link:hover svg { transform: translateX(4px); }

        /* ── Skeleton ── */
        .portfolio-card-skeleton { border: 1px solid #e8e8e8; overflow: hidden; }
        .skel-img { height: 240px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .skel-body { padding: 24px; }
        .skel-tag  { height: 10px; width: 60px; background: #e8e8e8; border-radius: 3px; margin-bottom: 12px; }
        .skel-title{ height: 20px; width: 70%;  background: #e8e8e8; border-radius: 3px; margin-bottom: 10px; }
        .skel-desc { height: 14px; width: 90%;  background: #e8e8e8; border-radius: 3px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        @media (max-width: 768px) {
          .portfolio-section-title { font-size: 1.35rem; }
          .portfolio-card-img { height: 200px; }
        }
      `}</style>

      <FooterTop />
      <Footer1 />
    </>
  )
}

// ─── Portfolio Card ───────────────────────────────────────────────────────────

function PortfolioCard({ item }: { item: ListingItem }) {
  return (
    <Link href={item.href} className="portfolio-card d-block text-decoration-none">
      <div className="portfolio-card-img">
        <SafeImage
          src={item.imageUrl}
          alt={item.name}
          width={400}
          height={240}
        />
        <div className="portfolio-card-overlay">
          <span className="portfolio-card-overlay-btn">View Details</span>
        </div>
      </div>
      <div className="portfolio-card-body">
        {item.categoryName && (
          <span
            className="portfolio-card-tag"
            style={{ color: item.categoryColor || '#0057C8' }}
          >
            {item.categoryName}
          </span>
        )}
        <h4 className="portfolio-card-name">{item.name}</h4>
        {item.description && (
          <p className="portfolio-card-desc">{item.description}</p>
        )}
        <span className="portfolio-card-link">
          Explore
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </Link>
  )
}