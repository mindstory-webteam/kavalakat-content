"use client"
// ✅ FILE PATH: src/hooks/useNavData.ts
// Single source of truth for all navigation data (header mega-menu + footer columns).
// Imported by: Header, InnerPageHeader, Footer.

import { useEffect, useState } from 'react'

// ── Shared types ──────────────────────────────────────────────────────────────
export interface NavEntry { name: string; href: string }
export interface NavGroup { label: string; slug: string; order: number; items: NavEntry[] }
export interface FooterNavGroups {
  trading:      NavEntry[]
  distribution: NavEntry[]
  services:     NavEntry[]
  /** any extra categories beyond the 3 fixed columns */
  extra:        { label: string; slug: string; items: NavEntry[] }[]
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SERVICE_CATEGORY_SLUGS = new Set(['services', 'service', 'hospitality'])

const SLUG_PRIORITY: Record<string, number> = {
  trading: 1, distribution: 2,
  services: 3, service: 3, hospitality: 3,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return (str || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Canonical href builder — identical logic to ProductPage.buildHref.
 *
 * _source === 'service'   → /services/[item.slug]   (from /api/services/)
 * _source === 'portfolio' → /portfolio/[cat]/[name]  (even if cat is "services")
 */
function buildHref(item: {
  _source:       'portfolio' | 'service'
  slug?:         string
  name:          string
  category_slug: string
}): string {
  if (item._source === 'service') {
    return `/services/${item.slug ?? slugify(item.name)}`
  }
  return `/portfolio/${item.category_slug}/${slugify(item.name)}`
}

// ── API fetchers (internal) ───────────────────────────────────────────────────

interface RawCat {
  id: number; name: string; slug: string; order: number; is_active: boolean
}

interface RawPortfolioItem {
  id: number; name: string; slug?: string
  category_slug: string; is_active: boolean; order?: number
}

interface RawServiceItem {
  id: number; name: string; slug: string; is_active?: boolean; order?: number
}

async function fetchCategories(api: string): Promise<RawCat[]> {
  try {
    const res: Response = await fetch(`${api}/portfolio/categories/`, {
      headers: { Accept: 'application/json' }, cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    const raw: any[] = json?.data ?? json?.results ?? (Array.isArray(json) ? json : [])
    return raw
      .filter((c: any) => c.is_active !== false)
      .sort((a: any, b: any) => {
        const pa = SLUG_PRIORITY[a.slug?.toLowerCase()] ?? (10 + (a.order ?? 99))
        const pb = SLUG_PRIORITY[b.slug?.toLowerCase()] ?? (10 + (b.order ?? 99))
        return pa - pb
      }) as RawCat[]
  } catch { return [] }
}

async function fetchAllPortfolioItems(api: string): Promise<RawPortfolioItem[]> {
  const collected: RawPortfolioItem[] = []
  let page = 1
  while (true) {
    try {
      const res: Response = await fetch(`${api}/portfolio/items/?page=${page}`, {
        cache: 'no-store',
      })
      if (!res.ok) break
      const json = await res.json()
      const items: any[] = json?.data ?? json?.results ?? (Array.isArray(json) ? json : [])
      items.filter((i: any) => i.is_active !== false).forEach((i: any) => collected.push(i))
      if (!json?.pagination?.next && !json?.next) break
      page++
    } catch { break }
  }
  return collected
}

async function fetchAllServiceItems(api: string): Promise<RawServiceItem[]> {
  const collected: RawServiceItem[] = []
  let page = 1
  while (true) {
    try {
      const res: Response = await fetch(`${api}/services/?page=${page}`, {
        headers: { Accept: 'application/json' }, cache: 'no-store',
      })
      if (!res.ok) break
      const json = await res.json()
      const raw: any[] = json?.data ?? json?.results ?? (Array.isArray(json) ? json : [])
      raw
        .filter((s: any) => s.is_active !== false && s.slug && s.name)
        .forEach((s: any) => collected.push(s as RawServiceItem))
      const nextUrl: string | null = json?.pagination?.next ?? json?.next ?? null
      if (!nextUrl) break
      page++
    } catch { break }
  }
  return collected
}

// ── Core builder (shared logic) ───────────────────────────────────────────────

interface NavData {
  /** Ordered groups for the header mega-menu Portfolio dropdown */
  navGroups: NavGroup[]
  /** Flat columns for the footer */
  footer:    FooterNavGroups
}

async function buildNavData(api: string): Promise<NavData> {
  const [cats, portfolioItems, serviceItems] = await Promise.all([
    fetchCategories(api),
    fetchAllPortfolioItems(api),
    fetchAllServiceItems(api),
  ])

  // ── Build entries with canonical hrefs ──────────────────────────────────
  const portEntries = portfolioItems.map(i => ({
    name:          i.name,
    category_slug: (i.category_slug || '').toLowerCase(),
    href:          buildHref({ _source: 'portfolio', slug: i.slug, name: i.name, category_slug: (i.category_slug || '').toLowerCase() }),
  }))

  const svcEntries = serviceItems.map(s => ({
    name:          s.name,
    category_slug: 'services',
    href:          buildHref({ _source: 'service', slug: s.slug, name: s.name, category_slug: 'services' }),
  }))

  // ── Group portfolio items by category_slug ───────────────────────────────
  const catMap = new Map<string, NavEntry[]>()
  portEntries.forEach(e => {
    if (!catMap.has(e.category_slug)) catMap.set(e.category_slug, [])
    catMap.get(e.category_slug)!.push({ name: e.name, href: e.href })
  })

  // ── Build header NavGroups ───────────────────────────────────────────────
  const groups: NavGroup[] = []

  if (cats.length > 0) {
    for (const cat of cats) {
      const slug         = cat.slug.toLowerCase()
      const isServiceCat = SERVICE_CATEGORY_SLUGS.has(slug)

      if (isServiceCat) {
        // Merge portfolio-service items + /api/services/ items, deduplicate by href
        const portSvcItems = catMap.get(slug) ?? []
        const merged       = [...portSvcItems, ...svcEntries]
        const seen         = new Set<string>()
        const unique       = merged.filter(e => {
          if (seen.has(e.href)) return false
          seen.add(e.href)
          return true
        })
        if (unique.length > 0) {
          groups.push({ label: cat.name.toUpperCase(), slug, order: cat.order, items: unique })
        }
      } else {
        const items = catMap.get(slug) ?? []
        if (items.length > 0) {
          groups.push({ label: cat.name.toUpperCase(), slug, order: cat.order, items })
        }
      }
    }
  } else {
    // Fallback: no categories API — derive from items
    catMap.forEach((items, slug) => {
      if (items.length === 0) return
      const isServiceCat = SERVICE_CATEGORY_SLUGS.has(slug)
      const finalItems   = isServiceCat
        ? [...items, ...svcEntries].filter((e, i, arr) => arr.findIndex(x => x.href === e.href) === i)
        : items
      const priority = SLUG_PRIORITY[slug] ?? 99
      groups.push({ label: slug.toUpperCase(), slug, order: priority, items: finalItems })
    })
    const hasServiceCol = groups.some(g => SERVICE_CATEGORY_SLUGS.has(g.slug))
    if (!hasServiceCol && svcEntries.length > 0) {
      groups.push({ label: 'SERVICES', slug: 'services', order: SLUG_PRIORITY['services'], items: svcEntries })
    }
    groups.sort((a, b) => a.order - b.order)
  }

  // ── Build footer columns ─────────────────────────────────────────────────
  // Use the same resolved groups so hrefs are 100% identical to the header.
  const trading:      NavEntry[] = []
  const distribution: NavEntry[] = []
  const services:     NavEntry[] = []
  const extra: { label: string; slug: string; items: NavEntry[] }[] = []

  for (const g of groups) {
    if (g.slug === 'trading')                    trading.push(...g.items)
    else if (g.slug === 'distribution')          distribution.push(...g.items)
    else if (SERVICE_CATEGORY_SLUGS.has(g.slug)) services.push(...g.items)
    else                                         extra.push({ label: g.label, slug: g.slug, items: g.items })
  }

  return {
    navGroups: groups,
    footer:    { trading, distribution, services, extra },
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNavData(): {
  navGroups: NavGroup[]
  footer:    FooterNavGroups
  loading:   boolean
} {
  const api = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL)
    ? process.env.NEXT_PUBLIC_API_URL
    : 'https://api.kavalakat.com/api'

  const [navGroups, setNavGroups] = useState<NavGroup[]>([])
  const [footer,    setFooter]    = useState<FooterNavGroups>({
    trading: [], distribution: [], services: [], extra: [],
  })
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false
    buildNavData(api).then(data => {
      if (cancelled) return
      setNavGroups(data.navGroups)
      setFooter(data.footer)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [api])

  return { navGroups, footer, loading }
}