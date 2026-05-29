"use client"
import React, { useState, useEffect } from 'react'
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.css";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AboutData {
  id?: number;
  title?: string;
  description?: string;
  vision?: string;
  mission?: string;
  founded_year?: string | number;
  employee_count?: string | number;
  updated_at?: string;
}

// ── API Base ──────────────────────────────────────────────────────────────────

const API_BASE = (
  process.env.NEXT_PUBLIC_REACT_APP_API_URL ?? "https://api.kavalakat.com/api"
).replace(/\/$/, "");

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function fetchAbout(): Promise<AboutData | null> {
  try {
    const res = await fetch(`${API_BASE}/about/`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[API] /about/ returned ${res.status}`);
      return null;
    }

    const json = await res.json();

    // Response shape: { success: true, data: { ...aboutFields } }
    if (json && typeof json === "object" && !Array.isArray(json) && "data" in json) {
      return json.data as AboutData;
    }

    // Fallback: plain object returned directly
    if (json && typeof json === "object" && !Array.isArray(json)) {
      return json as AboutData;
    }

    // Fallback: array — take first item
    if (Array.isArray(json) && json.length > 0) {
      return json[0] as AboutData;
    }

    return null;
  } catch (err) {
    console.error("[API] Failed to fetch /about/:", err);
    return null;
  }
}

// ── Static fallbacks ──────────────────────────────────────────────────────────

const STATIC_PARA_1 = `Kavalakat's journey began in 1936 when Mr. K. S. Joseph founded a rice and oil mill in Kandassankadavu, laying the foundation for the family's entrepreneurial legacy. His son, Mr. K. J. Francis, later expanded into cement trading and built a strong distribution business, leading the group until 2010 before passing leadership to Mr. K. F. Jose. Under his guidance, Kavalakat grew significantly, diversifying into new products, regions, and business sectors. With the fourth generation joining in 2018, the group continues to evolve, now spanning logistics, hospitality, and food & beverage, reflecting both tradition and modern growth.`;

const STATIC_PARA_2 = `Kavalakat Group is one of Kerala's foremost construction material suppliers — a name built on five decades of trust, reliability, and relentless commitment to quality. Founded in 1975 and headquartered in S.T. Nagar, Thrissur, we are the preferred channel partners for leading Indian and international brands in steel, cement, paints, and construction chemicals.`;

const STATIC_VISION  = "To be the most preferred service provider of the construction industry in India.";
const STATIC_MISSION = "To achieve customer satisfaction through quality products, on-time delivery, and competitive pricing.";
const STATIC_IMAGE   = "/assets/new-images/new-images/about-banner.webp";

// ── Component ─────────────────────────────────────────────────────────────────

interface HomePageAboutSectionProps {
  pt?: string;
}

const HomePageAboutSection: React.FC<HomePageAboutSectionProps> = ({ pt = "" }) => {
  const [isOpen, setOpen] = useState(false);
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchAbout().then((data) => {
      if (!cancelled) {
        setAbout(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  // ── Resolved values (API first, static fallback second) ──────────────────
  const heading     = about?.title       || "The Story Behind Our Strength";
  const description = about?.description || "";
  const vision      = about?.vision      || STATIC_VISION;
  const mission     = about?.mission     || STATIC_MISSION;
  const foundedYear   = about?.founded_year   ?? null;
  const employeeCount = about?.employee_count ?? null;

  return (
    <>
      <style>{`
        .about-cards-section {
          width: 100%;
          margin-top: 48px;
          padding: 48px 0 12px;
          border-top: 1px solid #015fb24b;
        }

        .about-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 640px) {
          .about-cards-grid { grid-template-columns: 1fr; }
        }

        .about-card {
          border: 1px solid #0160b2;
          border-left: 3px solid black;
          background: rgba(180,20,20,0.03);
          padding: 32px 28px 28px;
          border-radius: 2px;
          position: relative;
          transition: box-shadow 0.28s ease, border-color 0.28s ease;
        }

        .about-card:hover { border-color: #0160b2; }

        .about-card-icon {
          width: 40px;
          height: 40px;
          background: #0160b2;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .about-card-icon svg { width: 20px; height: 20px; fill: #fff; }

        .about-card h6 {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0160b2;
          margin-bottom: 12px;
        }

        .about-card p {
          font-size: 15px;
          line-height: 1.80;
          color: #555;
          margin: 0;
        }

        .about-card-corner {
          position: absolute;
          bottom: 14px;
          right: 16px;
          width: 14px;
          height: 14px;
          border-bottom: 1px solid #0160b2;
          border-right: 1px solid #0160b2;
        }

        .about-stats-bar {
          display: flex;
          gap: 32px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .about-stat { display: flex; flex-direction: column; }

        .about-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #0160b2;
          line-height: 1;
        }

        .about-stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #888;
          margin-top: 4px;
        }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 4px;
          display: block;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .sk-text  { height: 14px; margin-bottom: 10px; }
        .sk-title { height: 32px; width: 55%; margin-bottom: 16px; }
      `}</style>

      <div className={`home1-about-section mb-120 mt-50 ${pt}`} id="scroll-section">
        <div className="container">

          {/* ── Header ── */}
          <div className="about-top-area mb-50">
            <div className="row g-4 align-items-center justify-content-between">
              <div className="col-xl-8 col-lg-9 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                <div className="about-title-area">
                  <div className="section-title">
                    {loading
                      ? <span className="skeleton sk-title" />
                      : <h2>{heading}</h2>
                    }
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-2 d-flex justify-content-lg-end" />
            </div>
          </div>

          {/* ── Description + Image ── */}
          <div className="row gy-md-5 gy-4">
            <div className="col-lg-5 wow animate fadeInLeft" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="about-content">

                {loading ? (
                  <>
                    <span className="skeleton sk-text" style={{ width: "100%" }} />
                    <span className="skeleton sk-text" style={{ width: "88%" }} />
                    <span className="skeleton sk-text" style={{ width: "94%" }} />
                    <span className="skeleton sk-text" style={{ width: "78%" }} />
                    <br />
                    <span className="skeleton sk-text" style={{ width: "100%" }} />
                    <span className="skeleton sk-text" style={{ width: "83%" }} />
                    <span className="skeleton sk-text" style={{ width: "91%" }} />
                  </>
                ) : description ? (
                  <p style={{ textAlign: "justify" }}>{description}</p>
                ) : (
                  <>
                    <p style={{ textAlign: "justify" }}>{STATIC_PARA_1}</p>
                    <br />
                    <p style={{ textAlign: "justify" }}>{STATIC_PARA_2}</p>
                  </>
                )}

                {/* founded_year & employee_count from /api/about/ */}
                {!loading && (foundedYear || employeeCount) && (
                  <div className="about-stats-bar">
                    {foundedYear && (
                      <div className="about-stat">
                        <span className="about-stat-value">{foundedYear}</span>
                        <span className="about-stat-label">Founded</span>
                      </div>
                    )}
                    {employeeCount && (
                      <div className="about-stat">
                        <span className="about-stat-value">{employeeCount}+</span>
                        <span className="about-stat-label">Employees</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            <div className="col-lg-7 wow animate fadeInRight" data-wow-delay="200ms" data-wow-duration="1500ms">
              <div className="about-img magnetic-item">
                <img
                  width={750}
                  height={580}
                  src={STATIC_IMAGE}
                  alt={heading}
                />
              </div>
            </div>
          </div>

          {/* ── Vision & Mission from /api/about/ ── */}
          <div className="about-cards-section wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
            <div className="about-cards-grid">

              <div className="about-card">
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <h6>VISION</h6>
                {loading
                  ? <span className="skeleton sk-text" style={{ width: "85%" }} />
                  : <p>{vision}</p>
                }
                <div className="about-card-corner" />
              </div>

              <div className="about-card">
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-13a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                  </svg>
                </div>
                <h6>MISSION</h6>
                {loading
                  ? <span className="skeleton sk-text" style={{ width: "90%" }} />
                  : <p>{mission}</p>
                }
                <div className="about-card-corner" />
              </div>

            </div>
          </div>

        </div>

        <React.Fragment>
          <ModalVideo
            channel="youtube"
            isOpen={isOpen}
            animationSpeed={350}
            videoId="r4KpWiK08vM"
            ratio="16:9"
            onClose={() => setOpen(false)}
          />
        </React.Fragment>
      </div>
    </>
  );
};

export default HomePageAboutSection;