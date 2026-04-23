# NSTC Platform — SEO Rules & Strategy

## Title Tag Format

| Page Type | Format |
|---|---|
| Homepage | `NSTC — AI, Biotechnology & Nanotechnology Learning Platform` |
| Domain | `[Domain] Courses, Programs & Internships — NSTC` |
| Product listing | `[Product Type] in [Domain] — NSTC` |
| Product detail | `[Product Title] — [Domain] [Type] — NSTC` |
| Audience page | `[Audience] Learning Programs — NSTC` |
| Dashboard | `[Section] — NSTC Dashboard` (noindex) |
| Legal | `[Policy Name] — NSTC` |

---

## Meta Description Format (150–160 chars)

| Page Type | Template |
|---|---|
| Domain | `Explore [Domain] courses, workshops, internships and flagship programs. Learn from industry mentors at NSTC.` |
| Product | `[Short description of product]. Enroll in [Title] and get certified. Available for [audience].` |
| Audience | `NSTC offers tailored [Domain] programs for [Audience]. Explore learning paths, certifications, and mentorship.` |

---

## Canonical URL Rules

- All product URLs are canonical to their first published route
- No duplicate content across domain pages and top-level pages
- `rel=canonical` on all paginated listing pages pointing to page 1
- Dashboard routes: `noindex, nofollow`
- Auth routes: `noindex, nofollow`
- Search result pages: `noindex` (dynamic content)

---

## OG Image Strategy

- Static pages: designed OG image per page (generated at build time)
- Product pages: dynamic OG image using Next.js `ImageResponse`
  - Include: product title, domain badge, NSTC logo, price
- Domain pages: dynamic OG image with domain name + hero visual
- Fallback: default NSTC branded OG image (`/og-default.png`)

---

## Structured Data (JSON-LD)

| Page | Schema Type |
|---|---|
| Product detail (course) | `Course` |
| Product detail (workshop) | `EducationEvent` |
| Mentor profile | `Person` |
| Homepage | `Organization` + `WebSite` |
| FAQ sections | `FAQPage` |
| Legal pages | `WebPage` |

---

## Sitemap Rules

- `sitemap.ts` auto-generates from DB: all published products, domain pages, audience pages
- Update frequency: products = `weekly`, static pages = `monthly`
- Exclude: dashboard routes, auth routes, draft products, admin routes
- Submit to Google Search Console on each major deployment

---

## Robots.txt Rules

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /admin/
Sitemap: https://yourdomain.com/sitemap.xml
```

---

## URL Stability Rules

1. Product slugs are **immutable** after first publish — never rename
2. Domain slugs are **locked**: `ai`, `biotechnology`, `nanotechnology`
3. If a product is removed, return 301 redirect to the domain listing page
4. Legal page slugs are **locked** — changes are version bumps only

---

## Performance Targets (Core Web Vitals)

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| FID / INP | < 100ms |
| CLS | < 0.1 |
| TTFB | < 800ms |
| Lighthouse Performance | > 85 |
