"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import { SwiperOptions } from "swiper/types";

SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

// ── Types ─────────────────────────────────────────────────────────────────────

interface Project {
  id: number;
  title: string;
  description?: string;
  client?: string;
  client_logo?: string;
  client_logo_url?: string;
  client_location?: string;
  location?: string;
  year?: string | number;
  tag?: string;
  image?: string;
  image_url?: string;
  contact_url?: string;
  is_featured?: boolean;
  created_at?: string;
}

// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "https://api.kavalakat.com/api").replace(/\/$/, "");

const LOCAL_IMAGES = [
  "/assets/new-images/projects/project-1.jpg",
  "/assets/new-images/projects/project-2.jpg",
  "/assets/new-images/projects/project-3.jpg",
];

async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_BASE}/projects/`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) { console.warn(`[API] /projects/ → ${res.status}`); return []; }

    const json = await res.json();
    console.log("[API] /projects/", json);

    if (json && !Array.isArray(json) && "data" in json)    return json.data as Project[];
    if (json && !Array.isArray(json) && "results" in json) return json.results as Project[];
    if (Array.isArray(json)) return json as Project[];
    return [];
  } catch (err) {
    console.error("[API] Failed to fetch /projects/:", err);
    return [];
  }
}

function resolveImage(p: Project, index: number): string {
  if (p.image_url?.trim()) return p.image_url.trim();
  if (p.image?.trim())     return p.image.trim();
  return LOCAL_IMAGES[index % LOCAL_IMAGES.length];
}

function resolveLocation(p: Project): string {
  return p.client_location || p.location || "";
}

// ── Skeleton slide ────────────────────────────────────────────────────────────

const SkeletonSlide: React.FC = () => (
  <div className="project-card-wrap">
    <div className="project-card">
      <div className="project-img skeleton" style={{ height: 450 }} />
      <div className="project-content-wrap">
        <div className="project-content">
          <div className="skeleton" style={{ height: 12, width: "50%", marginBottom: 8, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 12, borderRadius: 4 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: 70, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const HomePageProjectSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProjects().then((data) => {
      if (!cancelled) { setProjects(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const settings: SwiperOptions = useMemo(() => ({
    slidesPerView: "auto",
    speed: 1500,
    spaceBetween: 0,
    autoplay: { delay: 2500, disableOnInteraction: false },
    navigation: {
      nextEl: ".project-slider-next",
      prevEl: ".project-slider-prev",
    },
    pagination: { el: ".swiper-pagination1", clickable: true },
    breakpoints: {
      280:  { slidesPerView: 1 },
      386:  { slidesPerView: 1 },
      576:  { slidesPerView: 1 },
      768:  { slidesPerView: 2 },
      992:  { slidesPerView: 3 },
      1200: { slidesPerView: 3 },
      1400: { slidesPerView: 4 },
    },
  }), []);

  return (
    <>
      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #2a3a50 25%, #233048 50%, #2a3a50 75%);
          background-size: 200% 100%;
          animation: sk-shimmer 1.4s infinite;
          display: block;
        }
        @keyframes sk-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="home1-project-section">
        <div className="container">
          <div className="row justify-content-center mb-50">
            <div className="col-xl-6 col-lg-7 col-md-8">
              <div
                className="section-title white text-center wow animate fadeInDown"
                data-wow-delay="200ms"
                data-wow-duration="1500ms"
              >
                <h2>Our Manufacturing Projects</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="project-slider-area mb-50">
          <div className="row">
            <div className="col-lg-12">
              <Swiper {...settings} className="swiper home1-project-slider">
                <div className="swiper-wrapper">

                  {/* Loading skeletons */}
                  {loading && Array.from({ length: 4 }).map((_, i) => (
                    <SwiperSlide className="swiper-slide" key={`sk-${i}`}>
                      <SkeletonSlide />
                    </SwiperSlide>
                  ))}

                  {/* API data */}
                  {!loading && projects.map((project, i) => (
                    <SwiperSlide className="swiper-slide" key={project.id}>
                      <div className="project-card-wrap">
                        <div className="project-card">
                         <div className="project-img" style={{ position: 'relative', height: 450, overflow: 'hidden' }}>
  <img
    src={resolveImage(project, i)}
    alt={project.title}
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    }}
  />
</div>
                          <div className="project-content-wrap">
                            <div className="project-content">
                              <span>{resolveLocation(project)}</span>
                              <h3>
                                <Link href="/project">{project.title}</Link>
                              </h3>
                              <ul>
                                {project.tag && (
                                  <li><Link href="/project">{project.tag}</Link></li>
                                )}
                                {project.year && (
                                  <li><Link href="/project">{project.year}</Link></li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}

                </div>
              </Swiper>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 d-flex justify-content-center bounce_up">
            <Link className="primary-btn1 white-bg" href="/projects">
              <span>View All Projects</span>
              <span>View All Projects</span>
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
      </div>
    </>
  );
};

export default HomePageProjectSection;