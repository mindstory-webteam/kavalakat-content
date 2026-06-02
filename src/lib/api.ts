
// ✅ FILE PATH: src/lib/api.ts
// Kavalakat — Centralized API Utility (TypeScript)
//
// ROUTING RULES:
//   services  → /services/[slug]           (existing route, unchanged)
//   ALL other categories (trading, distribution, new-test, etc.)
//             → /portfolio/[categorySlug]/[itemSlug]

const _raw = process.env.NEXT_PUBLIC_REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.kavalakat.com/api";
const BASE_URL = _raw.replace(/\/API\//gi, "/api/").replace(/\/$/, "");

export interface AuthTokens { access: string; refresh: string; }
export interface Page { id: number; title: string; slug: string; content?: string; meta_title?: string; meta_description?: string; is_active: boolean; }
export interface About { id: number; title: string; description: string; vision: string; mission: string; founded_year: number; employee_count: number; updated_at: string; }
export interface Strength { id: number; title: string; description: string; icon: string; image: string; image_url: string; order: number; is_active: boolean; }
export interface Milestone { id: number; year: number; title: string; description: string; image: string; image_url: string; tags: string; tags_list: string[]; order: number; }
export interface Project { id: number; title: string; description: string; client: string; client_logo: string; client_logo_url: string; client_location: string; location: string; year: number; tag: string; image: string; image_url: string; contact_url: string; is_featured: boolean; created_at: string; }
export interface TeamMember { id: number; name: string; role: string; image: string; image_url: string; social_platform: string; social_url: string; order: number; is_active: boolean; }
export interface GalleryItem { id: number; title: string; image: string; image_url: string; caption: string; order: number; is_active: boolean; created_at: string; }
export interface Contact { id: number; phone: string; alt_phone: string; email: string; alt_email: string; address: string; city: string; state: string; pincode: string; map_embed_url: string; whatsapp: string; facebook: string; instagram: string; linkedin: string; youtube: string; business_hours: string; updated_at: string; }
export interface SiteLocation { id: number; city: string; address: string; map_url: string; order: number; is_active: boolean; }
export interface Career { id: number; title: string; department: string; description: string; requirements: string; location: string; job_type: string; experience: string; salary_range: string; apply_url: string; is_active: boolean; deadline: string; is_expired: boolean; created_at: string; updated_at: string; }
export interface EnquiryPayload { name: string; email: string; phone: string; company?: string; subject: string; message: string; enquiry_type?: string; }
export interface PortfolioFeature { id: string; title: string; content: string; }
export interface PortfolioBrand { logo?: string; logoAlt?: string; companyName: string; description: string; icon?: string; }
export interface PortfolioTestimonial { quote: string; text: string; author: string; role: string; img: string; }

export interface PortfolioItem {
  id: number; name: string; slug?: string; description: string; image: string; image_url: string;
  tags: string[]; category: number; category_name: string; category_slug: string;
  is_featured: boolean; is_active: boolean; order: number;
  hero_title: string; banner_image: string; banner_image_url: string;
  about_title: string; about_description: string; about_image: string; about_image_url: string;
  features_title: string; features_image: string; features_image_url: string;
  features_json: string; features: PortfolioFeature[];
  brands_heading: string; brands_json: string; brands: PortfolioBrand[];
  testimonials_json: string; testimonials: PortfolioTestimonial[];
}

export interface PortfolioCategory { id: number; name: string; slug: string; description?: string; order: number; is_active: boolean; }
export interface PortfolioPageData { trading: PortfolioItem[]; distribution: PortfolioItem[]; services: PortfolioItem[]; [key: string]: PortfolioItem[]; }
export interface BlogPost { id: number; title: string; slug: string; excerpt: string; content?: string; image_url: string; category_name: string; author_name: string; status: string; tags: string[]; is_featured: boolean; views: number; meta_title?: string; meta_description?: string; created_at: string; published_at: string; updated_at?: string; }
export interface BlogCategory { id: number; name: string; slug: string; description?: string; post_count?: number; }
export interface AIBlogPayload { topic?: string; prompt?: string; [key: string]: unknown; }
export interface AILog { id: number; prompt: string; result: string; created_at: string; }
export interface AllPublicData { pages: Page[] | null; about: About | null; strengths: Strength[] | null; milestones: Milestone[] | null; projects: Project[] | null; team: TeamMember[] | null; gallery: GalleryItem[] | null; contact: Contact | null; locations: SiteLocation[] | null; careers: Career[] | null; portfolio: PortfolioPageData | null; portfolioCategories: PortfolioCategory[] | null; portfolioItems: PortfolioItem[] | null; blogPosts: BlogPost[] | null; blogCategories: BlogCategory[] | null; }

// ─── Core Fetcher ─────────────────────────────────────────────────────────────

async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}, token: string | null = null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers as Record<string, string>) };
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) { const errorBody = await response.text(); throw new Error(`API error [${response.status}] on ${endpoint}: ${errorBody}`); }
  if (response.status === 204) return null as T;
  const json = await response.json();
  if (json !== null && typeof json === "object" && !Array.isArray(json) && "success" in json && "data" in json) return json.data as T;
  return json as T;
}

// ─── parseContact ─────────────────────────────────────────────────────────────

export function parseContact(raw: unknown): Contact | null {
  if (!raw) return null;
  const info = Array.isArray(raw) ? raw[0] : (raw as Record<string, unknown>);
  if (!info) return null;
  const r = info as Record<string, unknown>;
  return { id: (r.id as number) ?? 0, phone: (r.phone as string) ?? "", alt_phone: (r.alt_phone as string) ?? "", email: (r.email as string) ?? "", alt_email: (r.alt_email as string) ?? "", address: (r.address as string) ?? "", city: (r.city as string) ?? "", state: (r.state as string) ?? "", pincode: (r.pincode as string) ?? "", map_embed_url: (r.map_embed_url as string) ?? "", whatsapp: (r.whatsapp as string) ?? "", facebook: (r.facebook as string) ?? "", instagram: (r.instagram as string) ?? "", linkedin: (r.linkedin as string) ?? "", youtube: (r.youtube as string) ?? "", business_hours: (r.business_hours as string) ?? "", updated_at: (r.updated_at as string) ?? "" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function safeParseJSON<T>(raw: string | T[] | null | undefined, fallback: T[] = []): T[] {
  if (Array.isArray(raw)) return raw;
  if (!raw) return fallback;
  try { const parsed = JSON.parse(raw as string); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; }
}

export function getImageUrl(url: string | undefined, fallback: string): string {
  if (!url || url.trim() === "") return fallback;
  if (url.startsWith("http")) return url;
  return `${BASE_URL.replace("/api", "")}${url}`;
}

export function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Portfolio Routing ────────────────────────────────────────────────────────
//
// ONLY services → /services/[itemSlug]
// Everything else (trading, distribution, new-test, any future category)
//   → /portfolio/[categorySlug]/[itemSlug]

const SERVICES_SLUGS = new Set(["services", "service", "hospitality"]);

export type PortfolioSection = "services" | "other";

export function classifyPortfolioItem(item: PortfolioItem): PortfolioSection {
  const slug    = (item.category_slug || "").toLowerCase().trim();
  const catName = (item.category_name || "").toLowerCase().trim();
  if (SERVICES_SLUGS.has(slug) || SERVICES_SLUGS.has(catName)) return "services";
  return "other";
}

/**
 * Builds the correct href for any portfolio item.
 *
 * services  → /services/[itemSlug]
 * all other → /portfolio/[categorySlug]/[itemSlug]
 */
export function buildPortfolioHref(item: PortfolioItem): string {
  const itemSlug     = item.slug ? nameToSlug(item.slug) : nameToSlug(item.name);
  const categorySlug = item.category_slug ? nameToSlug(item.category_slug) : "portfolio";
  const section      = classifyPortfolioItem(item);

  if (section === "services") return `/services/${itemSlug}`;
  return `/portfolio/${categorySlug}/${itemSlug}`;
}

export function normalisePortfolioItem(item: PortfolioItem): PortfolioItem {
  return {
    ...item,
    features:     safeParseJSON<PortfolioFeature>(item.features     ?? item.features_json),
    brands:       safeParseJSON<PortfolioBrand>(item.brands         ?? item.brands_json),
    testimonials: safeParseJSON<PortfolioTestimonial>(item.testimonials ?? item.testimonials_json),
  };
}

// ─── getAllPortfolioItems ─────────────────────────────────────────────────────
// Fetches ALL paginated items from /portfolio/items/ directly.
// No dependency on /portfolio/page/ — works for all categories.

export async function getAllPortfolioItems(): Promise<PortfolioItem[]> {
  const collected: PortfolioItem[] = [];
  let page = 1;

  while (true) {
    try {
      const res = await fetch(`${BASE_URL}/portfolio/items/?page=${page}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) break;
      const json = await res.json();

      // Handle both { success, data } and { data, pagination } wrappers
      const raw: unknown = json?.data ?? json?.results ?? json;
      const items: PortfolioItem[] = Array.isArray(raw) ? raw : [];
      const active = items.filter((i) => i.is_active !== false);
      collected.push(...active.map(normalisePortfolioItem));

      // Check for next page
      const nextUrl: string | null = json?.pagination?.next ?? json?.next ?? null;
      if (!nextUrl) break;
      page++;
    } catch {
      break;
    }
  }

  // Deduplicate by id
  const seen = new Set<number>();
  return collected.filter((i) => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });
}

// ─── getPortfolioItemBySlug ───────────────────────────────────────────────────
// Finds any item by slug across ALL categories, then fetches its full detail.

export async function getPortfolioItemBySlug(slug: string): Promise<PortfolioItem | null> {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/_/g, "-").replace(/\s+/g, "-");
  const target = normalize(slug);
  const all = await getAllPortfolioItems();
  const match = all.find((item) => {
    const candidates = [
      item.slug ? normalize(nameToSlug(item.slug)) : null,
      normalize(nameToSlug(item.name)),
    ].filter(Boolean) as string[];
    return candidates.some((c) => c === target);
  });
  if (!match) return null;
  try {
    const detail = await apiFetch<PortfolioItem>(`/portfolio/items/${match.id}/`);
    return normalisePortfolioItem(detail);
  } catch {
    return normalisePortfolioItem(match);
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getAuthToken(username: string, password: string): Promise<AuthTokens> { return apiFetch<AuthTokens>("/auth/token/", { method: "POST", body: JSON.stringify({ username, password }) }); }
export async function refreshAuthToken(refreshToken: string): Promise<{ access: string }> { return apiFetch<{ access: string }>("/auth/token/refresh/", { method: "POST", body: JSON.stringify({ refresh: refreshToken }) }); }
export async function verifyAuthToken(token: string): Promise<unknown> { return apiFetch("/auth/token/verify/", { method: "POST", body: JSON.stringify({ token }) }); }

// ─── Public Endpoints ─────────────────────────────────────────────────────────

export async function getPages(): Promise<Page[]> { return apiFetch<Page[]>("/pages/"); }
export async function getAbout(): Promise<About> { return apiFetch<About>("/about/"); }
export async function getStrengths(): Promise<Strength[]> { return apiFetch<Strength[]>("/strengths/"); }
export async function getMilestones(): Promise<Milestone[]> { return apiFetch<Milestone[]>("/milestones/"); }
export async function getProjects(): Promise<Project[]> { return apiFetch<Project[]>("/projects/"); }
export async function getProjectById(id: number): Promise<Project> { return apiFetch<Project>(`/projects/${id}/`); }
export async function getTeam(): Promise<TeamMember[]> { return apiFetch<TeamMember[]>("/team/"); }
export async function getGallery(): Promise<GalleryItem[]> { return apiFetch<GalleryItem[]>("/gallery/"); }

export async function getContact(): Promise<Contact | null> {
  try { const raw = await apiFetch<Contact | Contact[]>("/contact/"); return parseContact(raw); } catch { return null; }
}

export async function getLocations(): Promise<SiteLocation[]> {
  try {
    const raw = await apiFetch<unknown>("/locations/");
    if (Array.isArray(raw)) return raw as SiteLocation[];
    if (raw && typeof raw === "object" && "results" in (raw as object)) return ((raw as { results: SiteLocation[] }).results) ?? [];
    return [];
  } catch { return []; }
}

export async function getCareers(): Promise<Career[]> { return apiFetch<Career[]>("/careers/"); }
export async function getCareerById(id: number): Promise<Career> { return apiFetch<Career>(`/careers/${id}/`); }
export async function submitEnquiry(data: EnquiryPayload): Promise<unknown> { return apiFetch("/enquiry/", { method: "POST", body: JSON.stringify(data) }); }

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function getPortfolioPage(): Promise<PortfolioPageData> { return apiFetch<PortfolioPageData>("/portfolio/page/"); }
export async function getPortfolioCategories(): Promise<PortfolioCategory[]> { return apiFetch<PortfolioCategory[]>("/portfolio/categories/"); }

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  let raw: PortfolioItem[] | { results: PortfolioItem[] };
  try { raw = await apiFetch<PortfolioItem[] | { results: PortfolioItem[] }>("/portfolio/items/"); }
  catch { raw = await apiFetch<PortfolioItem[] | { results: PortfolioItem[] }>("/portfolio/"); }
  const items = Array.isArray(raw) ? raw : (raw.results ?? []);
  return items.map(normalisePortfolioItem);
}

export async function getPortfolioItemById(id: number): Promise<PortfolioItem> {
  const item = await apiFetch<PortfolioItem>(`/portfolio/items/${id}/`);
  return normalisePortfolioItem(item);
}

export async function getPortfolioSplit(): Promise<PortfolioPageData> {
  const items  = await getAllPortfolioItems();
  const active = items.filter((i) => i.is_active).sort((a, b) => a.order - b.order);
  const result: PortfolioPageData = { trading: [], distribution: [], services: [] };

  for (const item of active) {
    const section = classifyPortfolioItem(item);
    if (section === "services") {
      result.services.push(item);
    } else {
      // Group all non-services items under their category_slug key
      const key = (item.category_slug || "other").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!result[key]) result[key] = [];
      result[key].push(item);
      // Also push to legacy "trading" / "distribution" arrays for backward compat
      if (key === "trading")      result.trading.push(item);
      if (key === "distribution") result.distribution.push(item);
    }
  }
  return result;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getBlogPosts(params: Record<string, string> = {}): Promise<BlogPost[]> {
  const query = new URLSearchParams(params).toString();
  return apiFetch<BlogPost[]>(`/blog/${query ? `?${query}` : ""}`);
}
export async function getBlogPostBySlug(slug: string): Promise<BlogPost> { return apiFetch<BlogPost>(`/blog/${slug}/`); }
export async function getBlogCategories(): Promise<BlogCategory[]> { return apiFetch<BlogCategory[]>("/blog/categories/"); }

// ─── AI (protected) ───────────────────────────────────────────────────────────

export async function generateAIBlog(payload: AIBlogPayload, token: string): Promise<unknown> { return apiFetch("/ai/generate-blog/", { method: "POST", body: JSON.stringify(payload) }, token); }
export async function getAILogs(token: string): Promise<AILog[]> { return apiFetch<AILog[]>("/ai/logs/", {}, token); }

// ─── fetchAllPublicData ───────────────────────────────────────────────────────

export async function fetchAllPublicData(): Promise<AllPublicData> {
  const [pages, about, strengths, milestones, projects, team, gallery, contact, locations, careers, portfolio, portfolioCategories, portfolioItems, blogPosts, blogCategories] = await Promise.allSettled([getPages(), getAbout(), getStrengths(), getMilestones(), getProjects(), getTeam(), getGallery(), getContact(), getLocations(), getCareers(), getPortfolioPage(), getPortfolioCategories(), getPortfolioItems(), getBlogPosts(), getBlogCategories()]);
  function unwrap<T>(s: PromiseSettledResult<T>): T | null { return s.status === "fulfilled" ? s.value : null; }
  return { pages: unwrap(pages), about: unwrap(about), strengths: unwrap(strengths), milestones: unwrap(milestones), projects: unwrap(projects), team: unwrap(team), gallery: unwrap(gallery), contact: unwrap(contact), locations: unwrap(locations), careers: unwrap(careers), portfolio: unwrap(portfolio), portfolioCategories: unwrap(portfolioCategories), portfolioItems: unwrap(portfolioItems), blogPosts: unwrap(blogPosts), blogCategories: unwrap(blogCategories) };
}