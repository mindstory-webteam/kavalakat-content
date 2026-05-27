// ✅ FILE PATH: src/components/InnerPageHeader.tsx
"use client";
import React, { useEffect, useReducer, useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getContact, buildPortfolioHref, normalisePortfolioItem } from "@/lib/api";
import type { Contact, PortfolioItem } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.kavalakat.com/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem    { name: string; href: string }
interface NavGroups  { trading: NavItem[]; distribution: NavItem[]; services: NavItem[] }
interface BlogNavItem { title: string; slug: string }

// ─── Unwrap { success: true, data: ... } envelope ────────────────────────────

function unwrapEnvelope(json: any): any {
  if (json !== null && typeof json === "object" && !Array.isArray(json) && "success" in json && "data" in json) {
    return json.data;
  }
  return json;
}

// ─── Services slug helper ─────────────────────────────────────────────────────

function toSlug(s: string): string {
  return (s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── State & Reducer ──────────────────────────────────────────────────────────

interface State {
  activeMenu: string;
  activeSubMenu: string;
  isSidebarOpen: boolean;
  isLeftSidebarOpen: boolean;
  isRightSidebar: boolean;
  isLang: boolean;
  scrollY: number;
}

type Action =
  | { type: "TOGGLE_MENU"; menu: string }
  | { type: "TOGGLE_SUB_MENU"; subMenu: string }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "setScrollY"; payload: number }
  | { type: "TOGGLE_LEFT_SIDEBAR" }
  | { type: "TOGGLE_LANG" }
  | { type: "TOGGLE_RIGHTSIDEBAR" };

const initialState: State = {
  activeMenu: "",
  activeSubMenu: "",
  isSidebarOpen: false,
  isLeftSidebarOpen: false,
  isRightSidebar: false,
  isLang: false,
  scrollY: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_MENU":
      return {
        ...state,
        activeMenu: state.activeMenu === action.menu ? "" : action.menu,
        activeSubMenu: state.activeMenu === action.menu ? state.activeSubMenu : "",
      };
    case "TOGGLE_SUB_MENU":
      return { ...state, activeSubMenu: state.activeSubMenu === action.subMenu ? "" : action.subMenu };
    case "TOGGLE_SIDEBAR":
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case "setScrollY":
      return { ...state, scrollY: action.payload };
    case "TOGGLE_LEFT_SIDEBAR":
      return { ...state, isLeftSidebarOpen: !state.isLeftSidebarOpen };
    case "TOGGLE_LANG":
      return { ...state, isLang: !state.isLang };
    case "TOGGLE_RIGHTSIDEBAR":
      return { ...state, isRightSidebar: !state.isRightSidebar };
    default:
      return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const InnerPageHeader: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [navItems,    setNavItems]    = useState<NavGroups>({ trading: [], distribution: [], services: [] });
  const [blogNav,     setBlogNav]     = useState<BlogNavItem[]>([]);
  const [contactInfo, setContactInfo] = useState<Contact | null>(null);
  const pathname = usePathname();

  // ── Fetch contact info ────────────────────────────────────────────────────
  useEffect(() => {
    getContact().then((data) => {
      if (data) setContactInfo(data);
    });
  }, []);

  // ── Fetch blog posts for nav ──────────────────────────────────────────────
  useEffect(() => {
    const loadBlog = async () => {
      try {
        const res = await fetch(`${API}/blog/?page_size=6&status=published`);
        if (!res.ok) return;
        const json = await res.json();

        let posts: any[] = [];
        if (json.success !== undefined) {
          posts = json.data ?? [];
        } else if (Array.isArray(json)) {
          posts = json;
        } else if (json.results) {
          posts = json.results;
        }

        const items: BlogNavItem[] = posts
          .filter((p: any) => p.slug && p.title)
          .slice(0, 6)
          .map((p: any) => ({ title: p.title, slug: p.slug }));

        setBlogNav(items);
      } catch {
        // silently ignore
      }
    };
    loadBlog();
  }, []);

  // ── Fetch portfolio (trading + distribution) + services nav ──────────────
  useEffect(() => {
    const load = async () => {
      try {
        const trading:      NavItem[] = [];
        const distribution: NavItem[] = [];
        const services:     NavItem[] = [];

        // ── 1. Portfolio items (trading + distribution) ──────────────────
        try {
          const res = await fetch(`${API}/portfolio/page/`);
          if (res.ok) {
            const json = await res.json();
            const page = unwrapEnvelope(json);
            const hasData = page?.trading?.length || page?.distribution?.length;
            if (hasData) {
              (page.trading ?? []).forEach((i: PortfolioItem) => {
                const n = normalisePortfolioItem(i);
                trading.push({ name: n.name, href: buildPortfolioHref(n) });
              });
              (page.distribution ?? []).forEach((i: PortfolioItem) => {
                const n = normalisePortfolioItem(i);
                distribution.push({ name: n.name, href: buildPortfolioHref(n) });
              });
              // Also pull any services the portfolio/page endpoint still returns
              (page.services ?? []).forEach((i: PortfolioItem) => {
                const n = normalisePortfolioItem(i);
                services.push({ name: n.name, href: buildPortfolioHref(n) });
              });
            }
          }
        } catch { /* fall through */ }

        // If portfolio/page returned nothing, try flat items list
        if (!trading.length && !distribution.length) {
          try {
            const res  = await fetch(`${API}/portfolio/items/`);
            if (res.ok) {
              const json = await res.json();
              const data = unwrapEnvelope(json);
              const allItems: any[] = Array.isArray(data) ? data : (data.results ?? data.items ?? []);
              allItems
                .filter((i: any) => i.is_active !== false)
                .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                .forEach((item: any) => {
                  const n    = normalisePortfolioItem(item);
                  const href = buildPortfolioHref(n);
                  const entry = { name: n.name, href };
                  if (href.startsWith('/product/'))           trading.push(entry);
                  else if (href.startsWith('/distribution/')) distribution.push(entry);
                  else if (href.startsWith('/services/'))     services.push(entry);
                });
            }
          } catch { /* silently ignore */ }
        }

        // ── 2. Services from new /api/services/ endpoint ─────────────────
        // Always fetch — authoritative source for services column
        try {
          let url: string | null = `${API}/services/?is_active=true`;
          const serviceItems: NavItem[] = [];
          while (url) {
            const res  = await fetch(url, { cache: 'no-store' });
            if (!res.ok) break;
            const json = await res.json();
            const items: any[] = Array.isArray(json?.results)
              ? json.results
              : Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json) ? json : [];
            items.forEach((svc: any) => {
              if (svc.is_active === false) return;
              const slug = svc.slug || toSlug(svc.name);
              serviceItems.push({ name: svc.name, href: `/services/${slug}` });
            });
            url = json?.next ?? null;
          }
          if (serviceItems.length) {
            // Replace anything the portfolio endpoint put in services with fresh data
            services.length = 0;
            serviceItems.forEach(s => services.push(s));
          }
        } catch { /* silently ignore */ }

        setNavItems({ trading, distribution, services });
      } catch {
        // silently ignore
      }
    };
    load();
  }, []);

  // ── Scroll listener ───────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    dispatch({ type: "setScrollY", payload: window.scrollY });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleMenu         = (menu: string) => dispatch({ type: "TOGGLE_MENU", menu });
  const toggleRightSidebar = () => dispatch({ type: "TOGGLE_RIGHTSIDEBAR" });
  const toggleSidebar      = () => {
    dispatch({ type: "TOGGLE_MENU", menu: "" });
    dispatch({ type: "TOGGLE_SUB_MENU", subMenu: "" });
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  // ── Active path detection ─────────────────────────────────────────────────
  const isAboutActive     = ["/about", "/our-strengths", "/our-clients", "/gallery", "/milestone", "/projects"].some((p) => pathname.startsWith(p));
  const isPortfolioActive = ["/product", "/distribution", "/services"].some((p) => pathname.startsWith(p));
  const isBlogActive      = pathname.startsWith("/blog");
  const isContactActive   = ["/contact", "/career"].some((p) => pathname.startsWith(p));

  const fullAddress = contactInfo
    ? [contactInfo.address, contactInfo.city, contactInfo.state, contactInfo.pincode].filter(Boolean).join(", ")
    : "";

  // ── Reusable SVGs ─────────────────────────────────────────────────────────
  const chevronSvg = (
    <svg width={10} height={10} viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{ fill: "#ffffff" }}>
      <path d="M10 0.0495054L10 10.0001L8.13725 10.0001L-8.22301e-08 1.8812L1.86275 -3.55691e-07L7.35294 5.5446L7.30392 0.0495053L10 0.0495054Z" />
      <path d="M-9.6438e-05 10.0002L6.27441 10.0002L3.62736 7.32687L-9.63211e-05 7.32687L-9.6438e-05 10.0002Z" />
    </svg>
  );

  const phoneSvg = (
    <svg width={22} height={22} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.4233 16.9723L16.9701 14.0025C16.4049 13.6286 15.6474 13.7516 15.2296 14.2851L13.9324 15.953C13.8518 16.0593 13.7355 16.133 13.6049 16.1605C13.4743 16.1879 13.3382 16.1674 13.2215 16.1026L12.9748 15.9666C12.1568 15.5207 11.139 14.9656 9.08843 12.9143C7.03782 10.863 6.48163 9.84441 6.03578 9.02794L5.90048 8.78119C5.8348 8.66457 5.81347 8.52814 5.84042 8.39704C5.86736 8.26593 5.94077 8.14897 6.04712 8.06771L7.71384 6.77093C8.24713 6.35309 8.37031 5.59578 7.9969 5.03048L5.02713 0.577286C4.64443 0.00163523 3.87664 -0.171172 3.28419 0.184969L1.42202 1.30357C0.836918 1.64754 0.407665 2.20464 0.224235 2.85811C-0.446327 5.30138 0.0581298 9.51809 6.26973 15.7304C11.2109 20.6712 14.8894 21.9999 17.4178 21.9999C17.9997 22.0024 18.5792 21.9267 19.141 21.7748C19.7946 21.5916 20.3517 21.1623 20.6955 20.5771L21.8152 18.716C22.1719 18.1234 21.9992 17.3552 21.4233 16.9723Z" />
    </svg>
  );

  return (
    <>
      <style>{`
        header.style-1.inner-page{background-color:#0057C8!important;border-bottom:1px solid rgba(255,255,255,.15)!important}
        header.style-1.inner-page.sticky{background-color:#0057C8!important;box-shadow:0 4px 24px rgba(0,0,0,.18)!important}
        header.style-1.inner-page .main-menu>ul{border-color:rgba(255,255,255,.25)!important}
        header.style-1.inner-page .main-menu>ul>li>a{color:#fff!important}
        header.style-1.inner-page .main-menu>ul>li>a svg{fill:#fff!important}
        header.style-1.inner-page .main-menu>ul>li:hover>a,header.style-1.inner-page .main-menu>ul>li.active>a{background-color:#fff!important;color:#0057C8!important}
        header.style-1.inner-page .main-menu>ul>li:hover>a svg,header.style-1.inner-page .main-menu>ul>li.active>a svg{fill:#0057C8!important}
        header.style-1.inner-page .contact-area .icon{background-color:rgba(255,255,255,.15)!important}
        header.style-1.inner-page .contact-area .icon svg{fill:#fff!important}
        header.style-1.inner-page .contact-area .content span{color:rgba(255,255,255,.75)!important}
        header.style-1.inner-page .contact-area .content a{color:#fff!important}
        header.style-1.inner-page .nav-right::before{background-color:rgba(255,255,255,.4)!important}
        header.style-1.inner-page .nav-right .right-sidebar-button{background-color:rgba(255,255,255,.15)!important;border:1px solid rgba(255,255,255,.3)!important}
        header.style-1.inner-page .nav-right .right-sidebar-button svg{fill:#fff!important}
        header.style-1.inner-page .nav-right .right-sidebar-button span{color:#fff!important}
        header.style-1.inner-page .nav-right .right-sidebar-button:hover{background-color:#fff!important}
        header.style-1.inner-page .nav-right .right-sidebar-button:hover svg{fill:#0057C8!important}
        header.style-1.inner-page .nav-right .right-sidebar-button:hover span{color:#0057C8!important}
        header.style-1.inner-page .nav-right .mobile-menu-btn{border-color:rgba(255,255,255,.35)!important}
        header.style-1.inner-page .nav-right .mobile-menu-btn svg{fill:#fff!important}
        header.style-1.inner-page .main-menu>ul>li .bi{color:#fff!important}
        header.style-1.inner-page .main-menu>ul>li ul.sub-menu.product-mega-submenu .column-title{border-bottom-color:#0057C8!important}

        /* ── Right sidebar address overflow fix ── */
        .right-sidebar-menu .address-area,
        .right-sidebar-menu ul.address-area {
          max-width: 100%;
          overflow: hidden;
        }
        .right-sidebar-menu .address-area .single-address {
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          max-width: 100%;
        }
        .right-sidebar-menu .address-area .single-address span,
        .right-sidebar-menu .address-area .single-address a {
          display: block;
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: normal;
          max-width: 100%;
        }
      `}</style>

      {/* ── Right Sidebar ── */}
      <div className={`right-sidebar-menu ${state.isRightSidebar ? "show-right-menu" : ""}`}>
        <div className="right-sidebar-menu-wrap">

          <div className="sidebar-logo-area d-flex justify-content-between align-items-center">
            <div className="sidebar-logo-wrap">
              <Link href="/">
                <img width={157} height={34} alt="Kavalakat" src="/assets/new-images/logo/KavalakkatLogo-white.png" />
              </Link>
            </div>
            <div className="right-sidebar-close-btn" onClick={toggleRightSidebar}>
              <i className="bi bi-x" />
            </div>
          </div>

          <div className="sidebar-content-wrap">
            <div className="title-area">
              <span>Get In Touch With Us</span>
              <h2>Connect with Kavalakat</h2>
              <p>Ready to take the first step towards unlocking opportunity, realizing goals, and embracing innovation?</p>
            </div>

            <ul className="contact-area">

              {/* Phone */}
              {contactInfo?.phone && (
                <li>
                  <div className="single-contact">
                    <div className="icon">
                      <svg width={33} height={33} viewBox="0 0 33 33" xmlns="http://www.w3.org/2000/svg">
                        <path d="M26.0808 20.4419C25.4052 19.7385 24.5903 19.3624 23.7267 19.3624C22.87 19.3624 22.0481 19.7315 21.3447 20.435L19.1438 22.6289C18.9627 22.5314 18.7816 22.4408 18.6075 22.3503C18.3568 22.2249 18.12 22.1065 17.918 21.9812C15.8564 20.6718 13.9828 18.9654 12.1859 16.7575C11.3153 15.6571 10.7302 14.7307 10.3054 13.7905C10.8765 13.2681 11.4058 12.7248 11.9212 12.2025C12.1162 12.0075 12.3113 11.8055 12.5063 11.6105C13.9689 10.1478 13.9689 8.25339 12.5063 6.79077L10.6049 4.88935C10.3889 4.67344 10.1661 4.45057 9.95713 4.22769C9.53923 3.79587 9.10045 3.35012 8.64773 2.93222C7.97214 2.26359 7.16421 1.90839 6.3145 1.90839C5.46478 1.90839 4.64293 2.26359 3.94644 2.93222C3.93947 2.93919 3.93947 2.93919 3.93251 2.94615L1.56445 5.33511C0.672947 6.22661 0.164512 7.31313 0.0530735 8.57377C-0.114084 10.6075 0.484896 12.502 0.944577 13.7417C2.07289 16.7854 3.75839 19.6061 6.27271 22.6289C9.32332 26.2715 12.9938 29.148 17.1867 31.1748C18.7886 31.934 20.9268 32.8324 23.3158 32.9857C23.462 32.9926 23.6152 32.9996 23.7545 32.9996C25.3634 32.9996 26.7146 32.4215 27.7733 31.2723C27.7802 31.2584 27.7942 31.2514 27.8011 31.2375C28.1633 30.7987 28.5812 30.4017 29.02 29.9768C29.3195 29.6913 29.6259 29.3918 29.9254 29.0784C30.6149 28.361 30.9771 27.5252 30.9771 26.6685C30.9771 25.8049 30.608 24.9761 29.9045 24.2796L26.0808 20.4419Z" />
                        <path d="M17.8345 7.8506C19.6593 8.15705 21.3169 9.0207 22.6403 10.344C23.9636 11.6673 24.8203 13.325 25.1337 15.1498C25.2103 15.6095 25.6073 15.9299 26.06 15.9299C26.1157 15.9299 26.1645 15.9229 26.2202 15.9159C26.7356 15.8323 27.0769 15.3448 26.9933 14.8294C26.6172 12.6215 25.5725 10.6087 23.9775 9.01373C22.3826 7.41877 20.3697 6.37404 18.1618 5.99794C17.6464 5.91436 17.1659 6.25564 17.0753 6.76408C16.9848 7.27251 17.3191 7.76702 17.8345 7.8506Z" />
                        <path d="M32.9619 14.557C32.3421 10.9213 30.6287 7.61301 27.996 4.98029C25.3633 2.34757 22.055 0.634209 18.4193 0.0143347C17.9108 -0.0762086 17.4303 0.272035 17.3397 0.780471C17.2562 1.29587 17.5974 1.77645 18.1128 1.86699C21.3585 2.41722 24.3185 3.95645 26.6727 6.30362C29.0268 8.65774 30.5591 11.6178 31.1093 14.8634C31.1859 15.3231 31.5829 15.6435 32.0356 15.6435C32.0913 15.6435 32.1401 15.6365 32.1958 15.6296C32.7042 15.553 33.0525 15.0654 32.9619 14.557Z" />
                      </svg>
                    </div>
                    <div className="content">
                      <span>CALL ANY TIME</span>
                      <h6><a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a></h6>
                      {contactInfo.alt_phone && (
                        <h6><a href={`tel:${contactInfo.alt_phone}`}>{contactInfo.alt_phone}</a></h6>
                      )}
                    </div>
                  </div>
                  <svg className="arrow" width={8} height={29} viewBox="0 0 8 29" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.33333 3C1.33333 4.47276 2.52724 5.66667 4 5.66667C5.47276 5.66667 6.66667 4.47276 6.66667 3C6.66667 1.52724 5.47276 0.333333 4 0.333333C2.52724 0.333333 1.33333 1.52724 1.33333 3ZM3.64645 28.3536C3.84171 28.5488 4.15829 28.5488 4.35355 28.3536L7.53553 25.1716C7.7308 24.9763 7.7308 24.6597 7.53553 24.4645C7.34027 24.2692 7.02369 24.2692 6.82843 24.4645L4 27.2929L1.17157 24.4645C0.976311 24.2692 0.659728 24.2692 0.464466 24.4645C0.269204 24.6597 0.269204 24.9763 0.464466 25.1716L3.64645 28.3536ZM3.5 3V28H4.5V3H3.5Z" />
                  </svg>
                </li>
              )}

              {/* Social */}
              {(contactInfo?.facebook || contactInfo?.linkedin || contactInfo?.instagram) && (
                <li>
                  <div className="single-contact social">
                    <div className="icon">
                      <svg width={35} height={35} viewBox="0 0 35 35" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30.5966 7.4621C32.7313 10.243 34.0001 13.7234 34.0001 17.5C34.0001 26.6127 26.6128 34 17.5001 34C13.7331 34 10.261 32.7377 7.48364 30.6129" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M24.833 23H32.815" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="content">
                      <span>Follow Us</span>
                      <h6>
                        {contactInfo.facebook  && <><a href={contactInfo.facebook}  target="_blank" rel="noopener noreferrer">Facebook</a>{(contactInfo.linkedin || contactInfo.instagram) ? ", " : ""}</>}
                        {contactInfo.linkedin  && <><a href={contactInfo.linkedin}  target="_blank" rel="noopener noreferrer">LinkedIn</a>{contactInfo.instagram ? ", " : ""}</>}
                        {contactInfo.instagram && <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
                      </h6>
                    </div>
                  </div>
                </li>
              )}

              {/* Email */}
              {contactInfo?.email && (
                <li>
                  <div className="single-contact">
                    <div className="icon">
                      <svg width={33} height={32} viewBox="0 0 33 32" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M32.9896 1.18398C33.0176 0.995671 32.993 0.803292 32.9185 0.628097C32.844 0.452902 32.7225 0.301711 32.5675 0.191227C32.4126 0.0808885 32.2301 0.0155543 32.0404 0.00245033C31.8506 -0.0106536 31.6609 0.0289832 31.4923 0.116977L0.554753 16.2732C0.376749 16.3673 0.230082 16.5113 0.132753 16.6876C0.0354241 16.8638 -0.0083331 17.0646 0.00685184 17.2654C0.0220368 17.4662 0.0955032 17.6581 0.218235 17.8177C0.340966 17.9773 0.507624 18.0976 0.697753 18.1639L9.29838 21.1036L27.6148 5.44235L13.4413 22.5185L27.8554 27.4451C27.9984 27.4932 28.1502 27.5094 28.3002 27.4926C28.4501 27.4758 28.5946 27.4265 28.7235 27.348C28.8524 27.2696 28.9625 27.1639 29.0463 27.0384C29.1301 26.9129 29.1854 26.7706 29.2084 26.6215L32.9896 1.18398Z" />
                      </svg>
                    </div>
                    <div className="content">
                      <span>SAY HELLO</span>
                      <h6><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></h6>
                      {contactInfo.alt_email && (
                        <h6><a href={`mailto:${contactInfo.alt_email}`}>{contactInfo.alt_email}</a></h6>
                      )}
                    </div>
                  </div>
                </li>
              )}

            </ul>

            {fullAddress && (
              <ul className="address-area">
                <li className="single-address">
                  {contactInfo?.city && <span>{contactInfo.city}</span>}
                  <a href={contactInfo?.map_embed_url ? "#map" : "#"}>{fullAddress}</a>
                </li>
              </ul>
            )}
            <Link href="/contact" className="all-location-btn">View All Factory Location</Link>
          </div>

          <div className="sidebar-bottom-area">
            <p>Copyright 2025 <Link href="/">Kavalakat</Link> | Powered By <a href="https://mindstory.in/">MindStory</a></p>
          </div>
        </div>
      </div>

      {/* ── Inner Page Header ── */}
      <header className={`header-area style-1 inner-page ${state.scrollY > 20 ? "sticky" : ""}`}>
        <div className="container-fluid d-flex flex-nowrap align-items-center justify-content-between">

          {/* Logo */}
          <div className="company-logo">
            <Link href="/">
              <img width={157} height={34} alt="Kavalakat" className="img-fluid" src="/assets/new-images/logo/KavalakkatLogo-white.png" />
            </Link>
          </div>

          {/* Nav */}
          <div className={`main-menu ${state.isSidebarOpen ? "show-menu" : ""}`}>
            <div className="mobile-logo-area d-lg-none d-flex align-items-center justify-content-between">
              <Link href="/" className="mobile-logo-wrap">
                <img width={157} height={34} alt="Kavalakat" className="img-fluid" src="/assets/new-images/logo/KavalakkatLogo-white.png" />
              </Link>
              <div className="menu-close-btn" onClick={toggleSidebar}>
                <i className="bi bi-x" />
              </div>
            </div>

            <ul className="menu-list">

              <li className={pathname === "/" ? "active" : ""}><Link href="/">Home</Link></li>

              {/* About */}
              <li className={`menu-item-has-children ${isAboutActive ? "active" : ""}`}>
                <Link href="#" className="drop-down">About {chevronSvg}</Link>
                <i onClick={() => toggleMenu("about")} className={`bi bi-${state.activeMenu === "about" ? "dash" : "plus"} dropdown-icon`} />
                <ul className={`sub-menu ${state.activeMenu === "about" ? "d-block" : ""}`}>
                  <li className={pathname === "/about"         ? "active" : ""}><Link href="/about"><span>About</span></Link></li>
                  <li className={pathname === "/our-strengths" ? "active" : ""}><Link href="/our-strengths"><span>Our Strengths</span></Link></li>
                  <li className={pathname === "/milestone"     ? "active" : ""}><Link href="/milestone"><span>Milestones</span></Link></li>
                  <li className={pathname === "/projects"      ? "active" : ""}><Link href="/projects"><span>Projects</span></Link></li>
                  <li className={pathname === "/gallery"       ? "active" : ""}><Link href="/gallery"><span>Gallery</span></Link></li>
                </ul>
              </li>

              {/* Portfolio — dynamic mega menu */}
              <li className={`menu-item-has-children ${isPortfolioActive ? "active" : ""}`}>
                <Link href="/product" className="drop-down">Portfolio {chevronSvg}</Link>
                <i onClick={() => toggleMenu("portfolio")} className={`bi bi-${state.activeMenu === "portfolio" ? "dash" : "plus"} dropdown-icon`} />
                <ul className={`sub-menu product-mega-submenu ${state.activeMenu === "portfolio" ? "d-block" : ""}`}>

                  {navItems.trading.length > 0 && (
                    <li className="product-column">
                      <div className="column-title">TRADING</div>
                      <ul className="column-items">
                        {navItems.trading.map((n) => (
                          <li key={n.href} className={pathname === n.href ? "active" : ""}>
                            <Link href={n.href}><span>{n.name}</span></Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}

                  {navItems.distribution.length > 0 && (
                    <li className="product-column">
                      <div className="column-title">DISTRIBUTION</div>
                      <ul className="column-items">
                        {navItems.distribution.map((n) => (
                          <li key={n.href} className={pathname === n.href ? "active" : ""}>
                            <Link href={n.href}><span>{n.name}</span></Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}

                  {navItems.services.length > 0 && (
                    <li className="product-column">
                      <div className="column-title">SERVICES</div>
                      <ul className="column-items">
                        {navItems.services.map((n) => (
                          <li key={n.href} className={pathname === n.href ? "active" : ""}>
                            <Link href={n.href}><span>{n.name}</span></Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}

                </ul>
              </li>

              {/* Blog */}
              <li className={`menu-item-has-children ${isBlogActive ? "active" : ""}`}>
                <Link href="/blog" className="drop-down">Blog {chevronSvg}</Link>
                <i onClick={() => toggleMenu("blog")} className={`bi bi-${state.activeMenu === "blog" ? "dash" : "plus"} dropdown-icon`} />
                <ul className={`sub-menu ${state.activeMenu === "blog" ? "d-block" : ""}`}>
                  <li className={pathname === "/blog" ? "active" : ""}>
                    <Link href="/blog"><span>All Posts</span></Link>
                  </li>
                  {blogNav.map((post) => {
                    const href  = `/blog/${post.slug}`;
                    const label = post.title.length > 40 ? post.title.slice(0, 40).trimEnd() + "…" : post.title;
                    return (
                      <li key={post.slug} className={pathname === href ? "active" : ""}>
                        <Link href={href}><span>{label}</span></Link>
                      </li>
                    );
                  })}
                  {blogNav.length === 0 && (
                    <li style={{ opacity: 0.4, pointerEvents: "none" }}>
                      <Link href="#"><span>Loading…</span></Link>
                    </li>
                  )}
                </ul>
              </li>

              {/* Contact */}
              <li className={`menu-item-has-children ${isContactActive ? "active" : ""}`}>
                <Link href="/contact" className="drop-down">Contact {chevronSvg}</Link>
                <i onClick={() => toggleMenu("contact")} className={`bi bi-${state.activeMenu === "contact" ? "dash" : "plus"} dropdown-icon`} />
                <ul className={`sub-menu ${state.activeMenu === "contact" ? "d-block" : ""}`}>
                  <li className={pathname === "/contact" ? "active" : ""}><Link href="/contact"><span>Contact</span></Link></li>
                  <li className={pathname === "/career"  ? "active" : ""}><Link href="/career"><span>Careers</span></Link></li>
                </ul>
              </li>

            </ul>

            {/* Mobile phone */}
            {contactInfo?.phone && (
              <div className="contact-area d-lg-none d-flex">
                <div className="icon">{phoneSvg}</div>
                <div className="content">
                  <span>Any Question</span>
                  <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                </div>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="nav-right">
            {contactInfo?.phone && (
              <div className="contact-area d-lg-flex d-none">
                <div className="icon">{phoneSvg}</div>
                <div className="content">
                  <span>Any Question</span>
                  <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                </div>
              </div>
            )}
            <div className="right-sidebar-button" onClick={toggleRightSidebar}>
              <svg width={14} height={14} viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <rect width="11.2" height="1.4" rx=".699998" />
                <rect x="2.80078" y="5.6" width="11.2" height="2.79999" rx="1.4" />
                <rect y="12.6" width="11.2" height="1.4" rx=".699998" />
              </svg>
              <span>GET IN TOUCH</span>
            </div>
            <div className="sidebar-button mobile-menu-btn" onClick={toggleSidebar}>
              <svg width={20} height={20} viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.29608 0.0658336C0.609639 0.31147 0.139209 0.899069 0.0432028 1.63598C-0.0144009 2.09353 -0.0144009 5.4939 0.0432028 5.95146C0.129608 6.59686 0.489632 7.11703 1.07047 7.42046L1.36329 7.57458H3.83545H6.30761L6.59563 7.42046C6.96525 7.2278 7.25807 6.93401 7.45008 6.56314L7.60369 6.27416V3.79372V1.31328L7.45008 1.02429C7.25807 0.653433 6.96525 0.359633 6.59563 0.166978L6.30761 0.0128531L3.90745 0.00322056C1.83372 -0.00641251 1.4785 0.00322056 1.29608 0.0658336Z" />
                <path d="M11.6647 0.0658336C10.9783 0.31147 10.5079 0.899069 10.4119 1.63598C10.3879 1.82863 10.3687 2.80154 10.3687 3.79372C10.3687 4.7859 10.3879 5.75881 10.4119 5.95146C10.4983 6.59686 10.8583 7.11703 11.4391 7.42046L11.7319 7.57458H14.2041H16.6763L16.9643 7.42046C17.3339 7.2278 17.6267 6.93401 17.8187 6.56314L17.9723 6.27416V3.79372V1.31328L17.8187 1.02429C17.6267 0.653433 17.3339 0.359633 16.9643 0.166978L16.6763 0.0128531L14.2761 0.00322056C12.2024 -0.00641251 11.8471 0.00322056 11.6647 0.0658336Z" />
                <path d="M1.29608 10.4693C0.609639 10.7149 0.139209 11.3025 0.0432028 12.0394C-0.0144009 12.497 -0.0144009 15.8973 0.0432028 16.3549C0.129608 17.0003 0.489632 17.5205 1.07047 17.8239L1.36329 17.978H3.83545H6.30761L6.59563 17.8239C6.96525 17.6312 7.25807 17.3374 7.45008 16.9666L7.60369 16.6776V14.1972V11.7167L7.45008 11.4277C7.25807 11.0569 6.96525 10.7631 6.59563 10.5704L6.30761 10.4163L3.90745 10.4067C1.83372 10.397 1.4785 10.4067 1.29608 10.4693Z" />
                <path d="M13.2441 10.4934C11.8856 10.8498 10.8583 11.8853 10.5079 13.2531C10.3735 13.7781 10.3735 14.6162 10.5079 15.1412C10.8343 16.4127 11.732 17.3808 12.9945 17.8239C13.3593 17.9491 13.4937 17.9732 14.0601 17.9925C14.617 18.0117 14.7754 17.9973 15.1162 17.9106C16.5179 17.5542 17.5452 16.5283 17.9052 15.1219C18.0348 14.6162 18.03 13.7685 17.9004 13.2531C17.55 11.8757 16.5179 10.8401 15.145 10.4885C14.6314 10.3585 13.7529 10.3585 13.2441 10.4934Z" />
              </svg>
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default InnerPageHeader;