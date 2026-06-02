// ✅ FILE PATH: src/app/blog/[slug]/page.tsx  (Blog DETAIL — single post)
'use client'

import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'
import Image from 'next/image'
import { useParams } from 'next/navigation'

const BASE_URL = "https://api.kavalakat.com/api"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  image_url: string
  category_name: string
  category_slug?: string
  author_name: string
  status: string
  tags: string | string[]
  is_featured: boolean
  views: number
  meta_title?: string
  meta_description?: string
  created_at: string
  published_at: string
  updated_at?: string
  bottom_html?: string  // ✅ NEW: Bottom HTML Section from CMS
}

interface SidebarPost {
  id: number
  title: string
  slug: string
  image_url: string
  published_at: string
  created_at: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function parseTags(tags: string | string[] | undefined): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : [tags]
  } catch {
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
}

// Minimal content renderer — renders HTML content from API
function ContentRenderer({ html }: { html: string }) {
  return (
    <div
      className="blog-api-content"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ lineHeight: 1.8, fontSize: '1rem' }}
    />
  )
}

// ✅ NEW: Bottom HTML renderer — renders injected CMS HTML below main content
function BottomHtmlRenderer({ html }: { html: string }) {
  return (
    <div
      className="blog-bottom-html"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function DetailSkeleton() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ height: 32, background: '#e0e0e0', borderRadius: 4, marginBottom: 20, width: '70%' }} />
      <div style={{ height: 400, background: '#e0e0e0', borderRadius: 8, marginBottom: 24 }} />
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 16, background: '#e0e0e0', borderRadius: 4, marginBottom: 12, width: `${90 - i * 10}%` }} />
      ))}
    </div>
  )
}

export default function BlogDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [sidebarPosts, setSidebarPosts] = useState<SidebarPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchPost(slug)
      fetchSidebarPosts()
    }
  }, [slug])

  async function fetchPost(slug: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/blog/${slug}/`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Post not found')
        throw new Error(`HTTP ${res.status}`)
      }
      const json = await res.json()
      // Handle { success, data } envelope or direct object
      const data = json.success !== undefined ? json.data : json
      setPost(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load post.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSidebarPosts() {
    try {
      const res = await fetch(`${BASE_URL}/blog/?page_size=3&status=published`)
      if (!res.ok) return
      const json = await res.json()
      const posts: SidebarPost[] = json.success !== undefined
        ? (json.data ?? [])
        : Array.isArray(json) ? json : (json.results ?? [])
      setSidebarPosts(posts.slice(0, 3))
    } catch {
      // silently fail sidebar
    }
  }

  const tags = parseTags(post?.tags)

  return (
    <>
      <InnerPageHeader />
      <Breadcrumb
        title={post?.category_name || 'Blog'}
        subtitle="Market Trend & Analyst Behind The Scene Of Industry."
      />
      <div className="blog-details-page pt-120 mb-120" id="scroll-section">
        <div className="container">
          <div className="row gy-5 mb-120">

            {/* Main content col */}
            <div className="col-lg-8">

              {loading && <DetailSkeleton />}

              {!loading && error && (
                <div className="py-5 text-center">
                  <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>
                  <Link href="/blog" className="read-btn" style={{ padding: '10px 24px' }}>
                    ← Back to Blog
                  </Link>
                </div>
              )}

              {!loading && !error && post && (
                <>
                  {/* Meta + title */}
                  <div className="blog-details-top-area mb-70">
                    <ul className="blog-meta">
                      <li>
                        {/* Clock icon */}
                        <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 0C3.60594 0 0 3.60594 0 8C0 12.3941 3.60594 16 8 16C12.3941 16 16 12.3941 16 8C16 3.60594 12.3941 0 8 0ZM11.1439 11.1439C10.9608 11.327 10.6642 11.327 10.4811 11.1439L7.66856 8.33141C7.58069 8.24353 7.53125 8.1245 7.53125 8V5.1875C7.53125 4.92841 7.74091 4.71875 8 4.71875C8.25909 4.71875 8.46875 4.92841 8.46875 5.1875V7.80591L11.1439 10.4811C11.327 10.6642 11.327 10.9608 11.1439 11.1439Z" />
                        </svg>
                        {formatDate(post.published_at || post.created_at)}
                      </li>
                      <li>
                        {/* Views icon */}
                        <svg width={12} height={16} viewBox="0 0 12 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.80968 15.0679C9.5273 12.1176 8.80817 8.40483 6.09966 6.24033L6.10694 6.26482L6.10504 6.28594C6.63276 7.63466 6.55873 9.11531 5.91047 10.3857L5.45362 11.2813L5.31347 10.2917C5.21824 9.62039 4.95659 8.98001 4.55353 8.43177H4.48994L4.4564 8.33993C4.46115 9.3657 4.23778 10.3762 3.7996 11.3294C3.22474 12.5768 3.30922 14.0152 4.02581 15.1778L4.52031 15.9804L3.63066 15.6168C2.16361 15.0171 0.990804 13.8618 0.412783 12.4473C-0.234842 10.8678 -0.114934 9.03633 0.733906 7.54925C1.17652 6.77572 1.48657 5.95443 1.65583 5.10773L1.82129 4.27787L2.24334 5.01804C2.44487 5.37098 2.59326 5.75301 2.68532 6.15432L2.71379 6.22533C3.97804 4.6002 4.73545 2.57805 4.84586 0.530486L4.87434 0L5.33435 0.290191C7.21173 1.47391 8.51552 3.37301 8.91827 5.5069L8.95275 5.52924C9.3207 5.05906 9.51496 4.4998 9.51496 3.91115V2.99956L10.0835 3.72626C11.4053 5.41537 12.083 7.51068 11.9919 9.62651C11.8799 12.117 10.4761 14.3029 8.23648 15.4873L7.26678 16L7.80968 15.0679Z" />
                        </svg>
                        {post.views?.toLocaleString() || 0} Views
                      </li>
                    </ul>

                    <h2>{post.title}</h2>

                    <div className="author-area">
                      <div className="author-img">
                        <Image width={30} height={30} src="/assets/new-images/fav-1.png" alt="" />
                      </div>
                      <div className="author-content">
                        <h6>
                          By, <Link href="/blog">{post.author_name || 'Kavalakat Agencies'}</Link>
                        </h6>
                      </div>
                    </div>
                  </div>

                  {/* Featured image */}
                  {post.image_url && (
                    <div style={{ marginBottom: 40 }}>
                      <Image
                        width={820}
                        height={420}
                        src={post.image_url}
                        alt={post.title}
                        style={{ width: '100%', height: 'auto', borderRadius: 8, objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="details-content-wrapper mb-80">
                    {post.excerpt && (
                      <p className="first-para">{post.excerpt}</p>
                    )}

                    {post.content ? (
                      <ContentRenderer html={post.content} />
                    ) : (
                      <p style={{ opacity: 0.6 }}>No content available for this post.</p>
                    )}

                    {/* ✅ NEW: Bottom HTML Section — injected from CMS below main content */}
                    {post.bottom_html && (
                      <BottomHtmlRenderer html={post.bottom_html} />
                    )}
                  </div>

                  {/* Tags + social share */}
                  <div className="tag-and-social-area">
                    {tags.length > 0 && (
                      <ul className="tag-list">
                        {tags.map((tag, i) => (
                          <li key={i}>
                            <Link href="/blog"><span># </span>{tag}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="social-area">
                      <h6>Share On:</h6>
                      <ul className="social-link">
                        <li>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="bx bxl-facebook" />
                          </a>
                        </li>
                        <li>
                          <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer">
                            <i className="bx bxl-pinterest-alt" />
                          </a>
                        </li>
                        <li>
                          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                            <i className="bx bxl-instagram" />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Prev / Next nav */}
                  <div className="details-navigation">
                    <Link href="/blog" className="navigation-arrow">
                      <svg width={21} height={14} viewBox="0 0 21 14" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M20.75 7C20.75 7.41421 20.4142 7.75 20 7.75H2V6.25H20C20.4142 6.25 20.75 6.58579 20.75 7Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.0856 0.531506C10.3444 0.854953 10.2919 1.32692 9.96849 1.58568L3.20056 7.00003L9.96849 12.4144C10.2919 12.6731 10.3444 13.1451 10.0856 13.4685C9.82687 13.792 9.3549 13.8444 9.03145 13.5857L0.799387 7.00003L9.03145 0.414376C9.3549 0.155619 9.82687 0.20806 10.0856 0.531506Z" />
                      </svg>
                    </Link>
                    <p>Back to all articles</p>
                    <Link href="/blog" className="navigation-arrow">
                      <svg width={21} height={14} viewBox="0 0 21 14" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.095796 6.74944C0.101677 6.33526 0.442198 6.00428 0.85637 6.01016L18.8546 6.26574L18.8333 7.76559L0.835071 7.51001C0.420899 7.50413 0.0899145 7.16361 0.095796 6.74944Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.6671 13.3686C10.413 13.0415 10.4721 12.5703 10.7992 12.3162L17.6434 6.99845L10.953 1.48855C10.6332 1.22523 10.5875 0.752562 10.8508 0.432823C11.1142 0.113083 11.5868 0.0673482 11.9066 0.330672L20.0443 7.03255L11.7195 13.5006C11.3925 13.7548 10.9213 13.6956 10.6671 13.3686Z" />
                      </svg>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="blog-sidebar-area">
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Popular Posts</h5>

                  {sidebarPosts.length === 0 && (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="recent-post-widget mb-25" style={{ opacity: 0.4 }}>
                        <div className="recent-post-img">
                          <div style={{ width: 100, height: 100, background: '#e0e0e0', borderRadius: 4 }} />
                        </div>
                        <div className="recent-post-content">
                          <div style={{ height: 12, background: '#e0e0e0', borderRadius: 4, marginBottom: 8, width: '60%' }} />
                          <div style={{ height: 14, background: '#e0e0e0', borderRadius: 4 }} />
                        </div>
                      </div>
                    ))
                  )}

                  {sidebarPosts.map((sPost, i) => (
                    <div
                      key={sPost.id}
                      className={`recent-post-widget${i < sidebarPosts.length - 1 ? ' mb-25' : ''}`}
                    >
                      <div className="recent-post-img">
                        <Link href={`/blog/${sPost.slug}`}>
                          <Image
                            width={100}
                            height={100}
                            src={sPost.image_url || '/assets/new-images/blog/default.jpg'}
                            alt={sPost.title}
                            style={{ objectFit: 'cover', width: 100, height: 100 }}
                          />
                        </Link>
                      </div>
                      <div className="recent-post-content">
                        <Link href="/blog">
                          {formatDate(sPost.published_at || sPost.created_at)}
                        </Link>
                        <h6>
                          <Link href={`/blog/${sPost.slug}`}>{sPost.title}</Link>
                        </h6>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags widget — driven from current post tags */}
                {tags.length > 0 && (
                  <div className="single-widget">
                    <h5 className="widget-title">Tags</h5>
                    <ul className="tag-list">
                      {tags.map((tag, i) => (
                        <li key={i}>
                          <Link href="/blog">#{tag}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Static tags fallback when no post tags */}
                {tags.length === 0 && (
                  <div className="single-widget">
                    <h5 className="widget-title">New Tags</h5>
                    <ul className="tag-list">
                      {['Construction', 'Cement', 'Industry', 'Renovation', 'Materials', 'Building', 'Engineering'].map((tag) => (
                        <li key={tag}>
                          <Link href="/blog">#{tag}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        .blog-api-content h1,
        .blog-api-content h2,
        .blog-api-content h3,
        .blog-api-content h4 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .blog-api-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
        }
        .blog-api-content ul,
        .blog-api-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .blog-api-content li {
          margin-bottom: 0.5rem;
        }
        .blog-api-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .blog-api-content blockquote {
          border-left: 4px solid currentColor;
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          opacity: 0.8;
        }
        .blog-api-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        .blog-api-content th,
        .blog-api-content td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        .blog-api-content strong { font-weight: 700; }
        .blog-api-content a { text-decoration: underline; }

        /* ✅ NEW: Bottom HTML Section styles */
        .blog-bottom-html {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(128, 128, 128, 0.2);
        }
        .blog-bottom-html h1,
        .blog-bottom-html h2,
        .blog-bottom-html h3,
        .blog-bottom-html h4 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .blog-bottom-html p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
        }
        .blog-bottom-html ul,
        .blog-bottom-html ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .blog-bottom-html li {
          margin-bottom: 0.5rem;
        }
        .blog-bottom-html img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .blog-bottom-html a {
          text-decoration: underline;
        }
        .blog-bottom-html table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        .blog-bottom-html th,
        .blog-bottom-html td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        .blog-bottom-html strong {
          font-weight: 700;
        }
        /* CTA banner pattern — common use case for bottom_html */
        .blog-bottom-html .cta-banner {
          background: rgba(128, 128, 128, 0.08);
          border: 1px solid rgba(128, 128, 128, 0.2);
          border-radius: 8px;
          padding: 1.5rem 2rem;
          margin: 1rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .blog-bottom-html .cta-banner h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        .blog-bottom-html .btn {
          display: inline-block;
          padding: 10px 24px;
          border-radius: 4px;
          font-weight: 600;
          text-decoration: none !important;
          transition: opacity 0.2s;
          cursor: pointer;
        }
        .blog-bottom-html .btn:hover {
          opacity: 0.85;
        }
        /* YouTube / iframe embeds */
        .blog-bottom-html iframe {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem 0;
        }
      `}</style>

      <FooterTop />
      <Footer1 />
    </>
  )
}