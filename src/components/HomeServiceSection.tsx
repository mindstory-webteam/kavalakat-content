"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay, Pagination } from "swiper";
import { SwiperOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/pagination";
import { buildPortfolioHref, normalisePortfolioItem } from "@/lib/api";
import type { PortfolioItem } from "@/lib/api";

SwiperCore.use([Autoplay, Pagination]);

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.kavalakat.com/api";
const API_ORIGIN = API.replace(/\/api\/?$/, ""); // https://api.kavalakat.com

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceItem {
  uid: string;
  id: number;
  name: string;
  href: string;
  imageUrl: string;
  description: string;
  categoryName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrapEnvelope(json: any): any {
  if (
    json !== null &&
    typeof json === "object" &&
    !Array.isArray(json) &&
    "success" in json &&
    "data" in json
  )
    return json.data;
  return json;
}

function toSlug(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const FALLBACK_IMG = "/assets/new-images/new-images/about-imges/img-1.webp";

// Resolve image URL — handles relative paths, all common field names
function resolveImage(raw: any): string {
  // Try every field the Django backend might use for the thumbnail
  const candidates = [
    raw?.thumbnail,
    raw?.thumbnail_image,
    raw?.image,
    raw?.image_url,
    raw?.imageUrl,
    raw?.cover_image,
    raw?.photo,
  ];

  for (const val of candidates) {
    const s = (val || "").toString().trim();
    if (!s || s === "null" || s === "undefined") continue;
    // Already absolute
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    // Relative path from Django (e.g. /media/portfolio/foo.jpg)
    return `${API_ORIGIN}${s.startsWith("/") ? "" : "/"}${s}`;
  }

  return FALLBACK_IMG;
}

// Shared arrow SVG used by the "View Details" buttons
const DetailsArrow = () => (
  <svg width={24} height={23} viewBox="0 0 24 23" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M12.056 0.0560084L23.3137 11.3137L21.2063 13.4211L2.81473 13.4419L2.79385 9.20615L15.2782 9.26771L9.00578 3.10624L12.056 0.0560084Z" />
      <path d="M11.9999 22.6272L19.0987 15.5285L13.0794 15.4988L8.9755 19.6027L11.9999 22.6272Z" />
    </g>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const HomeServiceSection: React.FC = () => {
  const [items,   setItems]   = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const wrapRef = useRef<HTMLUListElement>(null);

  // ── Cursor-follow effect ────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    function followImageCursor(event: MouseEvent, item: HTMLLIElement) {
      const contentBox = item.getBoundingClientRect();
      const dx = event.clientX - contentBox.x;
      const dy = event.clientY - contentBox.y;
      const imageEl = item.children[1] as HTMLElement | undefined;
      if (imageEl) imageEl.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    const handlers: { el: HTMLLIElement; fn: (e: MouseEvent) => void }[] = [];
    wrap.querySelectorAll<HTMLLIElement>(".single-services").forEach((el) => {
      const fn = (e: MouseEvent) => followImageCursor(e, el);
      el.addEventListener("mousemove", fn);
      handlers.push({ el, fn });
    });

    return () => handlers.forEach(({ el, fn }) => el.removeEventListener("mousemove", fn));
  }, [items]);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const trading:      ServiceItem[] = [];
        const distribution: ServiceItem[] = [];
        const services:     ServiceItem[] = [];

        // ── 1. Portfolio items (trading + distribution) ──────────────────────
        let portfolioLoaded = false;
        try {
          const res = await fetch(`${API}/portfolio/page/`);
          if (res.ok) {
            const json = await res.json();
            const page = unwrapEnvelope(json);
            const hasData = page?.trading?.length || page?.distribution?.length;
            if (hasData) {
              (page.trading ?? []).forEach((raw: any) => {
                const n = normalisePortfolioItem(raw);
                trading.push({
                  uid:          `trading-${n.id}`,
                  id:           n.id,
                  name:         n.name,
                  href:         buildPortfolioHref(n),
                  imageUrl:     resolveImage(raw),   // pass raw item, not normalised
                  description:  (n as any).description || raw.description || "",
                  categoryName: (n as any).categoryName || raw.category_name || "Trading",
                });
              });
              (page.distribution ?? []).forEach((raw: any) => {
                const n = normalisePortfolioItem(raw);
                distribution.push({
                  uid:          `distribution-${n.id}`,
                  id:           n.id,
                  name:         n.name,
                  href:         buildPortfolioHref(n),
                  imageUrl:     resolveImage(raw),
                  description:  (n as any).description || raw.description || "",
                  categoryName: (n as any).categoryName || raw.category_name || "Distribution",
                });
              });
              portfolioLoaded = true;
            }
          }
        } catch { /* fall through */ }

        // Fallback: flat items list
        if (!portfolioLoaded) {
          try {
            const res = await fetch(`${API}/portfolio/items/`);
            if (res.ok) {
              const json = await res.json();
              const data = unwrapEnvelope(json);
              const allItems: any[] = Array.isArray(data)
                ? data
                : data.results ?? data.items ?? [];
              allItems
                .filter((i: any) => i.is_active !== false)
                .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                .forEach((raw: any) => {
                  const n    = normalisePortfolioItem(raw as PortfolioItem);
                  const href = buildPortfolioHref(n);
                  const base = {
                    id:           n.id,
                    name:         n.name,
                    href,
                    imageUrl:     resolveImage(raw),
                    description:  (n as any).description || raw.description || "",
                    categoryName: (n as any).categoryName || raw.category_name || "",
                  };
                  if (href.startsWith("/product/"))
                    trading.push({ uid: `trading-${n.id}`, ...base });
                  else if (href.startsWith("/distribution/"))
                    distribution.push({ uid: `distribution-${n.id}`, ...base });
                });
            }
          } catch { /* silently ignore */ }
        }

        // ── 2. Services (authoritative) ──────────────────────────────────────
        try {
          let url: string | null = `${API}/services/?is_active=true`;
          while (url) {
            const res: Response = await fetch(url, { cache: "no-store" });
            if (!res.ok) break;
            const json = await res.json();
            const rows: any[] = Array.isArray(json?.results)
              ? json.results
              : Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json) ? json : [];
            rows.forEach((svc: any) => {
              if (svc.is_active === false) return;
              const slug = svc.slug || toSlug(svc.name);
              services.push({
                uid:          `services-${svc.id}`,
                id:           svc.id,
                name:         svc.name,
                href:         `/services/${slug}`,
                imageUrl:     resolveImage(svc),
                description:  svc.description || "",
                categoryName: svc.category_detail?.name || "Services",
              });
            });
            url = json?.next ?? null;
          }
        } catch { /* silently ignore */ }

        setItems([...trading, ...distribution, ...services]);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Mobile / tablet carousel settings ─────────────────────────────────────────
  const mobileCarouselSettings: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: items.length > 1,
    speed: 800,
    autoplay: { delay: 2500, disableOnInteraction: false },
    pagination: { clickable: true },
    breakpoints: {
      768: { slidesPerView: 2 }, // tablet shows two cards
    },
  };

  // White dots so they stay visible on the dark section background
  const paginationStyle = {
    "--swiper-pagination-color": "#ffffff",
    "--swiper-pagination-bullet-inactive-color": "rgba(255,255,255,0.45)",
    "--swiper-pagination-bullet-inactive-opacity": "1",
    paddingBottom: 44,
  } as React.CSSProperties;

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading && items.length === 0) {
    return (
      <div className="home3-service-section mb-120">
        <div className="container">
          <div className="row gy-md-5 gy-4 align-items-center justify-content-between mb-70">
            <div className="col-lg-6">
              <div className="section-title two white">
                <h2>Our Products</h2>
              </div>
            </div>
          </div>
          <ul className="sevices-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={`skel-${i}`} className="single-services" style={{ opacity: 0.35 }}>
                <div className="number-and-icon-area">
                  <span style={{ background: "#333", borderRadius: 4, display: "block", width: 28, height: 22 }} />
                </div>
                <div className="content">
                  <p style={{ background: "#333", borderRadius: 4, width: 120, height: 18 }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="home3-service-section mb-120">
      <div className="container">
        <div
          className="row gy-md-5 gy-4 align-items-center justify-content-between mb-70"
        >
          <div
            className="col-lg-6 wow animate fadeInLeft"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <div className="section-title two white">
              <h2>Our Products</h2>
            </div>
          </div>
          <div className="col-lg-3 d-flex justify-content-lg-end btn_wrapper">
            <Link className="primary-btn3 white-bg" href="/product">
              <span>View All Services</span>
              <span>View All Services</span>
              <svg
                className="arrow"
                width={23}
                height={23}
                viewBox="0 0 23 23"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                  <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                </g>
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Desktop (lg and up): original cursor-follow list ─────────────── */}
        <div className="d-none d-lg-block">
          <ul className="sevices-wrap" ref={wrapRef}>
            {items.map((item, index) => (
              <li
                key={item.uid}
                className="single-services wow animate fadeInDown"
                data-wow-delay={`${200 + index * 200}ms`}
                data-wow-duration="1500ms"
              >
                <div className="number-and-icon-area">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div className="icon">
                    <svg
                      fill="#ffffff"
                      width="52px"
                      height="52px"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                </div>

                <div
                  className="services-img"
                  style={{ width: 250, height: 250, overflow: "hidden", flexShrink: 0 }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="content">
                  <p>{item.name}</p>
                </div>

                <Link href={item.href} className="details-btn">
                  <span>View Details</span>
                  <div className="icon">
                    <DetailsArrow />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Mobile / tablet (below lg): autoplay carousel with dots ──────── */}
        <div className="d-lg-none">
          <Swiper
            {...mobileCarouselSettings}
            className="home3-service-mobile-slider"
            style={paginationStyle}
          >
            {items.map((item) => (
              <SwiperSlide key={`m-${item.uid}`} style={{ height: "auto" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ width: "100%", height: 220, overflow: "hidden" }}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                      }}
                    />
                  </div>

                  <div
                    style={{
                      padding: 18,
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      flexGrow: 1,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#ffffff",
                        fontSize: 18,
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </p>

                    <Link
                      href={item.href}
                      style={{
                        marginTop: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#ffffff",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      <span>View Details</span>
                      <span
                        style={{
                          display: "inline-flex",
                          width: 18,
                          height: 18,
                          fill: "#ffffff",
                        }}
                      >
                        <DetailsArrow />
                      </span>
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default HomeServiceSection;