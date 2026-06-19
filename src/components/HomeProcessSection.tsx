"use client";
import Link from 'next/link'
import React, { useMemo, useState, useEffect, useRef } from "react";

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

// How many lines of description to show before clamping with "…"
const CLAMP_LINES = 4;

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

// ── Single card (handles its own truncation detection) ───────────────────────

interface ProcessCardProps {
    item: any;
    index: number;
    onReadMore: (item: any, label: string) => void;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ item, index, onReadMore }) => {
    const pRef = useRef<HTMLParagraphElement>(null);
    const [overflow, setOverflow] = useState(false);

    const label = (item as any).label ?? `HIGHLIGHT : ${String(index + 1).padStart(2, "0")}`;
    const title = item.title;
    const description = item.description;
    const iconUrl = (item as Strength).icon_url;

    // Detect whether the clamped paragraph is actually overflowing
    useEffect(() => {
        const check = () => {
            const el = pRef.current;
            if (!el) return;
            setOverflow(el.scrollHeight > el.clientHeight + 1);
        };
        check();
        // Re-check after layout settles + on resize
        const t = setTimeout(check, 300);
        window.addEventListener("resize", check);
        return () => {
            clearTimeout(t);
            window.removeEventListener("resize", check);
        };
    }, [description]);

    return (
        <div className="process-card2 equal-card">
            <div className="step-no">
                <span>{label}</span>
            </div>
            <DotLine />
            <div className="process-content-wrap">
                <div className="process-content">
                    <h4 className="equal-title">{title}</h4>
                    <p ref={pRef} className="equal-desc">{description}</p>

                    {overflow && (
                        <button
                            type="button"
                            className="read-more-btn"
                            onClick={() => onReadMore(item, label)}
                        >
                            Read more
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}

                    <div className="icon">
                        {iconUrl ? (
                            <img
                                src={iconUrl}
                                alt={title}
                                style={{ width: 60, height: 60, objectFit: "contain" }}
                            />
                        ) : (
                            <DefaultIcon />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Component ─────────────────────────────────────────────────────────────────

interface HomeProcessSectionProps {
    addClass?: string;
}

const HomeProcessSection: React.FC<HomeProcessSectionProps> = ({ addClass }) => {
    const [strengths, setStrengths] = useState<Strength[]>([]);
    const [loading, setLoading]     = useState(true);
    const [modal, setModal]         = useState<{ item: any; label: string } | null>(null);

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

    // Close modal on Escape
    useEffect(() => {
        if (!modal) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(null); };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [modal]);

    // Use API data if available, otherwise fall back to static
    const slides = strengths.length > 0 ? strengths : STATIC_HIGHLIGHTS;

    const infraSettings: SwiperOptions = useMemo(() => ({
        slidesPerView: 1,
        speed: 1200,
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
        pagination: {
            el: ".infra-pagination",
            clickable: true,
        },
        breakpoints: {
            280:  { slidesPerView: 1 },
            576:  { slidesPerView: 2 },
            768:  { slidesPerView: 2 },
            992:  { slidesPerView: 3 },
            1200: { slidesPerView: 4, spaceBetween: 20 },
            1400: { slidesPerView: 4, spaceBetween: 30 },
        },
    }), []);

    return (
        <>
            <style>{infraStyles}</style>

            {/* ══ INFRASTRUCTURE HIGHLIGHTS ══ */}
            <div className={`home2-process-section infra-equal mb-120 ${addClass ?? ""}`}>
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
                                                slides.map((item, index) => (
                                                    <SwiperSlide key={item.id} className="swiper-slide">
                                                        <ProcessCard
                                                            item={item}
                                                            index={index}
                                                            onReadMore={(it, label) => setModal({ item: it, label })}
                                                        />
                                                    </SwiperSlide>
                                                ))
                                            )}

                                        </div>
                                    </Swiper>

                                    {/* ── Nav arrows + pagination dots ── */}
                                    <div className="infra-controls">
                                        <button className="infra-slider-prev" aria-label="Previous">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <div className="infra-pagination" />
                                        <button className="infra-slider-next" aria-label="Next">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="infra-contact-line">
                            Any Doubt Question &amp;{" "}
                            <Link href="/contact">Contact</Link> With Us Any Time!
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Read-more modal ── */}
            {modal && (
                <div className="infra-modal-overlay" onClick={() => setModal(null)}>
                    <div className="infra-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="infra-modal-close" onClick={() => setModal(null)} aria-label="Close">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                        <span className="infra-modal-label">{modal.label}</span>
                        <h3 className="infra-modal-title">{modal.item.title}</h3>
                        <p className="infra-modal-desc">{modal.item.description}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default HomeProcessSection;

// ── Styles ────────────────────────────────────────────────────────────────────

const infraStyles = `
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

    /* ── Equal-size cards ── */
    .infra-equal .swiper-slide { height: auto; display: flex; }
    .infra-equal .process-card2.equal-card {
        width: 100%;
        height: 100%;
        min-height: 360px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }
    .infra-equal .process-card2 .process-content-wrap { flex: 1 1 auto; display: flex; }
    .infra-equal .process-card2 .process-content {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    /* Title: clamp to 2 lines so every card aligns */
    .infra-equal .equal-title {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2.6em;
        margin-bottom: 10px;
    }

    /* Description: clamp + "…" overflow */
    .infra-equal .equal-desc {
        display: -webkit-box;
        -webkit-line-clamp: ${CLAMP_LINES};
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 12px;
    }

    /* Read more button */
    .infra-equal .read-more-btn {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 0;
        margin-bottom: 14px;
        font-weight: 600;
        font-size: 0.875rem;
        color: #000;
        cursor: pointer;
        transition: gap .2s ease, opacity .2s ease;
    }
    .infra-equal .read-more-btn:hover { gap: 10px; opacity: .75; }

    /* Push the icon to the bottom so cards line up */
    .infra-equal .process-content .icon { margin-top: auto; }

    /* ── Controls: arrows + pagination dots ── */
    .infra-equal .infra-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        margin-top: 40px;
        flex-wrap: wrap;
    }
    .infra-equal .infra-slider-prev,
    .infra-equal .infra-slider-next {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid #ddd;
        background: #fff;
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background .2s, color .2s, border-color .2s;
        flex-shrink: 0;
    }
    .infra-equal .infra-slider-prev:hover,
    .infra-equal .infra-slider-next:hover {
        background: #000;
        color: #fff;
        border-color: #000;
    }

    .infra-equal .infra-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: auto;
    }
    .infra-equal .infra-pagination .swiper-pagination-bullet {
        width: 8px;
        height: 8px;
        background: #cfcfcf;
        opacity: 1;
        border-radius: 50%;
        margin: 0 !important;
        transition: width .3s ease, background .3s ease, border-radius .3s ease;
        cursor: pointer;
    }
    .infra-equal .infra-pagination .swiper-pagination-bullet-active {
        background: #000;
        width: 26px;
        border-radius: 5px;
    }

    .infra-equal .infra-contact-line { text-align: center; margin-top: 26px; }

    /* ── Read-more modal ── */
    .infra-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.55);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 9999;
        animation: infraFade .2s ease;
    }
    .infra-modal {
        position: relative;
        background: #fff;
        border-radius: 14px;
        max-width: 520px;
        width: 100%;
        max-height: 85vh;
        overflow-y: auto;
        padding: 36px 32px 32px;
        box-shadow: 0 24px 60px rgba(0,0,0,.25);
        animation: infraPop .25s ease;
    }
    .infra-modal-close {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 36px;
        height: 36px;
        border: none;
        background: #f2f2f2;
        border-radius: 50%;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background .2s;
    }
    .infra-modal-close:hover { background: #e2e2e2; }
    .infra-modal-label {
        display: inline-block;
        font-size: .75rem;
        letter-spacing: .08em;
        font-weight: 700;
        color: #888;
        margin-bottom: 10px;
    }
    .infra-modal-title { margin: 0 0 14px; font-weight: 700; line-height: 1.3; }
    .infra-modal-desc { margin: 0; line-height: 1.8; color: #444; }

    @keyframes infraFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes infraPop  { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: none; } }

    /* ── Responsive tweaks ── */
    @media (max-width: 991px) {
        .infra-equal .process-card2.equal-card { min-height: 340px; }
    }
    @media (max-width: 575px) {
        .infra-equal .process-card2.equal-card { min-height: 320px; }
        .infra-equal .infra-controls { gap: 12px; margin-top: 28px; }
        .infra-modal { padding: 30px 22px 24px; }
    }
`;