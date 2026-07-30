"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay, EffectFade, Navigation, Pagination } from "swiper";
import { SwiperOptions } from "swiper/types";
import Image from "next/image";

SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.kavalakat.com/api";
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  image_url: string
  category_name: string
  published_at: string
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function resolveImage(src: string | null | undefined): string {
  const s = (src || "").trim()
  if (!s || s === "null") return "/assets/new-images/blog/b-1.jpg"
  if (s.startsWith("http://") || s.startsWith("https://")) return s
  return `${API_ORIGIN}${s.startsWith("/") ? "" : "/"}${s}`
}

// ─── Arrow SVG (shared) ───────────────────────────────────────────────────────

const ArrowSvg = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M7.23241 0.232893L14.3936 7.39408L13.053 8.73466L1.35388 8.74787L1.3406 6.05345L9.28207 6.0926L5.2921 2.17319L7.23241 0.232893Z" />
      <path d="M7.19784 14.5909L11.7135 10.0753L7.88453 10.0564L5.27394 12.667L7.19784 14.5909Z" />
    </g>
  </svg>
)

// ─── Skeleton slide ───────────────────────────────────────────────────────────

const SkeletonSlide = () => (
  <div className="blog-card" style={{ opacity: 0.45 }}>
    <div className="blog-img-wrap">
      <div style={{ width: "100%", height: 240, background: "#e0e0e0", borderRadius: 6 }} />
    </div>
    <div className="blog-content" style={{ paddingTop: 16 }}>
      <div style={{ height: 12, background: "#e0e0e0", borderRadius: 4, marginBottom: 10, width: "40%" }} />
      <div style={{ height: 18, background: "#e0e0e0", borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 18, background: "#e0e0e0", borderRadius: 4, width: "80%" }} />
    </div>
  </div>
)

// ─── Component ────────────────────────────────────────────────────────────────

const HomepageBlogSection: React.FC = () => {
  const [posts,   setPosts]   = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/blog/?page_size=6&status=published`)
        if (!res.ok) return
        const json = await res.json()

        let list: BlogPost[] = []
        if (json.success !== undefined) {
          list = json.data ?? []
        } else if (Array.isArray(json)) {
          list = json
        } else if (json.results) {
          list = json.results
        }

        setPosts(list.filter((p) => p.slug && p.title).slice(0, 6))
      } catch {
        // silently ignore — section stays hidden
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const settings: SwiperOptions = useMemo(() => ({
    slidesPerView: "auto",
    speed: 1500,
    spaceBetween: 24,
    autoplay: { delay: 2500, disableOnInteraction: false },
    navigation: { nextEl: ".blog-slider-next", prevEl: ".blog-slider-prev" },
    breakpoints: {
      280:  { slidesPerView: 1 },
      386:  { slidesPerView: 1 },
      576:  { slidesPerView: 1 },
      768:  { slidesPerView: 2 },
      992:  { slidesPerView: 3 },
      1200: { slidesPerView: 3, spaceBetween: 20 },
      1400: { slidesPerView: 3 },
    },
  }), [])

  // Don't render section at all if no posts and done loading
  if (!loading && posts.length === 0) return null

  return (
    <div className="home1-blog-section mb-120">
      <div className="container">
        <div
          className="row g-4 align-items-end justify-content-between mb-70 wow animate fadeInDown"
          data-wow-delay="200ms"
          data-wow-duration="1500ms"
        >
          <div className="col-lg-5">
            <div className="section-title">
              <h2> Market Trend & Analyst Behind The Scene Of Industry</h2>
            </div>
          </div>
          <div className="col-lg-3 d-flex justify-content-lg-end">
            <div className="slider-btn-grp">
              <div className="slider-btn blog-slider-prev"><i className="bi bi-arrow-left" /></div>
              <div className="slider-btn blog-slider-next"><i className="bi bi-arrow-right" /></div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <Swiper {...settings} className="swiper home1-blog-slider">
              <div className="swiper-wrapper">

                {/* Skeleton slides while loading */}
                {loading && posts.length === 0 && (
                  [1, 2, 3].map((i) => (
                    <SwiperSlide key={`skel-${i}`} className="swiper-slide">
                      <SkeletonSlide />
                    </SwiperSlide>
                  ))
                )}

                {/* Live posts from API */}
                {posts.map((post) => (
                  <SwiperSlide key={post.id} className="swiper-slide">
                    <div className="blog-card">
                      <div className="blog-img-wrap">
                        <Link className="blog-img" href={`/blog/${post.slug}`}>
                          <Image
                            width={416}
                            height={320}
                            src={resolveImage(post.image_url)}
                            alt={post.title}
                            style={{ width: "100%", height: "240px", objectFit: "cover" }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/assets/new-images/blog/b-1.jpg"
                            }}
                          />
                        </Link>
                        <div className="blog-meta">
                          <ul>
                            <li>
                              <Link className="blog-date" href="/blog/">
                                {formatDate(post.published_at || post.created_at)}
                              </Link>
                            </li>
                            {post.category_name && (
                              <li><Link href="/blog/">{post.category_name}</Link></li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="blog-content">
                        <h5>
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h5>
                        <Link href={`/blog/${post.slug}`} className="read-btn">
                          <span>Read More</span>
                          <ArrowSvg />
                        </Link>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}

              </div>
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomepageBlogSection