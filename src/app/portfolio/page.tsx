"use client"
// FILE PATH: src/app/product/page.tsx

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import InnerPageHeader from '@/components/InnerPageHeader'
import FooterTop from '@/components/FooterTop'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  order: number
  is_active: boolean
  item_count: number
}

interface PortfolioItem {
  id: number
  name: string
  slug?: string
  description: string
  image_url: string | null
  tags: string
  category: number
  category_name: string
  category_slug: string
  hero_title: string
  banner_image_url: string | null
  about_title: string
  features_title: string
  brands_heading: string
  is_featured: boolean
  is_active: boolean
  order: number
  _source?: 'portfolio' | 'service'
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE        = 'https://api.kavalakat.com/api/portfolio'
const API         = 'https://api.kavalakat.com/api'
const PLACEHOLDER = '/assets/new-images/bm/bm-3.jpeg'

// Portfolio category slugs that are "services" — items in these categories
// come from /api/portfolio/items/ and link to /portfolio/[cat]/[name]
// NOT to /services/[slug]
const SERVICE_CATEGORY_SLUGS = new Set(['services', 'service', 'hospitality'])

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchAllCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE}/categories/`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    const cats: Category[] = json.data ?? json.results ?? (Array.isArray(json) ? json : [])
    return cats.filter((c: Category) => c.is_active).sort((a, b) => a.order - b.order)
  } catch { return [] }
}

async function fetchAllPortfolioItems(): Promise<PortfolioItem[]> {
  let page = 1
  const collected: PortfolioItem[] = []
  while (true) {
    try {
      const res = await fetch(`${BASE}/items/?page=${page}`, { cache: 'no-store' })
      if (!res.ok) break
      const json = await res.json()
      const items: PortfolioItem[] = (json.data ?? json.results ?? (Array.isArray(json) ? json : []))
        .filter((i: PortfolioItem) => i.is_active)
        .map((i: PortfolioItem) => ({ ...i, _source: 'portfolio' as const }))
      collected.push(...items)
      if (!json.pagination?.next && !json.next) break
      page++
    } catch { break }
  }
  return collected
}

async function fetchAllServiceItems(): Promise<PortfolioItem[]> {
  let page = 1
  const collected: PortfolioItem[] = []
  while (true) {
    try {
      const res = await fetch(`${API}/services/?page=${page}`, {
        headers: { Accept: 'application/json' }, cache: 'no-store',
      })
      if (!res.ok) break
      const json = await res.json()
      const raw: any[] = json?.data ?? json?.results ?? (Array.isArray(json) ? json : [])
      raw
        .filter((s: any) => s.is_active !== false && s.slug && s.name)
        .forEach((s: any) => {
          collected.push({
            id:               s.id,
            name:             s.name,
            slug:             s.slug,            // ← real API slug, used for href
            description:      s.description ?? '',
            image_url:        s.image_url ?? s.image ?? null,
            banner_image_url: null,
            tags:             '',
            category:         0,
            category_name:    'Services',
            category_slug:    'services',
            hero_title:       s.description ?? '',
            about_title:      '',
            features_title:   '',
            brands_heading:   '',
            is_featured:      s.is_featured ?? false,
            is_active:        true,
            order:            s.order ?? 0,
            _source:          'service',          // ← marks as /api/services/ item
          })
        })
      const nextUrl: string | null = json?.pagination?.next ?? json?.next ?? null
      if (!nextUrl) break
      page++
    } catch { break }
  }
  return collected
}

// ─── Slug helper ──────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Build the correct href for a portfolio item.
 *
 * Rules:
 *  - _source === 'service'  → /services/[item.slug]
 *    These come from /api/services/ and have a real CMS slug.
 *
 *  - _source === 'portfolio', even if category is "services" / "hospitality"
 *    → /portfolio/[category_slug]/[name-slugified]
 *    These are portfolio items that happen to sit in a service-named category.
 *    They must NOT go to /services/ because that page fetches from /api/services/.
 */
function buildHref(item: PortfolioItem): string {
  if (item._source === 'service') {
    return `/services/${item.slug ?? slugify(item.name)}`
  }
  return `/portfolio/${item.category_slug}/${slugify(item.name)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProductPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [allItems,   setAllItems]   = useState<PortfolioItem[]>([])
  const [activeSlug, setActiveSlug] = useState<string>('all')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const [cats, portfolioItems, serviceItems] = await Promise.all([
          fetchAllCategories(),
          fetchAllPortfolioItems(),
          fetchAllServiceItems(),
        ])

        // Deduplicate by name — portfolio wins over service if same name
        const seen   = new Set<string>()
        const merged: PortfolioItem[] = []

        for (const item of portfolioItems) {
          const key = item.name.toLowerCase().trim()
          if (!seen.has(key)) { seen.add(key); merged.push(item) }
        }
        for (const item of serviceItems) {
          const key = item.name.toLowerCase().trim()
          if (!seen.has(key)) { seen.add(key); merged.push(item) }
        }

        // Ensure a SERVICES tab exists if we have service items
        const hasServiceCat = cats.some(c => SERVICE_CATEGORY_SLUGS.has(c.slug.toLowerCase()))
        const serviceCount  = merged.filter(i =>
          SERVICE_CATEGORY_SLUGS.has(i.category_slug.toLowerCase()) || i._source === 'service'
        ).length

        const finalCats = hasServiceCat
          ? cats
          : serviceCount > 0
            ? [...cats, {
                id: -1, name: 'Services', slug: 'services',
                description: '', icon: '', order: 999,
                is_active: true, item_count: serviceCount,
              }].sort((a, b) => a.order - b.order)
            : cats

        setCategories(finalCats)
        setAllItems(merged)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Filter ────────────────────────────────────────────────────────────────
  const visibleItems = (() => {
    if (activeSlug === 'all') return allItems
    if (SERVICE_CATEGORY_SLUGS.has(activeSlug)) {
      return allItems.filter(i =>
        SERVICE_CATEGORY_SLUGS.has(i.category_slug.toLowerCase()) || i._source === 'service'
      )
    }
    return allItems.filter(i => i.category_slug === activeSlug)
  })()

  // ── Loading ───────────────────────────────────────────────────────────────
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

  if (error) return (
    <>
      <InnerPageHeader />
      <div className="container pt-120 mb-120 text-center">
        <h2>Something went wrong</h2>
        <p className="mb-4" style={{ color: '#666' }}>Unable to load products. Please try again.</p>
        <button onClick={() => window.location.reload()} className="primary-btn1 black-bg d-inline-flex">
          <span>Try Again</span><span>Try Again</span>
        </button>
      </div>
      <FooterTop /><Footer1 />
    </>
  )

  return (
    <>
      <InnerPageHeader />

      <Breadcrumb
        title="Our Products"
        subtitle="Products Power Progress — Explore Our Offer"
        image={PLACEHOLDER}
      />

      {/* ── Filter Tabs ── */}
      <div className="product-filter-section pt-80">
        <div className="container">
          <div className="filter-tab-wrapper">
            <button
              className={`filter-tab-btn ${activeSlug === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSlug('all')}
            >
              All <span className="tab-count">{allItems.length}</span>
            </button>

            {categories.map(cat => {
              const isServiceTab = SERVICE_CATEGORY_SLUGS.has(cat.slug.toLowerCase())
              const count = isServiceTab
                ? allItems.filter(i =>
                    SERVICE_CATEGORY_SLUGS.has(i.category_slug.toLowerCase()) || i._source === 'service'
                  ).length
                : allItems.filter(i => i.category_slug === cat.slug).length

              return (
                <button
                  key={cat.id}
                  className={`filter-tab-btn ${activeSlug === cat.slug ? 'active' : ''}`}
                  onClick={() => setActiveSlug(cat.slug)}
                >
                  {cat.name} <span className="tab-count">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="product-grid-section pt-60 mb-120">
        <div className="container">
          {visibleItems.length === 0 ? (
            <div className="text-center py-5">
              <p style={{ color: '#888', fontSize: '1.1rem' }}>No products found in this category.</p>
            </div>
          ) : (
            <div className="row g-4">
              {visibleItems.map(item => (
                <div key={`${item._source}-${item.id}`} className="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                  <ProductCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FooterTop />
      <Footer1 />
      <style>{pageCss}</style>
    </>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({ item }: { item: PortfolioItem }) => {
  const href  = buildHref(item)
  const image = item.image_url || item.banner_image_url || PLACEHOLDER
  const label = item.hero_title || item.about_title || item.features_title || item.category_name

  return (
    <Link href={href} className="product-card d-block text-decoration-none">
      <div className="product-card-inner">
        <div className="product-card-img-wrap">
          <Image
            src={image}
            alt={item.name}
            width={400}
            height={260}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span className="product-card-badge">{item.category_name}</span>
        </div>
        <div className="product-card-body">
          <h4 className="product-card-title">{item.name}</h4>
          {label && label !== item.name && (
            <p className="product-card-sub">{label}</p>
          )}
          <div className="product-card-arrow">
            <svg width={20} height={20} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
              <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const loaderCss = `
  .kv-loader{display:flex;gap:8px;align-items:flex-end}
  .kv-loader div{width:6px;background:#000;border-radius:3px;animation:kvb .8s ease infinite}
  .kv-loader div:nth-child(1){height:20px;animation-delay:0s}
  .kv-loader div:nth-child(2){height:32px;animation-delay:.15s}
  .kv-loader div:nth-child(3){height:20px;animation-delay:.3s}
  @keyframes kvb{0%,100%{opacity:.3}50%{opacity:1}}
`

const pageCss = `
  ${loaderCss}

  .product-filter-section { background: #fff; }
  .filter-tab-wrapper { display:flex; flex-wrap:wrap; gap:12px; padding-bottom:32px; border-bottom:2px solid #f0f0f0; }
  .filter-tab-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 22px; border:2px solid #e0e0e0; border-radius:50px; background:#fff; color:#555; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .25s ease; text-transform:uppercase; letter-spacing:.5px; }
  .filter-tab-btn:hover { border-color:#000; color:#000; }
  .filter-tab-btn.active { background:#000; border-color:#000; color:#fff; }
  .tab-count { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; font-size:.75rem; font-weight:700; background:rgba(0,0,0,.1); }
  .filter-tab-btn.active .tab-count { background:rgba(255,255,255,.25); }

  .product-card { color:inherit; cursor:pointer; }
  .product-card-inner { border:1px solid #e8e8e8; border-radius:12px; overflow:hidden; background:#fff; transition:transform .3s ease,box-shadow .3s ease; height:100%; display:flex; flex-direction:column; }
  .product-card:hover .product-card-inner { transform:translateY(-6px); box-shadow:0 20px 50px rgba(0,0,0,.12); }
  .product-card-img-wrap { position:relative; width:100%; height:220px; overflow:hidden; background:#f5f5f5; flex-shrink:0; }
  .product-card-img-wrap img { transition:transform .5s ease; }
  .product-card:hover .product-card-img-wrap img { transform:scale(1.06); }
  .product-card-badge { position:absolute; top:14px; left:14px; background:#000; color:#fff; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.8px; padding:4px 12px; border-radius:50px; }
  .product-card-body { padding:20px 24px 22px; display:flex; flex-direction:column; flex:1; position:relative; }
  .product-card-title { font-size:1.15rem; font-weight:800; color:#111; margin:0 0 6px; text-transform:uppercase; letter-spacing:.5px; line-height:1.3; padding-right:36px; }
  .product-card-sub { font-size:.85rem; color:#888; margin:0; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .product-card-arrow { position:absolute; bottom:22px; right:22px; width:36px; height:36px; border-radius:50%; background:#f5f5f5; display:flex; align-items:center; justify-content:center; color:#000; transition:background .25s,color .25s,transform .25s; }
  .product-card:hover .product-card-arrow { background:#000; color:#fff; transform:rotate(45deg); }

  .pt-80 { padding-top:80px; }
  .pt-60 { padding-top:60px; }

  @media(max-width:768px){
    .filter-tab-wrapper { gap:8px; }
    .filter-tab-btn { padding:8px 16px; font-size:.8rem; }
    .product-card-img-wrap { height:190px; }
  }
  @media(max-width:576px){
    .product-card-img-wrap { height:180px; }
    .product-card-title { font-size:1rem; }
  }
`

export default ProductPage