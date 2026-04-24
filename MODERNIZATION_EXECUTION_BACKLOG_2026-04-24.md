# NanoSchool / NSTC Modernization Execution Backlog

Date: 2026-04-24

Status: Ready for phased execution

Primary source:
- [MODERNIZATION_PRD_2026-04-24.md](/home/itb09/Desktop/projects/nstc/MODERNIZATION_PRD_2026-04-24.md:1)

Supporting references:
- [CODE_VS_PRD_GAP_ANALYSIS_2026-04-23.md](/home/itb09/Desktop/projects/nstc/CODE_VS_PRD_GAP_ANALYSIS_2026-04-23.md:1)
- [docs/architecture/routes.ts](/home/itb09/Desktop/projects/nstc/docs/architecture/routes.ts:1)
- [README.md](/home/itb09/Desktop/projects/nstc/README.md:1)

## 1. How To Use This Backlog

This document converts the modernization PRD into an execution-ready delivery plan.

Each phase includes:
- objective
- outcome
- workstreams
- backlog items
- dependencies
- acceptance criteria
- recommended verification

Priority labels:
- `P0`: blocks launch or core product trust
- `P1`: high-value launch scope
- `P2`: important follow-up or optimization

Effort labels:
- `S`: small
- `M`: medium
- `L`: large
- `XL`: cross-cutting

## 2. Delivery Principles

- Preserve the legacy business concept, not the legacy implementation.
- Keep `docs/architecture/routes.ts` as the route source of truth.
- Prefer Payload-managed content over hardcoded public content.
- Prefer webhook-led and queue-led operational state over client-led assumptions.
- Avoid redoing already-completed work; deepen the unfinished surfaces first.
- Validate every phase with working flows, not only code completion.

## 3. Phase Overview

### Phase 0

Platform Stabilization and Delivery Safety

### Phase 1

Public Experience Foundation

### Phase 2

Commerce and Enrollment Completion

### Phase 3

LMS, Dashboards, and Operational Maturity

### Phase 4

Growth, Search, Analytics, and Institutional Expansion

## 4. Phase 0: Platform Stabilization and Delivery Safety

### Objective

Make the current codebase safe to deploy, extend, and validate without recurring build or environment regressions.

### Outcome

The team can build, deploy, and debug with confidence before deeper product expansion.

### Workstreams

- deployment safety
- environment correctness
- auth reliability
- build reproducibility
- route and CTA integrity

### Backlog

#### P0-0.1 Build and container hardening

- Audit Docker build stages against current runtime requirements.
- Ensure all runtime-needed scripts and modules are included in the standalone image.
- Remove any remaining build-context risks from `.dockerignore` and image-copy steps.

Deliverables:
- deterministic Docker build
- documented runtime-image assumptions

Dependencies:
- none

Acceptance criteria:
- production image builds without missing module errors
- runtime scripts needed by `db:migrate`, `db:seed`, and startup are present in the image

Verification:
- `npm run build`
- production-like Docker build

Effort: `M`

#### P0-0.2 Environment contract cleanup

- Audit `.env.example` against actual code usage.
- Mark required, optional, and deprecated variables clearly.
- Remove or isolate legacy provider keys that are not used by the repo.
- Confirm auth, payment, storage, search, and email variables match current code paths.

Deliverables:
- cleaned `.env.example`
- deployment env matrix

Dependencies:
- P0-0.1

Acceptance criteria:
- every required runtime variable is documented and used
- no critical service depends on an undocumented key

Verification:
- code grep against env usage
- fresh-machine env setup walkthrough

Effort: `M`

#### P0-0.3 Auth and session stabilization

- Resolve the remaining NextAuth server-configuration risk path.
- Verify login, logout, protected dashboard access, and callback behavior.
- Ensure production host, secret, and trust-host settings are aligned with deployment.

Deliverables:
- stable login flow
- auth troubleshooting notes

Dependencies:
- P0-0.2

Acceptance criteria:
- users can sign in reliably in the target environment
- protected routes redirect correctly

Verification:
- `/login`
- dashboard access smoke test
- auth callback checks

Effort: `M`

#### P0-0.4 Primary route and CTA integrity pass

- Audit all public nav, footer, and product-detail CTAs.
- Remove dead links and inconsistent enrollment entrypoints.
- Confirm the active product detail CTA uses the intended checkout path.

Deliverables:
- no critical 404s from primary navigation
- one clear conversion path per product

Dependencies:
- none

Acceptance criteria:
- top-level public navigation resolves successfully
- product detail pages do not send users into dead routes

Verification:
- route-by-route smoke walk

Effort: `S`

### Phase 0 exit criteria

- deploy works consistently
- auth is stable
- public navigation is coherent
- primary CTA flows are valid

## 5. Phase 1: Public Experience Foundation

### Objective

Turn the public site into a modern, CMS-driven, domain-aware learning-commerce experience.

### Outcome

The platform presents the NanoSchool concept credibly and clearly on a modern stack.

### Workstreams

- information architecture
- design system and visual language
- CMS content modeling
- public route implementation
- SEO and trust surfaces

### Backlog

#### P0-1.1 Public information architecture lock

- Finalize top-level navigation model.
- Confirm domain hubs, audience pages, mentor pages, partner pages, and legal structure.
- Decide which legacy pages become structured collections versus generic CMS pages.

Deliverables:
- approved sitemap
- nav model

Dependencies:
- Phase 0

Acceptance criteria:
- all top-level public routes are intentional and non-overlapping
- route ownership is clear

Verification:
- compare sitemap to route contract

Effort: `S`

#### P0-1.2 Home page redesign and rebuild

- Rebuild the home page as the main expression of the new product vision.
- Add domain blocks, audience pathways, trust proof, featured offers, mentor visibility, and institutional messaging.
- Move editable sections into Payload-backed content.

Deliverables:
- production-ready new home page
- home page content model in Payload

Dependencies:
- P0-1.1

Acceptance criteria:
- home page communicates platform value in one screen
- content team can edit major sections without code changes

Verification:
- content edit smoke test
- mobile and desktop QA

Effort: `L`

#### P0-1.3 Domain hubs

- Implement or refine `/ai`, `/biotechnology`, and `/nanotechnology` as rich landing hubs.
- Connect domain copy, featured products, mentors, and proof sections to CMS-managed data.

Deliverables:
- three domain landing pages

Dependencies:
- P0-1.1
- P0-1.2 content modeling patterns

Acceptance criteria:
- each domain page is distinct, editable, and linked to live catalog data

Verification:
- route smoke test
- CMS edit validation

Effort: `L`

#### P1-1.4 Audience page system

- Build top-level audience pages for:
  - `students`
  - `university`
  - `enterprise`
  - `phd-professors`
  - `hiring-partners`
  - `mentors`
- Support domain-aware audience views where needed.

Deliverables:
- audience collection or page model
- audience landing pages

Dependencies:
- P0-1.1

Acceptance criteria:
- each audience page has tailored messaging, relevant products, and clear CTA

Verification:
- product relevance QA
- route and content QA

Effort: `L`

#### P1-1.5 Mentor and partner trust surfaces

- Build or deepen mentor listing and profile experiences.
- Build partner or institutional trust surfaces.
- Add proof structures such as credentials, domain expertise, and collaboration types.

Deliverables:
- `/mentors`
- `/partners`
- mentor and partner content models

Dependencies:
- P0-1.1

Acceptance criteria:
- public trust pages feel first-class, not placeholders

Verification:
- content population test

Effort: `M`

#### P1-1.6 Legal and trust completeness

- Build `/legal` index and ensure all legal pages are discoverable.
- Standardize policy naming, linking, and footer presence.

Deliverables:
- legal index page
- policy navigation model

Dependencies:
- P0-1.1

Acceptance criteria:
- users can find and read all core legal pages easily

Verification:
- footer and checkout linkage smoke test

Effort: `S`

#### P1-1.7 SEO foundation

- Define SEO defaults for public pages.
- Ensure domain, audience, product, mentor, and legal pages have metadata support.
- Align with existing SEO rules docs.

Deliverables:
- metadata patterns
- content-entry guidelines

Dependencies:
- public page models

Acceptance criteria:
- major public routes expose complete metadata

Verification:
- metadata inspection across key pages

Effort: `M`

### Phase 1 exit criteria

- home page is modernized and CMS-backed
- domain and audience pages are live
- mentor, partner, and legal surfaces are credible
- public IA is stable and SEO-ready

## 6. Phase 2: Commerce and Enrollment Completion

### Objective

Complete the end-to-end conversion engine for free and paid learning products.

### Outcome

Discovery-to-enrollment flows work reliably for the product types that matter most.

### Workstreams

- product detail experience
- checkout and order creation
- payment and webhook integrity
- free enrollment handling
- invoices and confirmations

### Backlog

#### P0-2.1 Product detail page completion

- Replace remaining placeholder sections with live product data.
- Fully support curriculum, outcomes, prerequisites, FAQs, mentors, and related offers.
- Align product detail layout with conversion goals.

Deliverables:
- high-confidence product detail template

Dependencies:
- Phase 1 content model maturity

Acceptance criteria:
- product pages are content-rich, trustworthy, and conversion-ready

Verification:
- seeded product QA across multiple product types

Effort: `L`

#### P0-2.2 Single enrollment entrypoint enforcement

- Standardize one enrollment path per product.
- Ensure detail-page CTA, checkout trigger, and API routes align.
- Keep backward-compatible paths only if they redirect cleanly.

Deliverables:
- enrollment entry contract

Dependencies:
- P0-2.1

Acceptance criteria:
- no conflicting or dead enrollment paths remain

Verification:
- direct CTA test from listing and detail pages

Effort: `M`

#### P0-2.3 Free product enrollment flow

- Implement fully working zero-price enrollment.
- Create enrollment, receipt or invoice artifact, and post-enroll state transitions.
- Ensure free products behave like finished platform objects, not exceptions.

Deliverables:
- free enrollment workflow

Dependencies:
- P0-2.2

Acceptance criteria:
- a user can complete free enrollment end to end without manual ops work

Verification:
- free product smoke test

Effort: `M`

#### P0-2.4 Paid checkout and webhook hardening

- Verify order creation, payment capture handling, idempotency, and state transitions.
- Ensure webhook is the authority for final paid enrollment state.
- Improve user-facing post-payment status handling.

Deliverables:
- hardened payment lifecycle

Dependencies:
- P0-2.2

Acceptance criteria:
- paid enrollment cannot complete in UI while backend state remains inconsistent

Verification:
- Razorpay sandbox or test-mode payment run
- webhook replay safety test

Effort: `L`

#### P1-2.5 Coupon and pricing consistency

- Validate coupon application logic across checkout, orders, and final enrollment records.
- Ensure pricing copy on product pages matches actual checkout totals.

Deliverables:
- pricing consistency rules

Dependencies:
- P0-2.4

Acceptance criteria:
- discount calculations are consistent across UI and backend

Verification:
- coupon scenario tests

Effort: `M`

#### P1-2.6 Invoice storage completion

- Replace placeholder invoice URLs with real storage-backed URLs.
- Ensure fallback storage behavior is deliberate and documented.
- Show invoice availability cleanly in participant and admin views.

Deliverables:
- durable invoice generation and storage workflow

Dependencies:
- P0-2.4

Acceptance criteria:
- every successful paid enrollment has a retrievable invoice URL

Verification:
- invoice generation smoke test

Effort: `M`

### Phase 2 exit criteria

- free and paid products both enroll correctly
- checkout and webhook flows are trustworthy
- invoices are durable and visible
- product detail pages support conversion properly

## 7. Phase 3: LMS, Dashboards, and Operational Maturity

### Objective

Turn the platform into a reliable operational system after purchase, not only a public storefront.

### Outcome

Participants, mentors, program managers, and admins can all act on real platform state.

### Workstreams

- Moodle sync
- participant lifecycle
- mentor and PM dashboards
- admin operations
- observability and exceptions

### Backlog

#### P0-3.1 Queue-led Moodle sync completion

- Move remaining synchronous enrollment operations onto BullMQ where appropriate.
- Ensure enroll and unenroll flows are retryable and observable.
- Expose sync state in useful internal surfaces.

Deliverables:
- robust queue-led LMS sync

Dependencies:
- Phase 2 complete enough to create enrollments consistently

Acceptance criteria:
- webhook path does not depend on fragile synchronous LMS completion

Verification:
- queue worker smoke test
- simulated retry or failure scenario

Effort: `L`

#### P1-3.2 Participant dashboard completion

- Complete enrollments, certificates, invoices, and status surfaces.
- Make the participant dashboard the reliable post-enrollment home.

Deliverables:
- participant dashboard polish and completeness

Dependencies:
- P0-3.1

Acceptance criteria:
- participant can see what they bought, what access they have, and what documents are available

Verification:
- participant journey smoke test

Effort: `M`

#### P1-3.3 Mentor dashboard completion

- Complete mentor programs and student views using current relationships.
- Focus on actual usefulness over placeholder counts.

Deliverables:
- mentor-facing program and learner views

Dependencies:
- enrollment and product relationships in place

Acceptance criteria:
- mentors can identify assigned programs and relevant learners

Verification:
- seeded mentor account QA

Effort: `M`

#### P1-3.4 Program manager dashboard completion

- Complete cohorts, progress, and operational monitoring surfaces.
- Align with actual data relationships before inventing new schema.

Deliverables:
- PM operational dashboard

Dependencies:
- P0-3.1

Acceptance criteria:
- PM can monitor product and learner progress state meaningfully

Verification:
- seeded PM account QA

Effort: `M`

#### P1-3.5 Admin operations consolidation

- Deepen admin visibility for products, users, enrollments, payments, refunds, and exceptions.
- Link app-level admin workflows cleanly with Payload admin where needed.

Deliverables:
- stronger operational admin surface

Dependencies:
- prior dashboard and payment work

Acceptance criteria:
- admin can manage core commercial and learning operations without resorting to DB inspection

Verification:
- admin workflow walkthrough

Effort: `L`

### Phase 3 exit criteria

- LMS operations are queue-led
- dashboards reflect real state
- internal users can manage platform operations confidently

## 8. Phase 4: Growth, Search, Analytics, and Institutional Expansion

### Objective

Improve discoverability, measurement, and higher-value institutional pathways after the core platform is stable.

### Outcome

The platform becomes easier to grow and optimize rather than only maintain.

### Workstreams

- search quality
- analytics and funnel measurement
- campaign infrastructure
- institutional and enterprise flows
- optimization and recommendations

### Backlog

#### P1-4.1 Search reliability and freshness

- Wire search indexing fully from product lifecycle hooks.
- Ensure catalog changes update searchable content consistently.
- Keep semantic ranking real or keep it off.

Deliverables:
- reliable search indexing pipeline

Dependencies:
- product/content model stability

Acceptance criteria:
- new and updated products appear correctly in search

Verification:
- indexing smoke tests

Effort: `M`

#### P1-4.2 Search experience improvement

- Improve search UI, filters, ranking, and empty states.
- Support domain, type, and audience use cases explicitly.

Deliverables:
- upgraded public search experience

Dependencies:
- P1-4.1

Acceptance criteria:
- search helps users navigate the catalog meaningfully

Verification:
- search scenario QA

Effort: `M`

#### P1-4.3 Analytics event implementation

- Implement event tracking for:
  - page views
  - CTA clicks
  - search usage
  - checkout start
  - payment success
  - enrollment completion
- Align with the analytics events architecture doc.

Deliverables:
- analytics instrumentation baseline

Dependencies:
- public and commerce flows stable

Acceptance criteria:
- core funnel events are emitted and attributable

Verification:
- analytics debug inspection

Effort: `M`

#### P2-4.4 Campaign and landing-page templates

- Support campaign-specific landing pages for institutional or workshop launches.
- Reuse structured CMS blocks rather than bespoke one-off pages.

Deliverables:
- campaign landing page model

Dependencies:
- Phase 1 content system maturity

Acceptance criteria:
- marketing can launch a campaign page without engineering-heavy bespoke work

Verification:
- CMS authoring test

Effort: `M`

#### P2-4.5 Institutional inquiry and enterprise pipeline

- Design inquiry-first flows for enterprise and university audiences where direct purchase is not the right action.
- Add structured lead capture and routing for those segments.

Deliverables:
- institutional CTA model
- inquiry handling flow

Dependencies:
- audience pages complete

Acceptance criteria:
- enterprise and university journeys have clear next steps that fit their sales model

Verification:
- lead capture walkthrough

Effort: `L`

#### P2-4.6 Recommendation and semantic enhancement

- Add better assisted discovery only after search and catalog basics are reliable.
- Use production-safe ranking logic rather than mock outputs.

Deliverables:
- recommendation or semantic enhancement roadmap item

Dependencies:
- P1-4.1
- P1-4.2

Acceptance criteria:
- advanced discovery adds measurable relevance, not just feature surface

Verification:
- before and after search relevance review

Effort: `L`

### Phase 4 exit criteria

- search is reliable and useful
- funnel analytics are measurable
- institutional and campaign growth flows exist

## 9. Cross-Phase Content and Data Migration Backlog

These items cut across multiple phases and should be scheduled intentionally.

### P0-X.1 Legacy-to-new content inventory

- Map every important `nanoschool.in` content surface into:
  - migrate
  - merge
  - replace
  - retire

Effort: `M`

### P0-X.2 Payload schema alignment

- Ensure content entities support the PRD:
  - domains
  - audiences
  - pages
  - mentors
  - legal pages
  - testimonials
  - partners

Effort: `L`

### P1-X.3 Seed and fixture strategy

- Create realistic content and user fixtures for:
  - products
  - mentors
  - audience pages
  - dashboards

Effort: `M`

### P1-X.4 Old URL and redirect strategy

- Define redirects from legacy URLs to the new route structure.
- Preserve SEO and campaign continuity where valuable.

Effort: `M`

## 10. Suggested Execution Sequence

Recommended near-term order:

1. Finish Phase 0 fully.
2. Start Phase 1 with `home + domain hubs + content models`.
3. Run Phase 2 in parallel only where it depends on already-stable product routes.
4. Complete Phase 3 after commerce state is trustworthy.
5. Use Phase 4 only after the platform has stable public and operational fundamentals.

Recommended first implementation batch:

1. P0-0.2 Environment contract cleanup
2. P0-0.3 Auth and session stabilization
3. P0-1.1 Public information architecture lock
4. P0-1.2 Home page redesign and rebuild
5. P0-1.3 Domain hubs

## 11. Recommended Ownership Model

### Product

- PRD maintenance
- sitemap and user-journey decisions
- audience and institutional CTA decisions

### Design

- public visual system
- page templates
- dashboard usability

### CMS / Content

- content model definitions
- migration and editorial workflows
- SEO population

### Engineering

- route implementation
- content integration
- commerce and dashboard behavior
- integrations, queues, and deploy safety

### QA / Operations

- journey smoke tests
- payment and LMS operational checks
- environment and release validation

## 12. Definition of Done

A backlog item is done only when:
- code or content model changes are complete
- linked routes and UI states are working
- key flows are smoke-tested
- docs are updated if the behavior changed
- no dead CTA or broken path was introduced

## 13. Immediate Next Backlog Candidate

If execution starts now, the highest-value next artifact is:

`Phase 1 implementation spec for the new public experience`

That spec should break down:
- home page sections
- domain page templates
- audience page templates
- Payload content schemas
- design and component requirements

## 14. Summary

This backlog translates the modernization vision into an actual delivery path.

The most important rule is sequencing:
- stabilize first
- modernize the public foundation second
- complete commerce third
- mature operations fourth
- optimize for growth after the fundamentals are real
