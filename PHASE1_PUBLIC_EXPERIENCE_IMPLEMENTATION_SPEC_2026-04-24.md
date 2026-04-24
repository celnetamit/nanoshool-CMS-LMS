# Phase 1 Public Experience Implementation Spec

Date: 2026-04-24

Status: Execution-ready for coding

Primary references:
- [MODERNIZATION_PRD_2026-04-24.md](/home/itb09/Desktop/projects/nstc/MODERNIZATION_PRD_2026-04-24.md:1)
- [MODERNIZATION_EXECUTION_BACKLOG_2026-04-24.md](/home/itb09/Desktop/projects/nstc/MODERNIZATION_EXECUTION_BACKLOG_2026-04-24.md:1)
- [docs/architecture/routes.ts](/home/itb09/Desktop/projects/nstc/docs/architecture/routes.ts:1)
- [docs/architecture/sitemap.md](/home/itb09/Desktop/projects/nstc/docs/architecture/sitemap.md:1)
- [docs/architecture/component-inventory.md](/home/itb09/Desktop/projects/nstc/docs/architecture/component-inventory.md:1)

## 1. Purpose

This document turns Phase 1 into direct engineering scope for the public site.

Phase 1 covers:
- home page modernization
- domain hub implementation
- audience landing-page system
- mentor and partner trust surfaces
- legal index and trust completeness
- Payload-backed public content foundations

It is intentionally scoped so coding can begin without further strategy work.

## 2. Target Outcome

At the end of this phase, the public site should:
- express the NanoSchool concept clearly
- be editable through Payload for the most important public surfaces
- use the existing route contract cleanly
- support a credible browse-to-product journey
- be ready for Phase 2 commerce deepening

## 3. In-Scope Routes

### Existing route group to use

Use the current `app/(site)/(public)` route group as the canonical public surface.

### Required Phase 1 routes

- `/`
- `/ai`
- `/biotechnology`
- `/nanotechnology`
- `/enterprise`
- `/university`
- `/students`
- `/phd-professors`
- `/hiring-partners`
- `/mentors`
- `/partners`
- `/legal`
- `/legal/[slug]`

### Out of scope for this spec

- checkout behavior changes beyond keeping CTAs coherent
- participant, mentor, program-manager, and admin dashboard deepening
- product-detail conversion logic beyond content/layout readiness
- search ranking improvements

## 4. Current Baseline

### Public routing baseline

The repo already contains public pages under:
- `app/(site)/(public)/page.tsx`
- `app/(site)/(public)/[domain]/page.tsx`
- `app/(site)/(public)/enterprise/page.tsx`
- `app/(site)/(public)/university/page.tsx`
- `app/(site)/(public)/students/page.tsx`
- `app/(site)/(public)/phd-professors/page.tsx`
- `app/(site)/(public)/hiring-partners/page.tsx`
- `app/(site)/(public)/mentors/page.tsx`
- `app/(site)/(public)/partners/page.tsx`
- `app/(site)/(public)/legal/page.tsx`
- `app/(site)/(public)/legal/[slug]/page.tsx`

### Payload data baseline

The repo already has useful starting collections:
- `payload/collections/Pages.ts`
- `payload/collections/Domains.ts`
- `payload/collections/Audiences.ts`
- `payload/collections/Mentors.ts`
- `payload/collections/Products.ts`

### Gap in current baseline

The current public pages are still too hardcoded for the intended CMS-driven model, and the current collections are not yet rich enough to drive all Phase 1 sections cleanly.

## 5. Delivery Strategy

Implement this phase in four coding slices:

1. shared public data and component foundation
2. home page and domain hubs
3. audience, mentor, partner, and legal surfaces
4. content entry, seed data, and QA hardening

This should be executed as separate PRs where possible.

## 6. File Ownership Plan

### Public routes

- `app/(site)/(public)/page.tsx`
- `app/(site)/(public)/[domain]/page.tsx`
- `app/(site)/(public)/enterprise/page.tsx`
- `app/(site)/(public)/university/page.tsx`
- `app/(site)/(public)/students/page.tsx`
- `app/(site)/(public)/phd-professors/page.tsx`
- `app/(site)/(public)/hiring-partners/page.tsx`
- `app/(site)/(public)/mentors/page.tsx`
- `app/(site)/(public)/partners/page.tsx`
- `app/(site)/(public)/legal/page.tsx`
- `app/(site)/(public)/legal/[slug]/page.tsx`

### Shared public helpers to add

- `lib/cms/public/getHomePage.ts`
- `lib/cms/public/getDomainPage.ts`
- `lib/cms/public/getAudiencePage.ts`
- `lib/cms/public/getMentorsPage.ts`
- `lib/cms/public/getPartnersPage.ts`
- `lib/cms/public/getLegalIndex.ts`
- `lib/cms/public/getSeoMetadata.ts`

### Shared public components to add

- `components/marketing/HeroSection.tsx`
- `components/marketing/StatsStrip.tsx`
- `components/marketing/FeaturedPrograms.tsx`
- `components/marketing/AudienceGrid.tsx`
- `components/marketing/TrustStrip.tsx`
- `components/marketing/TestimonialGrid.tsx`
- `components/marketing/PartnerLogoStrip.tsx`
- `components/marketing/PageSectionRenderer.tsx`
- `components/domains/DomainHero.tsx`
- `components/domains/DomainHighlights.tsx`
- `components/domains/DomainFeaturedProducts.tsx`
- `components/domains/DomainAudienceLinks.tsx`
- `components/mentors/MentorGrid.tsx`
- `components/legal/LegalDocumentList.tsx`

### Payload collection files to edit

- `payload/collections/Pages.ts`
- `payload/collections/Domains.ts`
- `payload/collections/Audiences.ts`
- `payload/collections/Mentors.ts`

### Optional new Payload collections

If Phase 1 needs stronger structure than `Pages.ts` can safely provide, add:
- `payload/collections/Partners.ts`
- `payload/collections/Testimonials.ts`

Recommendation:
- add `Partners` as a collection
- add `Testimonials` as a collection
- keep generic long-form surfaces in `Pages`

## 7. Content Model Changes Required

### 7.1 Pages collection

Current `Pages.ts` is too generic for the new home and structured public pages.

Add fields:
- `pageType`
  - values: `generic`, `home`, `partner`, `campaign`, `about`
- `hero`
  - `eyebrow`
  - `headline`
  - `subheadline`
  - `primaryCtaLabel`
  - `primaryCtaUrl`
  - `secondaryCtaLabel`
  - `secondaryCtaUrl`
  - `media`
- `sections`
  - array of structured blocks

Initial supported section block types:
- `stats`
- `featuredProducts`
- `audienceCards`
- `mentorSpotlights`
- `partnerLogos`
- `testimonials`
- `faq`
- `richText`
- `ctaBanner`

Acceptance criteria:
- home page and partner page can be rendered from structured data, not hardcoded arrays

### 7.2 Domains collection

`Domains.ts` already has strong basics but needs more public-page structure.

Add fields:
- `hero`
  - `eyebrow`
  - `headline`
  - `subheadline`
  - `primaryCtaLabel`
  - `primaryCtaUrl`
- `highlights`
  - array of short domain value points
- `stats`
  - array of label/value pairs
- `audienceLinks`
  - relationship to `audiences`
- `testimonialReferences`
  - relationship to `testimonials`
- `partnerReferences`
  - relationship to `partners`

Acceptance criteria:
- each domain hub can render hero, proof, featured items, audience links, FAQs, and SEO from CMS data

### 7.3 Audiences collection

Current `Audiences.ts` is too thin for full landing pages.

Add fields:
- `headline`
- `subheadline`
- `heroImage`
- `valueProps`
  - array of title/description items
- `featuredProducts`
  - relationship to `products`
- `featuredMentors`
  - relationship to `mentors`
- `faq`
- `seo`
- `status`
- `domainOverrides`
  - array where each row links a `domain` and optional override content

Acceptance criteria:
- top-level audience pages work from CMS data
- domain-aware audience rendering is possible without duplicating whole pages

### 7.4 Mentors collection

Add or expand fields:
- `designation`
- `organization`
- `featured`
- `displayOrder`
- `shortBio`
- `credentials`
  - array of short lines
- `showOnMentorsPage`

Acceptance criteria:
- mentors page can be editorially curated

### 7.5 Partners collection

Add collection with fields:
- `name`
- `slug`
- `logo`
- `website`
- `partnerType`
- `shortDescription`
- `featured`
- `displayOrder`

Acceptance criteria:
- `/partners` can be collection-driven, not static text-only

### 7.6 Testimonials collection

Add collection with fields:
- `name`
- `role`
- `organization`
- `quote`
- `avatar`
- `domains`
- `products`
- `featured`
- `displayOrder`

Acceptance criteria:
- home and domain trust sections use reusable testimonial content

## 8. Public Data Layer Contract

All public routes in this phase should fetch via `lib/cms/public/*` helpers rather than embedding Payload queries directly in page files.

### Required helper behavior

- normalize missing draft-only documents
- return safe fallbacks for non-critical sections
- centralize `status=published` filtering
- shape data into view models usable by components
- keep metadata generation close to data fetch helpers

### Do not

- duplicate collection access logic across route files
- fetch raw Payload responses directly inside many components

## 9. Route-by-Route Build Spec

### 9.1 Home page `/`

File:
- `app/(site)/(public)/page.tsx`

Data source:
- `pages` collection entry with `path = '/'` and `pageType = 'home'`
- fallback to featured `domains`, `products`, `mentors`, `partners`, and `testimonials`

Required sections:
- hero
- domain cards
- learning-format or featured-offer section
- audience pathways
- trust metrics
- mentor spotlight or mentor grid
- partner strip
- testimonials
- CTA banner

Coding notes:
- remove hardcoded demo arrays from the page file
- move section rendering into `PageSectionRenderer`

Acceptance criteria:
- the page renders meaningfully from CMS data
- content team can change hero copy and key sections without code edits

### 9.2 Domain pages `/{domain}`

File:
- `app/(site)/(public)/[domain]/page.tsx`

Data source:
- `domains` collection by slug

Required sections:
- domain hero
- overview
- featured products
- audience links
- mentor highlights
- proof or stats
- FAQs
- CTA

Coding notes:
- use `generateMetadata`
- ensure invalid domain slugs return `notFound()`

Acceptance criteria:
- all three domain pages are distinct and data-driven

### 9.3 Audience pages

Files:
- `app/(site)/(public)/enterprise/page.tsx`
- `app/(site)/(public)/university/page.tsx`
- `app/(site)/(public)/students/page.tsx`
- `app/(site)/(public)/phd-professors/page.tsx`
- `app/(site)/(public)/hiring-partners/page.tsx`

Data source:
- `audiences` collection by slug

Required sections:
- hero
- audience value props
- relevant featured products
- mentor highlights if applicable
- tailored CTA
- optional domain pathways

Coding notes:
- share one audience page component implementation
- keep per-route file minimal and slug-driven

Acceptance criteria:
- audience pages differ by content, not by duplicate hardcoded JSX

### 9.4 Mentors page `/mentors`

File:
- `app/(site)/(public)/mentors/page.tsx`

Data source:
- `mentors` collection

Required sections:
- page hero
- mentor grid
- optional domain filter chips
- CTA for joining as mentor

Acceptance criteria:
- mentors list is driven by collection data and editorial ordering

### 9.5 Partners page `/partners`

File:
- `app/(site)/(public)/partners/page.tsx`

Data source:
- `partners` collection
- optional generic page shell from `pages`

Required sections:
- hero
- partner categories or logo grid
- collaboration value proposition
- inquiry CTA

Acceptance criteria:
- page is collection-backed and extensible

### 9.6 Legal index `/legal`

File:
- `app/(site)/(public)/legal/page.tsx`

Data source:
- `legalDocuments` collection

Required sections:
- page intro
- grouped legal document list
- support/contact block

Acceptance criteria:
- all legal pages are discoverable from one index

## 10. Component Build Spec

### Build first

- `HeroSection`
- `PageSectionRenderer`
- `AudienceGrid`
- `PartnerLogoStrip`
- `TestimonialGrid`
- `DomainHero`
- `DomainFeaturedProducts`
- `MentorGrid`
- `LegalDocumentList`

### Component rules

- prefer server components by default
- only mark interactive pieces as client components
- avoid embedding content defaults inside presentational components
- support empty-state guards for missing CMS data

### Styling rules

- preserve the new `app/(site)` public styling direction
- do not regress into generic card-wall layouts
- prefer shared section spacing and page-shell patterns over page-specific one-offs

## 11. Metadata and SEO Spec

Each public route in this phase must support:
- title
- description
- og image where available
- canonical path derivation from route

Source priority:
1. route-specific collection SEO fields
2. hero or summary content fallback
3. safe app default

Files:
- `lib/cms/public/getSeoMetadata.ts`
- route-level `generateMetadata`

Acceptance criteria:
- home, domain, audience, mentors, partners, and legal pages all expose structured metadata

## 12. Seed and Content Entry Spec

Before calling Phase 1 complete, seed or create content for:
- one home page entry
- three domains
- five audiences
- at least six mentors
- at least six partners
- at least six testimonials

Required engineering work:
- add seed helpers or manual admin checklist
- document minimum publishable content set

Acceptance criteria:
- a fresh environment can be populated enough to visually validate the public experience

## 13. Suggested PR Sequence

### PR 1

Public CMS foundation

Scope:
- collection schema additions
- `lib/cms/public/*` helpers
- `Partners` and `Testimonials` collections if approved

### PR 2

Shared public components

Scope:
- hero, section renderer, trust components, legal list, mentor grid, domain components

### PR 3

Home and domain pages

Scope:
- rebuild `/`
- rebuild `/{domain}`
- metadata support

### PR 4

Audience, mentors, partners, and legal pages

Scope:
- slug-driven audience template
- mentors page
- partners page
- legal index polish

### PR 5

Content population and QA hardening

Scope:
- seeds or admin entry guide
- mobile QA fixes
- empty-state and missing-data hardening

## 14. Phase 1 Definition of Done

Phase 1 is done when:
- the home page is CMS-driven enough for editorial updates
- domain pages render from `domains` data
- audience pages render from `audiences` data
- mentors and partners are collection-driven
- legal index is complete
- metadata is wired for all major public routes
- the public site can be validated with seeded or entered content

## 15. Immediate Coding Start Point

If coding begins now, start with this exact order:

1. extend `Audiences.ts`
2. extend `Domains.ts`
3. add `Partners.ts`
4. add `Testimonials.ts`
5. add `lib/cms/public/getHomePage.ts`
6. add `lib/cms/public/getDomainPage.ts`
7. add `components/marketing/HeroSection.tsx`
8. add `components/marketing/PageSectionRenderer.tsx`
9. rebuild `app/(site)/(public)/page.tsx`
10. rebuild `app/(site)/(public)/[domain]/page.tsx`

That order gives the fastest path from planning into visible product progress.
