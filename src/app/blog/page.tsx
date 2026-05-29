// ✅ FILE PATH: src/app/blog/page.tsx  (Blog GRID — lists all posts)
'use client'

import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'

const BASE_URL = "https://api.kavalakat.com/api"
const PAGE_SIZE = 9

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  image_url: string
  category_name: string
  author_name: string
  status: string
  tags: string
  is_featured: boolean
  views: number
  created_at: string
  published_at: string
}

interface PaginationMeta {
  total: number
  pages: number
  current_page: number
  page_size: number
  next: string | null
  previous: string | null
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const ArrowSvg = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M7.23241 0.232893L14.3936 7.39408L13.053 8.73466L1.35388 8.74787L1.3406 6.05345L9.28207 6.0926L5.2921 2.17319L7.23241 0.232893Z" />
      <path d="M7.19784 14.5909L11.7135 10.0753L7.88453 10.0564L5.27394 12.667L7.19784 14.5909Z" />
    </g>
  </svg>
)

const BlogCardSkeleton = () => (
  <div className="col-lg-4 col-md-6">
    <div className="blog-card" style={{ opacity: 0.5 }}>
      <div className="blog-img-wrap">
        <div style={{ width: '100%', height: 230, background: '#e0e0e0', borderRadius: 8 }} />
      </div>
      <div className="blog-content" style={{ paddingTop: 16 }}>
        <div style={{ height: 14, background: '#e0e0e0', borderRadius: 4, marginBottom: 10, width: '60%' }} />
        <div style={{ height: 18, background: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 18, background: '#e0e0e0', borderRadius: 4, width: '80%' }} />
      </div>
    </div>
  </div>
)

export default function BlogGridPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts(currentPage)
  }, [currentPage])

  async function fetchPosts(page: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${BASE_URL}/blog/?page=${page}&page_size=${PAGE_SIZE}&status=published`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      // Handle { success, pagination, data } envelope
      if (json.success !== undefined) {
        setPosts(json.data ?? [])
        setPagination(json.pagination ?? null)
      } else if (Array.isArray(json)) {
        setPosts(json)
        setPagination(null)
      } else if (json.results) {
        setPosts(json.results)
        setPagination({
          total: json.count,
          pages: Math.ceil(json.count / PAGE_SIZE),
          current_page: page,
          page_size: PAGE_SIZE,
          next: json.next,
          previous: json.previous,
        })
      } else {
        setPosts([])
      }
    } catch (err) {
      setError('Failed to load blog posts. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = pagination?.pages ?? 1

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <>
      <InnerPageHeader />
      <Breadcrumb title="Blog Grid" subtitle="Market Trend & Analyst Behind The Scene Of Industry." image='/assets/new-images/new-images/about-imges/mailstone.webp' />
      <div className="blog-grid-page pt-120 mb-120" id="scroll-section">
        <div className="container">
          <div className="row gy-5 mb-70">

            {/* Loading skeletons */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}

            {/* Error state */}
            {!loading && error && (
              <div className="col-12 text-center py-5">
                <p style={{ color: 'red' }}>{error}</p>
                <button
                  className="read-btn"
                  onClick={() => fetchPosts(currentPage)}
                  style={{ border: 'none', cursor: 'pointer', padding: '10px 24px' }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && posts.length === 0 && (
              <div className="col-12 text-center py-5">
                <p>No blog posts found.</p>
              </div>
            )}

            {/* Blog cards */}
            {!loading && !error && posts.map((post, idx) => {
              const delay = `${(idx % 3 + 1) * 200}ms`
              return (
                <div
                  key={post.id}
                  className="col-lg-4 col-md-6 wow animate fadeInDown"
                  data-wow-delay={delay}
                  data-wow-duration="1500ms"
                >
                  <div className="blog-card magnetic-item">
                    <div className="blog-img-wrap">
                      <Link className="blog-img" href={`/blog/${post.slug}`}>
                        <Image
                          width={416}
                          height={230}
                          src={post.image_url || '/assets/new-images/blog/default.jpg'}
                          alt={post.title}
                          style={{ objectFit: 'cover', width: '100%', height: 230 }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/assets/new-images/blog/default.jpg'
                          }}
                        />
                      </Link>
                      <div className="blog-meta">
                        <ul>
                          <li>
                            <Link className="blog-date" href="/blog">
                              {formatDate(post.published_at || post.created_at)}
                            </Link>
                          </li>
                          {post.category_name && (
                            <li>
                              <Link href="/blog">{post.category_name}</Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="blog-content">
                      <h5>
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h5>
                      {post.excerpt && (
                        <p style={{ fontSize: 14, marginBottom: 12, opacity: 0.7, lineHeight: 1.5 }}>
                          {post.excerpt.length > 100
                            ? post.excerpt.slice(0, 100) + '…'
                            : post.excerpt}
                        </p>
                      )}
                      <Link href={`/blog/${post.slug}`} className="read-btn">
                        <span>Read More</span>
                        <ArrowSvg />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="row wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="col-lg-12 d-flex justify-content-center">
                <div className="innerpage-pagination-area">
                  <ul className="paginations">
                    {/* Prev */}
                    <li className={`page-item paginations-button${currentPage === 1 ? ' disabled' : ''}`}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(p => p - 1) }}
                      >
                        <svg width={14} height={12} viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.98 5.66372C13.9099 5.4729 13.7497 5.26524 13.5995 5.16983C13.4493 5.08003 13.0538 5.07442 8.23285 5.04636L3.02639 5.01829L4.91373 3.22795C6.14025 2.06619 6.83111 1.37026 6.88117 1.2524C7.05138 0.848309 6.89619 0.30391 6.55577 0.101865C6.36053 -0.0216073 5.98506 -0.0328321 5.81986 0.0681905C5.75978 0.107477 4.46318 1.31975 2.93128 2.76774C1.05896 4.54124 0.127801 5.46167 0.0727325 5.57953C-0.0774537 5.94433 0.00765182 6.34281 0.303018 6.6571C0.798632 7.17344 5.8549 11.8598 5.99007 11.9271C6.20534 12.0337 6.39057 12.0225 6.63587 11.8991C7.03136 11.697 7.20157 11.0909 6.9863 10.6812C6.93624 10.5858 6.03012 9.699 4.97381 8.71684C3.92251 7.72907 3.05643 6.90966 3.05643 6.88721C3.05143 6.85915 5.38932 6.84231 8.25287 6.84231L13.4493 6.84231L13.6145 6.71884C13.8648 6.52241 13.975 6.32036 13.995 6.0173C14.005 5.87137 14 5.70862 13.98 5.66372Z" />
                        </svg>
                      </a>
                    </li>

                    {/* Page numbers */}
                    {pageNumbers.map((num) => (
                      <li key={num} className={`page-item${currentPage === num ? ' active' : ''}`}>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(num) }}
                        >
                          {String(num).padStart(2, '0')}
                        </a>
                      </li>
                    ))}

                    {/* Next */}
                    <li className={`page-item paginations-button${currentPage === totalPages ? ' disabled' : ''}`}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(p => p + 1) }}
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
        </div>
      </div>
      <FooterTop />
      <Footer1 />
    </>
  )
}