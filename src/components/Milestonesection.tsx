"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  image?: string;
  image_url?: string;
  tags?: string;
  tags_list?: string[];
  order?: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "https://api.kavalakat.com/api").replace(/\/$/, "");

const FALLBACK_IMAGE = "/assets/new-images/projects/project-1.jpg";

async function fetchMilestones(): Promise<Milestone[]> {
  try {
    let allMilestones: Milestone[] = [];
    let nextUrl: string | null = `${API_BASE}/milestones/`;

    while (nextUrl) {
      const res: Response = await fetch(nextUrl, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`[API] /milestones/ returned ${res.status}`);
        break;
      }

      const json = await res.json();
      console.log("[API] /milestones/", json);

      // Extract data from envelope
      let pageData: Milestone[] = [];
      if (json && !Array.isArray(json) && "data" in json) {
        pageData = json.data as Milestone[];
        nextUrl = json.pagination?.next ?? null;
      } else if (json && !Array.isArray(json) && "results" in json) {
        pageData = json.results as Milestone[];
        nextUrl = json.next ?? null;
      } else if (Array.isArray(json)) {
        pageData = json as Milestone[];
        nextUrl = null; // No pagination
      } else {
        nextUrl = null;
      }

      allMilestones = [...allMilestones, ...pageData];
    }

    return allMilestones;
  } catch (err) {
    console.error("[API] Failed to fetch /milestones/:", err);
    return [];
  }
}

/** Resolve image: prefer image_url, fall back to image, then static fallback */
function resolveImage(m: Milestone, index: number): string {
  if (m.image_url && m.image_url.trim()) return m.image_url.trim();
  if (m.image    && m.image.trim())     return m.image.trim();
  // cycle through a few local fallbacks if needed
  const locals = [
    "/assets/new-images/projects/project-1.jpg",
    "/assets/new-images/projects/project-2.jpg",
    "/assets/new-images/projects/project-3.jpg",
  ];
  return locals[index % locals.length];
}

/** Resolve tags: prefer tags_list array, fall back to splitting the tags string */
function resolveTags(m: Milestone): string[] {
  if (Array.isArray(m.tags_list) && m.tags_list.length > 0) return m.tags_list;
  if (typeof m.tags === "string" && m.tags.trim()) {
    return m.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <div className="mil-row mil-in" style={{ opacity: 1 }}>
    <div className="mil-node-col">
      <div className="mil-node" style={{ border: "2px solid #d0dff0" }} />
      <div className="skeleton" style={{ width: 52, height: 22, borderRadius: 20, marginTop: 10 }} />
    </div>
    <div className="mil-dash" />
    <div className="mil-card-col">
      <div className="mil-card" style={{ marginRight: index % 2 === 0 ? 30 : 0, marginLeft: index % 2 !== 0 ? 30 : 0 }}>
        <div className="skeleton" style={{ width: "100%", aspectRatio: "16/10" }} />
      </div>
    </div>
    <div className="mil-body-col" style={{ padding: "0 16px" }}>
      <div className="skeleton" style={{ height: 26, width: "60%", marginBottom: 14, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: "100%", marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: "85%",  marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: "70%",  marginBottom: 16, borderRadius: 4 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skeleton" style={{ height: 24, width: 64, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 20 }} />
      </div>
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const MilestoneSection: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading]       = useState(true);

  // ── Fetch milestones ──
  useEffect(() => {
    let cancelled = false;
    fetchMilestones().then((data) => {
      if (!cancelled) {
        // Sort by order if present, otherwise by year
        const sorted = [...data].sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
          return Number(a.year) - Number(b.year);
        });
        setMilestones(sorted);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // ── Intersection observer for scroll animations ──
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("mil-in");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const rows = wrapRef.current?.querySelectorAll(".mil-row");
    rows?.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, [loading, milestones]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        .mil-section {
          --font-manrope: "Manrope", sans-serif;
          --font-dmsans:  "DM Sans",  sans-serif;
          --white-color:       #ffffff;
          --dark-title-color:  #1C1A1E;
          --title-color2:      #0160b2;
          --text-color:        #00000099;
          --primary-color1:    #0160b2;
          --borders-color:     #eee;
        }

        .mil-section {
          background: #f8f9fc;
          padding: 100px 0 120px;
          overflow: hidden;
          position: relative;
          font-family: var(--font-dmsans);
        }
        .mil-section::after {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 480px; height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(1,96,178,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Header */
        .mil-hdr {
          text-align: center;
          margin-bottom: 80px;
          position: relative;
          z-index: 1;
        }
        .mil-hdr h2 {
          font-family: var(--font-manrope);
          font-size: clamp(32px, 4.5vw, 54px);
          font-weight: 800;
          color: var(--dark-title-color);
          line-height: 1.1;
          margin: 0 0 18px;
          letter-spacing: -0.025em;
        }
        .mil-hdr h2 span {
          color: var(--title-color2);
          position: relative;
        }
        .mil-hdr h2 span::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 3px;
          background: var(--primary-color1);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          animation: mil-underline 0.7s cubic-bezier(0.16,1,0.3,1) 0.9s forwards;
        }
        @keyframes mil-underline { to { transform: scaleX(1); } }

        .mil-hdr p {
          font-size: 15px;
          color: var(--text-color);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.78;
        }

        /* Spine */
        .mil-wrap {
          position: relative;
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .mil-line {
          position: absolute;
          left: 50%;
          top: 30px; bottom: 30px;
          width: 2px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            transparent,
            #d0dff0 5%,
            #d0dff0 95%,
            transparent
          );
        }

        /* Row */
        .mil-row {
          display: grid;
          grid-template-columns: 1fr 88px 1fr;
          align-items: center;
          margin-bottom: 88px;
          position: relative;
        }
        .mil-row:last-child { margin-bottom: 0; }

        .mil-row:nth-child(odd)  .mil-card-col { grid-column: 1; grid-row: 1; }
        .mil-row:nth-child(odd)  .mil-body-col { grid-column: 3; grid-row: 1; }
        .mil-row:nth-child(even) .mil-card-col { grid-column: 3; grid-row: 1; }
        .mil-row:nth-child(even) .mil-body-col { grid-column: 1; grid-row: 1; }
        .mil-node-col { grid-column: 2; grid-row: 1; }

        /* Node */
        .mil-node-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 3;
        }
        .mil-node {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: var(--white-color);
          border: 2px solid #d0dff0;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          transition: border-color 0.45s, box-shadow 0.45s, transform 0.45s;
          z-index: 2;
        }
        .mil-node::before {
          content: '';
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          background: var(--primary-color1);
          transform: scale(0);
          transition: transform 0.45s cubic-bezier(0.34,1.56,0.64,1);
        }
        .mil-row.mil-in .mil-node {
          border-color: var(--primary-color1);
          box-shadow: 0 0 0 8px rgba(1,96,178,0.1), 0 4px 20px rgba(1,96,178,0.2);
          transform: scale(1.1);
        }
        .mil-row.mil-in .mil-node::before { transform: scale(1); }

        .mil-node-num {
          font-family: var(--font-manrope);
          font-size: 12px;
          font-weight: 800;
          color: var(--white-color);
          position: absolute;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.3s ease 0.35s;
        }
        .mil-row.mil-in .mil-node-num { opacity: 1; }

        .mil-year {
          margin-top: 10px;
          font-family: var(--font-manrope);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--white-color);
          background: var(--primary-color1);
          padding: 4px 12px;
          border-radius: 20px;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(1,96,178,0.3);
          opacity: 0;
          transform: translateY(8px) scale(0.9);
          transition: opacity 0.4s ease 0.4s, transform 0.4s ease 0.4s;
        }
        .mil-row.mil-in .mil-year { opacity: 1; transform: translateY(0) scale(1); }

        /* Dashed connector */
        .mil-dash {
          position: absolute;
          top: 26px; height: 1px;
          background: repeating-linear-gradient(
            90deg,
            var(--primary-color1) 0, var(--primary-color1) 4px,
            transparent 4px, transparent 10px
          );
          width: 0;
          transition: width 0.65s cubic-bezier(0.4,0,0.2,1) 0.3s;
          z-index: 1;
        }
        .mil-row:nth-child(odd)  .mil-dash { left:  calc(50% + 44px); }
        .mil-row:nth-child(even) .mil-dash { right: calc(50% + 44px); }
        .mil-row.mil-in .mil-dash { width: calc(50% - 80px); }

        /* Image card */
        .mil-card-col { position: relative; }
        .mil-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(1,96,178,0.1), 0 2px 8px rgba(0,0,0,0.06);
          background: var(--white-color);
          transition: box-shadow 0.4s, transform 0.4s;
        }
        .mil-row:nth-child(odd)  .mil-card { margin-right: 30px; }
        .mil-row:nth-child(even) .mil-card { margin-left:  30px; }
        .mil-card:hover {
          box-shadow: 0 16px 56px rgba(1,96,178,0.18), 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-4px);
        }
        .mil-card img {
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          display: block;
          transition: transform 0.7s ease;
        }
        .mil-card:hover img { transform: scale(1.04); }
        .mil-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(1,96,178,0.5) 0%, transparent 55%);
          z-index: 1;
          opacity: 0;
          transition: opacity 0.4s;
        }
        .mil-card:hover::before { opacity: 1; }

        .mil-stamp {
          position: absolute;
          top: 16px; z-index: 2;
          font-family: var(--font-manrope);
          font-size: 18px; font-weight: 800;
          letter-spacing: 0.04em;
          color: var(--white-color);
          background: var(--primary-color1);
          padding: 6px 14px;
          border-radius: 6px;
          box-shadow: 0 4px 14px rgba(1,96,178,0.4);
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity 0.4s ease 0.55s, transform 0.4s ease 0.55s;
        }
        .mil-row:nth-child(odd)  .mil-stamp { left:  16px; }
        .mil-row:nth-child(even) .mil-stamp { right: 16px; }
        .mil-row.mil-in .mil-stamp { opacity: 1; transform: translateY(0); }

        .mil-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--primary-color1);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.55s ease 0.4s;
          z-index: 3;
        }
        .mil-row.mil-in .mil-card::after { transform: scaleX(1); }

        /* Text body */
        .mil-body-col { padding: 0 16px; }
        .mil-row:nth-child(even) .mil-body-col { text-align: right; }

        .mil-body-col h3 {
          font-family: var(--font-manrope);
          font-size: clamp(19px, 2vw, 26px);
          font-weight: 800;
          color: var(--dark-title-color);
          line-height: 1.22;
          margin: 0 0 12px;
          letter-spacing: -0.018em;
        }
        .mil-body-col p {
          font-family: var(--font-dmsans);
          font-size: 14.5px;
          line-height: 1.78;
          color: var(--text-color);
          margin: 0 0 18px;
        }

        /* Chips */
        .mil-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .mil-row:nth-child(even) .mil-chips { justify-content: flex-end; }
        .mil-chip {
          font-family: var(--font-manrope);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--primary-color1);
          background: rgba(1,96,178,0.07);
          border: 1px solid rgba(1,96,178,0.18);
          padding: 4px 12px;
          border-radius: 20px;
          transition: background 0.22s, color 0.22s, border-color 0.22s;
          cursor: default;
        }
        .mil-chip:hover {
          background: var(--primary-color1);
          color: var(--white-color);
          border-color: var(--primary-color1);
        }

        /* Scroll animations */
        .mil-row:nth-child(odd) .mil-card-col {
          opacity: 0; transform: translateX(-72px);
          transition: opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1);
        }
        .mil-row:nth-child(odd) .mil-body-col {
          opacity: 0; transform: translateX(52px);
          transition: opacity 0.85s cubic-bezier(0.16,1,0.3,1) 0.16s, transform 0.85s cubic-bezier(0.16,1,0.3,1) 0.16s;
        }
        .mil-row:nth-child(even) .mil-card-col {
          opacity: 0; transform: translateX(72px);
          transition: opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1);
        }
        .mil-row:nth-child(even) .mil-body-col {
          opacity: 0; transform: translateX(-52px);
          transition: opacity 0.85s cubic-bezier(0.16,1,0.3,1) 0.16s, transform 0.85s cubic-bezier(0.16,1,0.3,1) 0.16s;
        }
        .mil-node-col {
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease 0.08s, transform 0.5s ease 0.08s;
        }
        .mil-row.mil-in .mil-card-col,
        .mil-row.mil-in .mil-body-col { opacity: 1; transform: translateX(0); }
        .mil-row.mil-in .mil-node-col  { opacity: 1; transform: translateY(0); }

        /* Footer */
        .mil-footer {
          text-align: center;
          margin-top: 80px;
          padding-top: 52px;
          border-top: 1px solid var(--borders-color);
        }
        .mil-footer p { font-family: var(--font-dmsans); font-size: 15px; color: var(--text-color); margin: 0; }
        .mil-footer a {
          font-weight: 600;
          color: var(--primary-color1);
          text-decoration: none;
          border-bottom: 1.5px solid rgba(1,96,178,0.3);
          padding-bottom: 1px;
          transition: border-color 0.2s, color 0.2s;
        }
        .mil-footer a:hover { color: #0146a0; border-color: var(--primary-color1); }

        /* Skeleton shimmer */
        .skeleton {
          background: linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          display: block;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty state */
        .mil-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-color);
          font-family: var(--font-dmsans);
          font-size: 15px;
        }

        /* ── Responsive ─────────────────────────────────────────────── */

        /* Large tablets / small laptops — keep two columns, ease spacing */
        @media (max-width: 1100px) {
          .mil-wrap { padding: 0 24px; }
          .mil-row { margin-bottom: 72px; }
          .mil-row:nth-child(odd)  .mil-card { margin-right: 20px; }
          .mil-row:nth-child(even) .mil-card { margin-left:  20px; }
          .mil-body-col { padding: 0 10px; }
        }

        /* Tablet & mobile — STACKED CARDS (image -> marker -> text), downward.
           Uses flex column so the grid-row / grid-column rules above are
           ignored entirely and can no longer cause the overlap bug. */
        @media (max-width: 900px) {
          .mil-row {
            display: flex !important;
            flex-direction: column;
            align-items: stretch;
            margin-bottom: 48px;
          }
          .mil-line,
          .mil-dash { display: none !important; }

          /* Stack order: image first, then year marker, then text */
          .mil-card-col { order: 1; width: 100%; margin-bottom: 16px; }
          .mil-node-col { order: 2; width: 100%; margin-bottom: 14px; }
          .mil-body-col { order: 3; width: 100%; }

          /* Image fills width, no side offset */
          .mil-row:nth-child(odd)  .mil-card,
          .mil-row:nth-child(even) .mil-card { margin: 0 !important; }

          /* Hide the duplicate year stamp on the image (year shows in marker) */
          .mil-stamp { display: none !important; }

          /* Year marker becomes a small horizontal strip under the image */
          .mil-node-col,
          .mil-row:nth-child(even) .mil-node-col {
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            gap: 12px;
          }
          .mil-node { width: 46px; height: 46px; }
          .mil-year { margin-top: 0; }

          /* Text always left-aligned */
          .mil-body-col,
          .mil-row:nth-child(even) .mil-body-col {
            text-align: left !important;
            padding: 0;
          }
          .mil-chips,
          .mil-row:nth-child(even) .mil-chips { justify-content: flex-start; }

          /* Force everything visible — never depends on the scroll observer,
             so content can't get stuck hidden or shifted off-position */
          .mil-card-col,
          .mil-body-col,
          .mil-node-col,
          .mil-row:nth-child(odd)  .mil-card-col,
          .mil-row:nth-child(odd)  .mil-body-col,
          .mil-row:nth-child(even) .mil-card-col,
          .mil-row:nth-child(even) .mil-body-col {
            opacity: 1 !important;
            transform: none !important;
          }
          .mil-node-num { opacity: 1 !important; }
          .mil-year { opacity: 1 !important; }
        }

        /* Small mobile */
        @media (max-width: 580px) {
          .mil-section { padding: 70px 0 80px; }
          .mil-hdr { margin-bottom: 52px; }
          .mil-hdr p { font-size: 14px; }
          .mil-wrap { padding: 0 16px; }
          .mil-row { margin-bottom: 40px; }
          .mil-body-col h3 { margin-bottom: 10px; }
          .mil-body-col p { font-size: 14px; }
        }

        /* Extra-small phones */
        @media (max-width: 400px) {
          .mil-section { padding: 56px 0 64px; }
          .mil-hdr { margin-bottom: 44px; }
          .mil-node { width: 42px; height: 42px; }
          .mil-node-col { gap: 10px; }
          .mil-year { font-size: 10px; padding: 3px 10px; }
          .mil-body-col h3 { font-size: 18px; }
          .mil-body-col p { font-size: 13.5px; }
          .mil-chip { font-size: 9px; padding: 3px 9px; letter-spacing: 0.06em; }
        }
      `}</style>

      <div className="mil-section">
        <div className="container">
          <div
            className="mil-hdr wow animate fadeInDown"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <h2>Our <span>Journey</span></h2>
            <p>
              From a single cement shop in 1976 to a multi-sector group — every
              milestone is a chapter in a story built on trust.
            </p>
          </div>
        </div>

        <div className="mil-wrap" ref={wrapRef}>
          <div className="mil-line" />

          {/* ── Loading skeletons ── */}
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}

          {/* ── Empty state ── */}
          {!loading && milestones.length === 0 && (
            <div className="mil-empty">No milestones found.</div>
          )}

          {/* ── API data ── */}
          {!loading && milestones.map((m, i) => {
            const tags  = resolveTags(m);
            const image = resolveImage(m, i);

            return (
              <div className="mil-row" key={m.id}>

                {/* Centre node */}
                <div className="mil-node-col">
                  <div className="mil-node">
                    <span className="mil-node-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mil-year">{m.year}</div>
                </div>

                {/* Dashed connector */}
                <div className="mil-dash" />

                {/* Image */}
                <div className="mil-card-col">
                  <div className="mil-card">
                    <img src={image} alt={m.title} />
                    <div className="mil-stamp">{m.year}</div>
                  </div>
                </div>

                {/* Text */}
                <div className="mil-body-col">
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  {tags.length > 0 && (
                    <div className="mil-chips">
                      {tags.map((tag, j) => (
                        <span className="mil-chip" key={j}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MilestoneSection;