# NSTC Platform — Component Inventory

## 1. Base UI Components (`/components/ui/`)

| Component | Props | Used In |
|---|---|---|
| `Button` | `variant` (primary/secondary/ghost/outline), `size`, `loading`, `disabled` | Everywhere |
| `Input` | `label`, `error`, `placeholder`, `type` | Forms |
| `Select` | `options`, `label`, `error` | Forms, Filters |
| `Textarea` | `label`, `error`, `rows` | Forms |
| `Badge` | `variant` (info/success/warning/error), `label` | Product cards, status indicators |
| `Card` | `padding`, `shadow`, `hover` | Listings, dashboards |
| `Modal` | `open`, `onClose`, `title`, `children` | Checkout, confirmations |
| `Tabs` | `tabs[]`, `activeTab`, `onChange` | Product detail, dashboards |
| `Accordion` | `items[]` | FAQs |
| `Toast` | `type`, `message`, `duration` | Payment feedback, errors |
| `Spinner` | `size` | Loading states |
| `Skeleton` | `width`, `height`, `lines` | Page loading skeletons |
| `Pagination` | `total`, `page`, `perPage`, `onChange` | Listings |
| `Table` | `columns[]`, `rows[]`, `loading` | Admin/dashboard tables |
| `Avatar` | `src`, `name`, `size` | User display |
| `Breadcrumb` | `items[]` | Dashboard navigation |
| `Tooltip` | `content`, `position` | Icon buttons |
| `Divider` | `orientation` | Layouts |

---

## 2. Layout Components (`/components/layout/`)

| Component | Description |
|---|---|
| `Header` | Logo, domain nav, audience links, search icon, login/CTA |
| `Footer` | Links, legal, socials, copyright |
| `MobileNav` | Hamburger, drawer, full mobile menu |
| `DashboardLayout` | Sidebar + topbar wrapper for all dashboard pages |
| `DashboardSidebar` | Role-aware navigation links |
| `DashboardTopbar` | Page title, user avatar, notifications |
| `Container` | Centered max-width wrapper |
| `Section` | Full-width section with vertical padding |
| `PageHero` | Reusable hero block for landing pages |

---

## 3. Product Components (`/components/products/`)

| Component | Description |
|---|---|
| `ProductCard` | Thumbnail, title, domain badge, price, type badge, CTA |
| `ProductGrid` | Responsive grid of ProductCards |
| `ProductHero` | Detail page hero: title, price, rating, CTA bar |
| `ProductTabs` | Overview / Curriculum / Mentor / FAQ / Outcomes |
| `CurriculumList` | Accordion-based syllabus modules |
| `ProductFilters` | Sidebar filters: price, level, certificate, type |
| `ProductSort` | Sort dropdown for listings |
| `RelatedProducts` | Horizontal scroll of related ProductCards |
| `EnrollButton` | Enroll CTA with auth gate + checkout trigger |
| `StickyMobileCTA` | Fixed bottom bar with price + enroll on mobile |
| `PriceBadge` | Shows price, sale price, discount % |
| `CertificateBadge` | "Certificate included" indicator |

---

## 4. Domain Components (`/components/domains/`)

| Component | Description |
|---|---|
| `DomainCard` | Domain card for homepage (AI, Biotech, Nanotech) |
| `DomainCategoryCards` | Grid: Courses, Workshops, Internships, etc. |
| `AudienceStrip` | Horizontal strip of audience segment links |
| `DomainHero` | Domain landing page hero section |

---

## 5. Marketing Components (`/components/marketing/`)

| Component | Description |
|---|---|
| `TestimonialsCarousel` | Carousel of learner testimonials |
| `MentorSpotlight` | Featured mentor card with photo, bio snippet |
| `MentorGrid` | Grid of MentorSpotlight cards |
| `PartnerLogos` | Strip of partner logo images |
| `OutcomesStats` | Metrics section (e.g., "10,000+ learners") |
| `FAQSection` | Page-level FAQ using Accordion |
| `CTABanner` | Full-width CTA section with headline + button |
| `HeroSection` | Reusable hero with headline, sub, CTAs, optional media |

---

## 6. Dashboard Components (`/components/dashboard/`)

| Component | Description |
|---|---|
| `StatsCard` | KPI card with label, value, trend indicator |
| `EnrollmentCard` | Single enrollment with product name, status, access link |
| `CertificateCard` | Certificate with download button |
| `InvoiceRow` | Invoice table row with PDF download |
| `ProgressBar` | Completion progress for enrolled course |
| `CohortTable` | Program manager cohort view |
| `LearnerRow` | Learner in program manager/mentor view |
| `PaymentRow` | Payment record in admin view |
| `UserRow` | User record in admin view |
| `RevenueChart` | Line/bar chart for admin revenue overview |

---

## 7. Form Components (`/components/forms/`)

| Component | Description |
|---|---|
| `LoginForm` | Email + password login |
| `SignupForm` | Name + email + password + role |
| `CheckoutForm` | Product summary + coupon + pay button |
| `CouponInput` | Coupon code input with validate button |
| `SearchBar` | Global search input with icon and clear |
| `FilterPanel` | Sidebar filter form for product listings |
