# NSTC Platform — Code vs PRD Gap Analysis

Date: 2026-04-23

Reference baselines reviewed:
- `LMS Platform — Technical PRD (v1)`
- `Lms Platform Execution Pack`
- `planning`

## Executive Summary

The repo captures the intended stack and some of the core foundations from the PRD:
- `Next.js + Payload + Postgres + Redis + Razorpay + Moodle`
- role-aware dashboard structure
- base commerce and enrollment tables
- product/domain/audience modeling
- webhook-driven payment architecture

The biggest current gap is not stack choice but implementation completeness and alignment. The codebase is strongest in foundational schema/service scaffolding and weakest in:
- route coverage promised by the PRD
- end-to-end enrollment flow consistency
- CMS-driven content delivery
- dashboard completeness
- production readiness of search, invoices, and learning operations

## What Matches The PRD Well

- Core stack choice matches the planning and PRD.
- Database schema broadly reflects the execution pack in [scripts/migrate.sql](/home/itb09/Desktop/projects/nstc/scripts/migrate.sql:1).
- Product model supports domain, type, pricing, mentors, audiences, curriculum-ish content, SEO, and Moodle IDs in [payload/collections/Products.ts](/home/itb09/Desktop/projects/nstc/payload/collections/Products.ts:1).
- Razorpay is designed to be webhook-led in [app/api/payment/webhook/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/webhook/route.ts:1).
- Domain listing and product detail route patterns align with the canonical route doc in [docs/architecture/routes.ts](/home/itb09/Desktop/projects/nstc/docs/architecture/routes.ts:1).

## Prioritized Fix List

### P0 — Core Product Flow Breakers

1. Broken enroll CTA on product detail pages
Evidence:
- Product pages link to `/api/enroll?productId=...` in [app/(public)/[domain]/[type]/[slug]/page.tsx](/home/itb09/Desktop/projects/nstc/app/(public)/[domain]/[type]/[slug]/page.tsx:152) and [app/(public)/[domain]/[type]/[slug]/page.tsx](/home/itb09/Desktop/projects/nstc/app/(public)/[domain]/[type]/[slug]/page.tsx:188).
- There is no `app/api/enroll/route.ts`.
- The actual implemented payment API is `/api/payment/create-order` used by [components/checkout/CheckoutModal.tsx](/home/itb09/Desktop/projects/nstc/components/checkout/CheckoutModal.tsx:85).

Impact:
- A user can reach a published product page and hit a dead or incorrect enrollment path.

Fix:
- Replace the detail-page CTA with the checkout modal flow or implement the PRD-promised `/api/enroll` route and use it consistently.

2. PRD-promised routes are missing while the UI links to them
Evidence:
- Missing public pages: `/enterprise`, `/university`, `/students`, `/phd-professors`, `/hiring-partners`, `/join-us`, `/mentors`, `/partners`.
- Missing dashboard pages: `/dashboard/participant/certificates`, `/dashboard/mentor/programs`, `/dashboard/mentor/students`, `/dashboard/program-manager/cohorts`, `/dashboard/program-manager/progress`, `/dashboard/admin/products`.
- These URLs are linked from [app/(public)/page.tsx](/home/itb09/Desktop/projects/nstc/app/(public)/page.tsx:183), [components/layout/Header.tsx](/home/itb09/Desktop/projects/nstc/components/layout/Header.tsx:75), [components/layout/Footer.tsx](/home/itb09/Desktop/projects/nstc/components/layout/Footer.tsx:15), [app/dashboard/participant/page.tsx](/home/itb09/Desktop/projects/nstc/app/dashboard/participant/page.tsx:57), [app/dashboard/mentor/layout.tsx](/home/itb09/Desktop/projects/nstc/app/dashboard/mentor/layout.tsx:22), [app/dashboard/program-manager/layout.tsx](/home/itb09/Desktop/projects/nstc/app/dashboard/program-manager/layout.tsx:23), and [app/dashboard/admin/page.tsx](/home/itb09/Desktop/projects/nstc/app/dashboard/admin/page.tsx:183).

Impact:
- The sitemap promised by the PRD is not navigable today.
- Top-level navigation leads users into 404s or unfinished experiences.

Fix:
- Implement stub-but-real pages for every linked route first, then deepen them incrementally.

3. Public product flow is not wired to the commerce UX the repo already contains
Evidence:
- The checkout experience exists in [components/checkout/CheckoutModal.tsx](/home/itb09/Desktop/projects/nstc/components/checkout/CheckoutModal.tsx:1).
- Product detail pages do not use it and instead link to `/api/enroll`.

Impact:
- The public product detail page, which should be the main conversion page, is not connected to the intended purchase flow.

Fix:
- Move to a single enrollment entrypoint:
  either modal-based checkout on detail pages,
  or a dedicated checkout page that calls `/api/payment/create-order`.

4. Local build/debug confidence is still incomplete
Evidence:
- Local `next build` in this workspace currently returns only the generic message `Build failed because of webpack errors` without a stable root-cause trace.
- Deployment previously failed on `.dockerignore` context issues and build validation is not yet fully trustworthy.

Impact:
- Shipping changes remains riskier than it should be.

Fix:
- Make local build reproducible and quiet before deeper feature work.
- Add a clean build script and verify against a production-like env.

### P1 — High-Impact PRD Mismatches

5. The website content layer is mostly hardcoded, not CMS-driven
Evidence:
- Home page content is hardcoded in [app/(public)/page.tsx](/home/itb09/Desktop/projects/nstc/app/(public)/page.tsx:1).
- Domain page content is hardcoded in [app/(public)/[domain]/page.tsx](/home/itb09/Desktop/projects/nstc/app/(public)/[domain]/page.tsx:1).
- The PRD and planning docs position Payload CMS as the content backbone for marketing, catalog, legal, and audience content.

Impact:
- Editorial teams cannot manage core landing pages through Payload as intended.
- Content governance and versioning benefits from the PRD are not realized.

Fix:
- Migrate home, domain, audience, mentor listing, and legal content to Payload-backed queries.
- Reserve hardcoded content only for fallback shells.

6. Audience landing pages exist in the PRD but not in the route tree
Evidence:
- PRD requires top-level and domain-scoped audience pages.
- Route tree only has domain, listing, product, legal, search, login, and dashboards.

Impact:
- A major SEO and segmentation layer from the planning doc is missing.

Fix:
- Create Payload-backed audience collections or globals and implement:
  `/enterprise`, `/university`, `/students`, `/phd-professors`, `/hiring-partners`, `/mentors`, and domain-specific audience pages.

7. Products API only partially implements the execution-pack contract
Evidence:
- `GET /api/products` exists in [app/api/products/route.ts](/home/itb09/Desktop/projects/nstc/app/api/products/route.ts:1).
- It parses `audience` but does not apply it.
- There is no `/api/products/{slug}` route even though the execution pack specifies it.
- Admin product create/update endpoints are referenced in [docs/architecture/routes.ts](/home/itb09/Desktop/projects/nstc/docs/architecture/routes.ts:1) but not implemented.

Impact:
- Catalog integrations are incomplete.
- Frontend and API contract are drifting apart.

Fix:
- Implement audience filtering through `product_audiences`.
- Add product detail API route.
- Add admin CRUD endpoints or remove them from the canonical route contract until ready.

8. Product detail pages are still placeholder-heavy instead of using product data model richness
Evidence:
- Static placeholder outcomes and curriculum in [app/(public)/[domain]/[type]/[slug]/page.tsx](/home/itb09/Desktop/projects/nstc/app/(public)/[domain]/[type]/[slug]/page.tsx:98).
- The Payload product schema already supports curriculum, FAQs, prerequisites, learning outcomes, mentors, SEO, and related products in [payload/collections/Products.ts](/home/itb09/Desktop/projects/nstc/payload/collections/Products.ts:1).

Impact:
- Product pages underdeliver on conversion and informational quality relative to the PRD.

Fix:
- Hydrate product detail pages from the real product model and remove placeholders.

9. Semantic search is still mocked
Evidence:
- [app/api/search/semantic/route.ts](/home/itb09/Desktop/projects/nstc/app/api/search/semantic/route.ts:1) explicitly returns a mock response.

Impact:
- The “intelligent search & recommendations” promise is only partially met.

Fix:
- Either implement pgvector/Meilisearch semantic augmentation or disable the semantic endpoint until real.

10. Invoice generation is incomplete after PDF creation
Evidence:
- [app/api/payment/webhook/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/webhook/route.ts:136) has a TODO to upload generated PDFs to storage.
- It currently writes a placeholder URL like `/invoices/{id}.pdf`.

Impact:
- Invoices are not truly deliverable or durable.

Fix:
- Upload invoice buffers to S3/R2 and store the real signed/public URL.

11. Free-product enrollment flow is unimplemented
Evidence:
- [app/api/payment/create-order/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/create-order/route.ts:65) returns a placeholder `free: true` response with no actual enrollment.

Impact:
- Free products cannot complete the intended journey.

Fix:
- Create direct enrollment + invoice bypass logic for zero-price products.

### P2 — Operational And Quality Gaps

12. Moodle operations are synchronous in the webhook path instead of queue-led by default
Evidence:
- Queue infrastructure exists in [lib/queues/moodle-sync.queue.ts](/home/itb09/Desktop/projects/nstc/lib/queues/moodle-sync.queue.ts:1).
- Webhook still calls `syncUserEnrollment` directly in [app/api/payment/webhook/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/webhook/route.ts:143).

Impact:
- Payment webhooks are more fragile and slower than they need to be.

Fix:
- Move Moodle sync and retry behavior fully onto BullMQ jobs.

13. Search indexing is declared but not actually wired
Evidence:
- Product after-change hook only logs reindexing in [payload/collections/Products.ts](/home/itb09/Desktop/projects/nstc/payload/collections/Products.ts:166).
- Search service exists in [lib/search/index.ts](/home/itb09/Desktop/projects/nstc/lib/search/index.ts:1).

Impact:
- Search freshness depends on manual or future work.

Fix:
- Call real indexing/removal functions from collection hooks or background jobs.

14. Email configuration drift existed between code and env docs
Evidence:
- The repo uses Resend in [services/email.service.ts](/home/itb09/Desktop/projects/nstc/services/email.service.ts:1).
- The original `.env.example` documented SMTP keys instead of `RESEND_API_KEY`.
- This has now been partially corrected, but runtime configuration and docs still need a final pass.

Impact:
- Higher risk of misconfigured deployments.

Fix:
- Standardize on one email provider contract and remove legacy SMTP naming if not supported.

15. Legal and trust surfaces are only partially realized
Evidence:
- Legal slug pages exist at [app/(public)/legal/[slug]/page.tsx](/home/itb09/Desktop/projects/nstc/app/(public)/legal/[slug]/page.tsx:1).
- No legal index route page exists for `/legal`.
- Several trust promises like partner pages and policy navigation are linked but missing.

Impact:
- Public credibility and compliance surface is incomplete.

Fix:
- Add `/legal` index plus the missing supporting top-level trust pages.

## Recommended Execution Order

### Wave 1 — Conversion And Route Integrity

1. Fix product detail enrollment flow to use the real checkout path.
2. Implement every linked but missing route as a real page shell.
3. Add `/api/enroll` only if you want to keep the PRD contract; otherwise remove references and standardize on `/api/payment/create-order`.
4. Stabilize local production build verification.

### Wave 2 — PRD Core Surface Completion

1. Implement audience landing pages.
2. Implement missing dashboard pages:
   participant certificates,
   mentor programs,
   mentor students,
   program manager cohorts,
   program manager progress,
   admin products.
3. Fill out product detail from real DB/Payload fields.
4. Complete free-product enrollment flow.

### Wave 3 — Platform Maturity

1. Shift marketing and domain content to Payload-driven content models.
2. Queue Moodle sync by default.
3. Complete invoice storage upload.
4. Replace mocked semantic search.
5. Wire actual search indexing from content changes.

## Highest-Value Immediate Backlog

If the goal is to move fastest without broad refactoring, the best next five tasks are:

1. Fix the broken `Enroll Now` journey on product pages.
2. Create the missing linked routes so navigation matches the PRD.
3. Implement participant certificates and admin products pages first, because they are already linked from dashboards.
4. Replace placeholder product detail sections with real curriculum, FAQ, outcomes, and mentors data.
5. Complete invoice upload and free-product enrollment so both paid and free commerce paths work end to end.
