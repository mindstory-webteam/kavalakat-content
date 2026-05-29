"use client";
import Link from 'next/link'
import React, { useMemo, useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
    Autoplay,
    EffectFade,
    Navigation,
    Pagination,
} from "swiper";
import { SwiperOptions } from 'swiper/types';

SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Strength {
    id: number;
    title: string;
    description: string;
    icon_url?: string;
    order?: number;
    is_active?: boolean;
    [key: string]: any;
}

// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "https://api.kavalakat.com/api";

async function fetchStrengths(): Promise<Strength[]> {
    try {
        const res = await fetch(`${API_BASE}/strengths/`, {
            cache: "no-store",
        });
        if (!res.ok) {
            console.warn("[Strengths API] responded with", res.status);
            return [];
        }
        const json = await res.json();
        console.log("[Strengths API]", json);
        // Your API wraps data in { success, data: [...] }
        if (json && "data" in json) return Array.isArray(json.data) ? json.data : [];
        return Array.isArray(json) ? json : [];
    } catch (err) {
        console.error("[Strengths API] fetch failed:", err);
        return [];
    }
}

// ── Fallback static highlights (shown if API returns nothing) ─────────────────

const STATIC_HIGHLIGHTS = [
    {
        id: 1,
        label: "HIGHLIGHT : 01",
        title: "Two Fully Operational Steel Yards",
        description:
            "Thrissur yard (Kuttanellur) — 2.5 acres, 40,000+ sq ft covered. Palakkad yard (Ozhalappathy) — 8 acres, 47,000+ sq ft. Third yard in Aluva coming Dec 2026. Additional godowns in Kannur & Thiruvananthapuram.",
    },
    {
        id: 2,
        label: "HIGHLIGHT : 02",
        title: "Own Transportation Fleet",
        description:
            "70+ vehicles including trucks, mini-trucks, and trailers. Full control over every delivery step with no dependency on third-party logistics — ensuring faster, more reliable supply to your project site.",
    },
    {
        id: 3,
        label: "HIGHLIGHT : 03",
        title: "Crane-Assisted Loading",
        description:
            "Three mobile cranes stationed at our yards ensure faster, safer loading and unloading of heavy steel and construction materials — significantly reducing turnaround time.",
    },
    {
        id: 4,
        label: "HIGHLIGHT : 04",
        title: "Weighbridge Facility",
        description:
            "100 MT electronic weighbridges available at each yard, ensuring transparent and accurate billing for every transaction — dispute-free measurement for every load.",
    },
    {
        id: 5,
        label: "HIGHLIGHT : 05",
        title: "245-Strong Workforce",
        description:
            "Steel Division headed by a State Head with Business Development Executives in every district of Kerala. 122+ trained manual labourers ensure professional yard operations across all locations.",
    },
    {
        id: 6,
        label: "HIGHLIGHT : 06",
        title: "Kavalakat Metals — In-House Logistics",
        description:
            "Registered in 2019, our dedicated logistics arm is an approved transporter for JSW Cement, Grasim Industries, and Bharathi Cement — serving major brands across Kerala.",
    },
];

// ── Default SVG icon (used when API has no icon_url) ─────────────────────────

const DefaultIcon = () => (
    <svg width={60} height={60} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ── Skeleton slide ────────────────────────────────────────────────────────────

const SkeletonSlide = () => (
    <div className="process-card2">
        <div className="step-no">
            <span className="skeleton-inline" style={{ width: 100, height: 14 }} />
        </div>
        <div className="dot">
            <span />
            <svg className="line" width={6} height={119} viewBox="0 0 6 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.2" d="M0.333333 116C0.333333 117.473 1.52724 118.667 3 118.667C4.47276 118.667 5.66667 117.473 5.66667 116C5.66667 114.527 4.47276 113.333 3 113.333C1.52724 113.333 0.333333 114.527 0.333333 116ZM2.5 0V116H3.5V0H2.5Z" fill="black" />
            </svg>
        </div>
        <div className="process-content-wrap">
            <div className="process-content">
                <div className="skeleton-inline" style={{ width: '80%', height: 20, marginBottom: 12 }} />
                <div className="skeleton-inline" style={{ width: '100%', height: 13, marginBottom: 8 }} />
                <div className="skeleton-inline" style={{ width: '90%', height: 13, marginBottom: 8 }} />
                <div className="skeleton-inline" style={{ width: '70%', height: 13 }} />
            </div>
        </div>
    </div>
);

// ── Dot/line SVG (reused per slide) ──────────────────────────────────────────

const DotLine = () => (
    <div className="dot">
        <span />
        <svg className="line" width={6} height={119} viewBox="0 0 6 119" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.2" d="M0.333333 116C0.333333 117.473 1.52724 118.667 3 118.667C4.47276 118.667 5.66667 117.473 5.66667 116C5.66667 114.527 4.47276 113.333 3 113.333C1.52724 113.333 0.333333 114.527 0.333333 116ZM2.5 0V116H3.5V0H2.5Z" fill="black" />
        </svg>
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

interface HomeProcessSectionProps {
    addClass?: string;
}

const HomeProcessSection: React.FC<HomeProcessSectionProps> = ({ addClass }) => {
    const [strengths, setStrengths] = useState<Strength[]>([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchStrengths().then((data) => {
            if (!cancelled) {
                setStrengths(data);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, []);

    // Use API data if available, otherwise fall back to static
    const slides = strengths.length > 0 ? strengths : STATIC_HIGHLIGHTS;

    const infraSettings: SwiperOptions = useMemo(() => ({
        slidesPerView: "auto",
        speed: 1500,
        spaceBetween: 24,
        grabCursor: true,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: ".infra-slider-next",
            prevEl: ".infra-slider-prev",
        },
        breakpoints: {
            280:  { slidesPerView: 1 },
            386:  { slidesPerView: 1 },
            576:  { slidesPerView: 2 },
            768:  { slidesPerView: 2 },
            992:  { slidesPerView: 3 },
            1200: { slidesPerView: 4, spaceBetween: 20 },
            1400: { slidesPerView: 4, spaceBetween: 40 },
        },
    }), []);

    return (
        <>
            <style>{`
                .skeleton-inline {
                    display: inline-block;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: sk-shimmer 1.4s infinite;
                    border-radius: 4px;
                }
                @keyframes sk-shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            {/* ══ INFRASTRUCTURE HIGHLIGHTS ══ */}
            <div className="home2-process-section mb-120">
                <div className="container">
                    <div
                        className="row justify-content-center mb-70 wow animate fadeInDown"
                        data-wow-delay="200ms"
                        data-wow-duration="1500ms"
                    >
                        <div className="col-xl-6 col-lg-8">
                            <div className="section-title two text-center mt-5">
                                <h2>Infrastructure Highlights</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="process-wrapper">
                    <div className="container-fluid">
                        <div className="process-slider-wrap">
                            <div className="row">
                                <div className="col-lg-12">
                                    <Swiper {...infraSettings} className="swiper home2-process-slider">
                                        <div className="swiper-wrapper">

                                            {loading ? (
                                                // ── Skeleton slides while fetching ──
                                                Array.from({ length: 4 }).map((_, i) => (
                                                    <SwiperSlide key={`sk-${i}`} className="swiper-slide">
                                                        <SkeletonSlide />
                                                    </SwiperSlide>
                                                ))
                                            ) : (
                                                // ── Real slides from API (or static fallback) ──
                                                slides.map((item, index) => {
                                                    // Support both API Strength shape and static fallback shape
                                                    const label = (item as any).label ?? `HIGHLIGHT : ${String(index + 1).padStart(2, "0")}`;
                                                    const title = item.title;
                                                    const description = item.description;
                                                    const iconUrl = (item as Strength).icon_url;

                                                    return (
                                                        <SwiperSlide key={item.id} className="swiper-slide">
                                                            <div className="process-card2">
                                                                <div className="step-no">
                                                                    <span>{label}</span>
                                                                </div>
                                                                <DotLine />
                                                                <div className="process-content-wrap">
                                                                    <div className="process-content">
                                                                        <h4>{title}</h4>
                                                                        <p>{description}</p>
                                                                        <div className="icon">
                                                                            {iconUrl ? (
                                                                                <img
                                                                                    src={iconUrl}
                                                                                    alt={title}
                                                                                    style={{
                                                                                        width: 60,
                                                                                        height: 60,
                                                                                        objectFit: "contain",
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <DefaultIcon />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    );
                                                })
                                            )}

                                        </div>
                                    </Swiper>
                                </div>
                            </div>
                        </div>

                        <p>
                            Any Doubt Question &amp;{" "}
                            <Link href="/contact">Contact</Link> With Us Any Time!
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomeProcessSection;