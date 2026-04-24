# NanoSchool / NSTC Platform Modernization PRD

Date: 2026-04-24

Status: Draft for execution

Owner: Product + Engineering

Reference inputs:
- Live legacy platform review of `https://nanoschool.in/` on 2026-04-24
- Current repository architecture in [README.md](/home/itb09/Desktop/projects/nstc/README.md:1)
- Route contract in [docs/architecture/routes.ts](/home/itb09/Desktop/projects/nstc/docs/architecture/routes.ts:1)
- Gap analysis in [CODE_VS_PRD_GAP_ANALYSIS_2026-04-23.md](/home/itb09/Desktop/projects/nstc/CODE_VS_PRD_GAP_ANALYSIS_2026-04-23.md:1)

## 1. Executive Summary

The new NSTC platform should modernize the legacy NanoSchool website into a unified learning-commerce platform for deep science and emerging technology education.

The legacy site proves the business concept:
- domain-led education in Artificial Intelligence, Biotechnology, and Nanotechnology
- multiple offer types including programs, workshops, courses, internships, packages, and mentorship
- audience segmentation across students, universities, corporates, hiring partners, researchers, mentors, and faculty
- commerce, inquiry, trust, and institutional positioning all on the same public surface

The modern platform should preserve that concept but replace the current WordPress-style experience with a scalable product:
- CMS-managed marketing and content operations
- structured product catalog and SEO-friendly routing
- role-based dashboards and learning operations
- reliable paid and free enrollment flows
- Moodle and certificate operations
- search, invoicing, and analytics that work as platform features rather than plugins

This is not a visual refresh only. It is a business-platform rebuild.

## 2. Product Vision

Build the operating system for NanoSchool's deep-science education business:
- discoverable like a modern content platform
- convertible like a modern commerce platform
- operational like a modern LMS back office
- editable like a modern CMS

The platform should bridge four worlds in one product:
- marketing and trust
- catalog and conversion
- enrollment and delivery
- operations and reporting

## 3. Problem Statement

The legacy website communicates the business well, but the old stack is not the right foundation for the next stage of growth.

Current legacy limitations:
- content, commerce, and audience journeys are coupled to an older site architecture
- navigation is broad but not consistently structured as a product system
- editorial scalability depends on page-builder and plugin conventions
- learning, payment, and user operations are not unified in one modern product workflow
- analytics, automation, search, and operational visibility are harder to extend safely

Current new-repo limitations:
- the technical stack is right, but the product expression is still incomplete
- some public routes, dashboard workflows, and content surfaces remain underbuilt or partially hardcoded
- the platform needs a clear product blueprint so implementation work does not drift

## 4. Modernization Goals

### Business Goals

- Increase conversion from public discovery to enrollment.
- Improve trust for institutions, faculty, parents, and professionals.
- Support a broader mix of free, paid, short-form, and cohort-style offerings.
- Reduce manual operations across payment, invoicing, enrollment, and LMS sync.
- Make content publishing and campaign launches faster for non-engineering teams.

### Product Goals

- Turn the public website into a domain-aware learning-commerce experience.
- Make every important public page CMS-manageable.
- Support audience-specific journeys without duplicating content.
- Create a consistent enrollment flow for free and paid products.
- Provide role-based dashboards for participants, mentors, program managers, and admins.
- Build reliable post-purchase workflows including invoice, Moodle sync, and status tracking.

### Technical Goals

- Replace legacy plugin-led behavior with app-owned business logic.
- centralize content, product, and legal governance in Payload
- ensure production-safe build, deploy, auth, and background job behavior
- make search, analytics, and integrations explicit platform services
- support future expansion into certificates, cohorts, enterprise sales, and partner operations

## 5. Non-Goals

- Reproducing the old site page-for-page without improving structure
- Preserving old plugin behavior when a cleaner product-native flow is better
- Building a full custom LMS from scratch instead of integrating with Moodle where appropriate
- Over-designing version 1 with every future workflow before the core journeys are stable

## 6. Core Product Positioning

NanoSchool is not just a course catalog.

The platform should position itself as:
- a deep-science and emerging-technology learning platform
- a bridge between academia, research, and industry
- a talent-development and capability-building platform
- a commerce-enabled but trust-led education product

The core promise should remain:
- help learners and institutions move from theory to application
- provide high-signal programs, workshops, mentorship, and applied pathways
- support scientific, technical, and career outcomes, not only content consumption

## 7. Primary User Segments

### External Users

- Students
- Researchers and PhD scholars
- Faculty and visiting experts
- Working professionals
- Universities and colleges
- Corporate L&D and institutional buyers
- Hiring partners and collaborators
- Prospective mentors

### Internal Users

- Admins
- Program managers
- Mentors
- Content and marketing operators
- Finance and operations staff

## 8. Primary User Journeys

### 8.1 Public Discovery Journey

Entry sources:
- organic search
- direct domain and audience landing pages
- campaigns and partnerships
- workshop promotion
- institutional referrals

Typical path:
1. User lands on home, domain, audience, or campaign page.
2. User explores trust signals, programs, workshops, mentors, and outcomes.
3. User reaches a listing or detail page.
4. User converts through inquiry, registration, or checkout.

### 8.2 Paid Enrollment Journey

1. User discovers a paid product.
2. User reviews curriculum, mentor, audience fit, price, date, FAQs, and outcomes.
3. User starts checkout.
4. User signs in or creates account.
5. User pays via Razorpay.
6. Payment webhook confirms enrollment.
7. Invoice is generated and stored.
8. Moodle sync runs.
9. User lands in dashboard with updated status.

### 8.3 Free Enrollment Journey

1. User discovers a free workshop or learning asset.
2. User signs in or creates account.
3. User confirms registration without payment friction.
4. Enrollment, invoice or receipt, and LMS access are created automatically if needed.
5. User is routed to dashboard or confirmation state.

### 8.4 Audience-Specific Journey

Examples:
- a university user wants packaged academic collaboration
- a student wants workshops and internships
- a professional wants applied AI upskilling
- a mentor wants to join as expert faculty

Each audience entry page should:
- clarify the value proposition
- show relevant products and proof
- offer tailored calls to action

### 8.5 Internal Operations Journey

1. Admin creates or updates product and content in Payload.
2. Product is indexed for search and published.
3. Marketing pages, domain pages, and legal pages update without code edits.
4. Operations staff monitor enrollments, payments, invoices, LMS sync, and exceptions.

## 9. Information Architecture

## 9.1 Public Top-Level Areas

- Home
- About NSTC
- Domains
- Programs and Products
- Workshops
- Courses
- Internships
- Packages
- Mentors
- Audience Pages
- Legal and Trust
- Search
- Login / Signup

## 9.2 Domain Structure

Each domain should act as a discoverable content and commerce hub:
- `/ai`
- `/biotechnology`
- `/nanotechnology`

Each domain hub should support:
- overview page
- featured products
- domain-specific value proposition
- target audiences
- featured mentors
- testimonials or trust proof
- related articles or resources

## 9.3 Product Route Structure

Keep the current route logic and mature it:
- domain listings by product type
- product detail pages
- audience landing pages

Recommended route structure:
- `/{domain}`
- `/{domain}/{product-type-list}`
- `/{domain}/{product-type-detail}/{slug}`
- `/{domain}/{audience}`
- `/{audience}`
- `/mentors`
- `/partners`
- `/legal`
- `/search`

## 9.4 Dashboard Areas

- Participant dashboard
- Mentor dashboard
- Program manager dashboard
- Admin dashboard

These should remain separate experiences, not one overloaded UI.

## 10. Functional Requirements

### 10.1 CMS and Content Operations

The platform must support:
- CMS-managed home page sections
- CMS-managed domain pages
- CMS-managed audience pages
- CMS-managed legal pages
- CMS-managed mentor profiles
- CMS-managed partner/institution pages
- CMS-managed FAQ, testimonials, SEO metadata, and reusable page blocks

Content requirements:
- draft and publish workflow
- SEO fields
- hero sections and CTA blocks
- structured rich content
- reusable testimonial, mentor, and proof components

### 10.2 Catalog and Product Model

The product model must support:
- domain
- product type
- audience targeting
- mentor association
- pricing and discounts
- curriculum
- prerequisites
- learning outcomes
- FAQs
- certificates or completion flags
- schedule or cohort metadata
- modality such as live, recorded, hybrid, workshop, internship, package
- SEO and discoverability data

### 10.3 Discovery and Search

The platform must support:
- keyword search
- domain filtering
- product type filtering
- audience filtering
- mentor filtering where relevant
- featured collections on public pages
- semantic or assisted relevance as a later enhancement, but not mocked in production

### 10.4 Enrollment and Commerce

The platform must support:
- free registration flow
- paid checkout flow
- coupon validation
- payment verification through webhook-led state updates
- invoice creation and retrieval
- enrollment state visibility
- duplicate enrollment protection

Commerce rules:
- one clear enrollment entry path per product
- no dead API CTA paths
- free products must complete enrollment without manual intervention
- payment completion must not rely on only client-side callbacks

### 10.5 LMS and Delivery

The platform must support:
- Moodle enrollment sync
- Moodle unenrollment or access revoke when applicable
- queue-backed retryable sync jobs
- user-facing delivery state where useful
- room for certificates and completion records

### 10.6 Role-Based Dashboards

Participant dashboard:
- active enrollments
- certificates
- invoices
- access status

Mentor dashboard:
- assigned programs
- learner overview
- schedule or engagement surfaces

Program manager dashboard:
- cohorts
- progress and enrollment monitoring
- operational status surfaces

Admin dashboard:
- products
- users
- enrollments
- payments
- refunds
- content links to Payload admin

### 10.7 Trust, Legal, and Institutional Surfaces

The platform must support:
- legal index page
- privacy, refunds, consent, payment, and cancellation pages
- contact and support information
- institutional credibility sections
- mentor and partner proof
- policies visible before purchase where relevant

### 10.8 Analytics and Reporting

The platform should support:
- source-to-enrollment funnel tracking
- product page CTA analytics
- checkout start and payment success events
- search usage analytics
- dashboard and operations events

## 11. UX Requirements

### 11.1 Design Principles

- modern but credible
- scientific and premium, not generic edtech
- content-rich without becoming cluttered
- domain-led and audience-aware
- conversion-oriented without feeling aggressive
- mobile-capable and admin-usable

### 11.2 Home Page Requirements

The home page should:
- communicate the core platform value in one screen
- show the three primary domains clearly
- highlight key product pathways
- show proof and trust metrics
- provide direct access to programs, workshops, mentors, and institutional pathways
- guide distinct user segments to relevant entry points

### 11.3 Product Detail Requirements

Product detail pages should include:
- title and domain context
- type badge
- audience fit
- mentor information
- price and date details
- learning outcomes
- curriculum or structure
- FAQs
- trust and completion information
- primary enrollment CTA

### 11.4 Navigation Requirements

Navigation should:
- reflect the actual information model
- avoid plugin-style menu sprawl
- support both browsing and direct conversion
- make domain and audience entry points obvious

## 12. Content Model Recommendations

Recommended first-class entities:
- Pages
- Domain Pages
- Audience Pages
- Products
- Mentors
- Testimonials
- Partners
- FAQs
- Legal Pages
- Campaign or Landing Pages

Recommended relationship model:
- product to domain
- product to audiences
- product to mentors
- domain page to featured products
- audience page to featured products
- mentor to domain expertise
- testimonials to product, domain, or audience where relevant

## 13. Platform and Technical Architecture

## 13.1 Chosen Stack

Keep the modern stack already established:
- Next.js App Router
- React
- TypeScript
- Payload CMS
- PostgreSQL
- Redis + BullMQ
- Razorpay
- Moodle integration
- S3 or R2 storage

This stack is appropriate for the new version.

## 13.2 Architecture Principles

- CMS content should be source-of-truth, not a sidecar
- route definitions should stay centralized
- background jobs should own retryable operational work
- webhook-driven financial state should be authoritative
- production builds must be deterministic and container-safe

## 13.3 Integration Principles

- external systems must be wrapped by explicit services
- payment, invoice, search, email, and Moodle should each have platform-owned adapters
- no critical workflow should depend on hidden plugin behavior

## 14. Migration Strategy From Legacy Site

### 14.1 Preserve

- domain-led brand positioning
- high-value offer categories
- audience segmentation concept
- trust and institutional framing
- mentor and initiative visibility

### 14.2 Upgrade

- replace page-builder pages with structured Payload content
- replace fragmented commerce behavior with unified enrollment flows
- replace plugin-led search and navigation logic with product-owned architecture
- replace static brochure flows with actionable dashboards and lifecycle states

### 14.3 Do Not Carry Forward Blindly

- menu sprawl without information hierarchy
- duplicate or overlapping page structures
- plugin-specific UX artifacts
- cart behavior that does not align with the core enrollment model
- content structures that cannot be governed cleanly in CMS

## 15. Delivery Phases

### Phase 0: Platform Stabilization

Objective:
- make the current repo safe to build, deploy, and extend

Scope:
- fix remaining build and runtime blockers
- stabilize auth and environment handling
- remove dead enrollment paths
- validate container and production startup behavior

Exit criteria:
- reproducible deploy
- stable auth
- no dead primary CTA flows

### Phase 1: Public Experience Foundation

Objective:
- launch a credible modern public surface

Scope:
- redesigned home page
- domain pages
- audience pages
- listings and product detail pages
- mentors, partners, legal, search
- CMS-backed content blocks

Exit criteria:
- all primary public routes exist
- content team can edit key pages in Payload
- conversion journeys are live and coherent

### Phase 2: Commerce and Enrollment Completion

Objective:
- complete the end-to-end purchase and registration engine

Scope:
- free and paid enrollment flows
- invoice storage
- payment reliability
- coupon handling
- operational states and user confirmations

Exit criteria:
- paid and free products both complete successfully
- invoice URLs are real
- dashboard enrollment state reflects reality

### Phase 3: LMS and Operations Maturity

Objective:
- make learning operations reliable

Scope:
- queue-led Moodle sync
- admin monitoring surfaces
- mentor and program manager dashboards
- retry and exception handling

Exit criteria:
- LMS sync is asynchronous and observable
- ops teams can manage failures without engineering intervention

### Phase 4: Growth and Optimization

Objective:
- improve discoverability, segmentation, and reporting

Scope:
- deeper search
- analytics dashboards
- campaign landing templates
- institutional lead workflows
- recommendation or semantic enhancements

Exit criteria:
- measurable uplift in search-to-enrollment and page-to-CTA metrics

## 16. Success Metrics

### Business Metrics

- visitor to lead rate
- visitor to enrollment rate
- paid conversion rate by product type
- enrollment volume by domain
- repeat enrollment rate
- institutional inquiry volume

### Product Metrics

- search usage and result CTR
- product detail CTA click rate
- free registration completion rate
- checkout completion rate
- dashboard activation after purchase

### Operational Metrics

- payment webhook success rate
- invoice generation success rate
- Moodle sync success rate
- support tickets per 100 enrollments
- time to publish new marketing page or product

## 17. Risks and Mitigations

### Risk: Rebuilding visual pages without fixing business flows

Mitigation:
- enforce phase gates around enrollment, invoicing, and sync reliability

### Risk: Overfitting to the legacy site structure

Mitigation:
- preserve concept, not every historical page shape

### Risk: CMS becomes partial and content remains hardcoded

Mitigation:
- define CMS ownership early for home, domain, audience, legal, mentor, and partner pages

### Risk: Operations logic remains synchronous and fragile

Mitigation:
- push retryable external operations into queues

### Risk: Too many entry points create navigation confusion

Mitigation:
- simplify IA and enforce route-contract discipline

## 18. Open Decisions

- Should enterprise and university flows end in direct purchase, inquiry, or both?
- Which product types should support cohort scheduling in version 1?
- Which certificate states must be visible in participant dashboards at launch?
- Should partner and institution pages be static CMS pages or structured collections?
- How much of the legacy blog or publication layer should migrate into this platform versus remain separate?

## 19. Recommended Immediate Next Actions

1. Approve this PRD as the modernization direction.
2. Convert the PRD into an execution backlog by phase.
3. Start with Phase 0 and Phase 1 together:
   stabilize platform behavior while redesigning the public information architecture.
4. Make the home page, domain pages, audience pages, and product detail pages the first design and implementation workstream.
5. Keep every new public surface tied to Payload-managed content from the start.

## 20. Summary

The new platform should inherit NanoSchool's business concept, not its technical constraints.

The winning modernization path is:
- keep the domain and audience strategy
- keep the learning-commerce and mentorship model
- keep trust and institutional credibility front and center
- rebuild the system as a modern CMS + commerce + LMS operations platform

If executed well, the result will be a stronger product than the legacy site:
- easier to manage
- easier to scale
- more trustworthy operationally
- better for conversion
- better for long-term institutional growth
