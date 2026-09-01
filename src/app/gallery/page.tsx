'use client'
import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useState, useEffect, useCallback } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'

// ─── SEO ──────────────────────────────────────────────────────────────────────
const META_TITLE = 'Gallery | Kavalakat Construction & Industrial Projects'
const META_DESC =
    "Browse photos of Kavalakat's steel, cement and construction material operations, deliveries and completed projects across Kerala."
const CANONICAL = 'https://www.kavalakat.com/gallery'

// ─── Types ────────────────────────────────────────────────────────────────────
interface GalleryItem {
    id: number
    title: string
    image: string
    image_url: string
    caption: string
    order: number
    is_active: boolean
    created_at: string
}

// API response can be any of these shapes:
// 1. GalleryItem[]
// 2. { results: GalleryItem[] }
// 3. { data: GalleryItem[], success: boolean, pagination: {...} }
interface GalleryPagination {
    total: number
    pages: number
    current_page: number
    page_size: number
    next: string | null
    previous: string | null
}

type GalleryApiResponse =
    | GalleryItem[]
    | { results: GalleryItem[] }
    | { data: GalleryItem[]; success: boolean; pagination?: GalleryPagination }

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.kavalakat.com/api'
const DELAYS = ['200ms', '400ms', '600ms', '800ms', '800ms', '600ms']
const MAX_PAGES = 20 // safety cap so a bad "next" link can't loop forever
const IMAGES_PER_PAGE = 9 // how many images show per pagination page in the UI

function extractItems(raw: GalleryApiResponse): GalleryItem[] {
    if (Array.isArray(raw)) return raw
    if ('data' in raw && Array.isArray(raw.data)) return raw.data
    if ('results' in raw && Array.isArray(raw.results)) return raw.results
    return []
}

function extractNextUrl(raw: GalleryApiResponse): string | null {
    if (!Array.isArray(raw) && 'pagination' in raw && raw.pagination) {
        return raw.pagination.next ?? null
    }
    return null
}

// ─── Component ────────────────────────────────────────────────────────────────
const GalleryPage = () => {
    const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const fetchGallery = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            let url: string | null = `${API_BASE}/gallery/`
            let allItems: GalleryItem[] = []
            let pageCount = 0

            while (url && pageCount < MAX_PAGES) {
                const res = await fetch(url)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const raw: GalleryApiResponse = await res.json()

                allItems = allItems.concat(extractItems(raw))
                url = extractNextUrl(raw)
                pageCount += 1
            }

            const items = allItems
                .filter(item => item.is_active !== false)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

            setGalleryImages(items)
        } catch (err) {
            console.error('[Gallery] fetch failed:', err)
            setError('Failed to load gallery. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchGallery()
    }, [fetchGallery])

    const totalPages = Math.ceil(galleryImages.length / IMAGES_PER_PAGE)
    const currentImages = galleryImages.slice(
        (currentPage - 1) * IMAGES_PER_PAGE,
        currentPage * IMAGES_PER_PAGE
    )

    const scrollToGallery = () =>
        document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })

    const goToPage = (page: number) => {
        setCurrentPage(page)
        scrollToGallery()
    }

    return (
        <>
            {/* ── SEO meta ── */}
            <title>{META_TITLE}</title>
            <meta name="description" content={META_DESC} />
            <link rel="canonical" href={CANONICAL} />
            <meta property="og:title" content={META_TITLE} />
            <meta property="og:description" content={META_DESC} />
            <meta property="og:url" content={CANONICAL} />
            <meta property="og:site_name" content="Kavalakat" />
            <meta property="og:type" content="website" />

            <InnerPageHeader />
            <Breadcrumb
                title="Gallery"
                subtitle="Explore Our Industrial & Manufacturing Excellence"
                image="/assets/new-images/new-images/about-imges/gallery.webp"
            />

            <div className="gallery-page pt-120 mb-120" id="gallery-section">
                <div className="container">

                    {/* ── Loading ── */}
                    {loading && (
                        <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ minHeight: 320 }}
                        >
                            <div
                                className="spinner-border"
                                role="status"
                                style={{ width: '3rem', height: '3rem' }}
                            >
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading gallery…</p>
                        </div>
                    )}

                    {/* ── Error ── */}
                    {!loading && error && (
                        <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            style={{ minHeight: 240 }}
                        >
                            <p className="text-danger mb-3">{error}</p>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={fetchGallery}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* ── Empty ── */}
                    {!loading && !error && galleryImages.length === 0 && (
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ minHeight: 240 }}
                        >
                            <p className="text-muted">No gallery images available.</p>
                        </div>
                    )}

                    {/* ── Grid: current page of images ── */}
                    {!loading && !error && currentImages.length > 0 && (
                        <>
                            <div className="row gy-5 mb-70">
                                {currentImages.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className="col-lg-4 col-md-6 wow animate fadeInDown"
                                        data-wow-delay={DELAYS[index % DELAYS.length]}
                                        data-wow-duration="1500ms"
                                    >
                                        <div className="gallery-item magnetic-item">
                                            <div className="gallery-img-wrap">
                                                <Link className="gallery-img" href={image.image_url}>
                                                    <Image
                                                        width={416}
                                                        height={230}
                                                        src={image.image_url}
                                                        alt={image.caption || image.title || `Gallery image ${image.id}`}
                                                        title={image.title}
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Pagination ── */}
                            {totalPages > 1 && (
                                <div className="row wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                                    <div className="col-lg-12 d-flex justify-content-center">
                                        <div className="innerpage-pagination-area">
                                            <ul className="paginations">
                                                {/* Prev */}
                                                <li className="page-item paginations-button">
                                                    
                                                      <a  href="#"
                                                        onClick={e => { e.preventDefault(); if (currentPage > 1) goToPage(currentPage - 1) }}
                                                        style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                                        aria-label="Previous page"
                                                    >
                                                        <svg width={14} height={12} viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M13.98 5.66372C13.9099 5.4729 13.7497 5.26524 13.5995 5.16983C13.4493 5.08003 13.0538 5.07442 8.23285 5.04636L3.02639 5.01829L4.91373 3.22795C6.14025 2.06619 6.83111 1.37026 6.88117 1.2524C7.05138 0.848309 6.89619 0.30391 6.55577 0.101865C6.36053 -0.0216073 5.98506 -0.0328321 5.81986 0.0681905C5.75978 0.107477 4.46318 1.31975 2.93128 2.76774C1.05896 4.54124 0.127801 5.46167 0.0727325 5.57953C-0.0774537 5.94433 0.00765182 6.34281 0.303018 6.6571C0.798632 7.17344 5.8549 11.8598 5.99007 11.9271C6.20534 12.0337 6.39057 12.0225 6.63587 11.8991C7.03136 11.697 7.20157 11.0909 6.9863 10.6812C6.93624 10.5858 6.03012 9.699 4.97381 8.71684C3.92251 7.72907 3.05643 6.90966 3.05643 6.88721C3.05143 6.85915 5.38932 6.84231 8.25287 6.84231L13.4493 6.84231L13.6145 6.71884C13.8648 6.52241 13.975 6.32036 13.995 6.0173C14.005 5.87137 14 5.70862 13.98 5.66372Z" />
                                                        </svg>
                                                    </a>
                                                </li>

                                                {/* Pages */}
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                        
                                                         <a   href="#"
                                                            onClick={e => { e.preventDefault(); goToPage(page) }}
                                                            aria-label={`Page ${page}`}
                                                            aria-current={currentPage === page ? 'page' : undefined}
                                                        >
                                                            {page.toString().padStart(2, '0')}
                                                        </a>
                                                    </li>
                                                ))}

                                                {/* Next */}
                                                <li className="page-item paginations-button">
                                                    
                                                    <a    href="#"
                                                        onClick={e => { e.preventDefault(); if (currentPage < totalPages) goToPage(currentPage + 1) }}
                                                        style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                                        aria-label="Next page"
                                                    >
                                                        <svg width={14} height={12} viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M0.020025 6.33628C0.0901115 6.5271 0.25031 6.73476 0.400496 6.83017C0.550683 6.91997 0.946172 6.92558 5.76715 6.95364L10.9736 6.98171L9.08627 8.77205C7.85974 9.93381 7.16889 10.6297 7.11883 10.7476C6.94862 11.1517 7.10381 11.6961 7.44423 11.8981C7.63947 12.0216 8.01494 12.0328 8.18014 11.9318C8.24022 11.8925 9.53682 10.6803 11.0687 9.23226C12.941 7.45876 13.8722 6.53833 13.9273 6.42047C14.0775 6.05567 13.9923 5.65719 13.697 5.3429C13.2014 4.82656 8.1451 0.140237 8.00993 0.0728886C7.79466 -0.0337464 7.60943 -0.0225217 7.36413 0.100951C6.96864 0.302995 6.79843 0.909129 7.0137 1.31883C7.06376 1.41424 7.96988 2.301 9.02619 3.28316C10.0775 4.27093 10.9436 5.09034 10.9436 5.11279C10.9486 5.14085 8.61068 5.15769 5.74713 5.15769L0.550683 5.15769L0.385478 5.28116C0.135167 5.47759 0.0250308 5.67964 0.00500557 5.98271C-0.00500609 6.12863 -2.49531e-07 6.29139 0.020025 6.33628Z" />
                                                        </svg>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <FooterTop />
            <Footer1 />
        </>
    )
}

export default GalleryPage