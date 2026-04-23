# NSTC Platform — Canonical Sitemap & Route Naming

## Rules
- All slugs are lowercase, hyphenated
- Domain slugs are the single source of truth — no aliases
- Product slugs are immutable after first publish
- Route params: `[domain]`, `[slug]` — always singular for detail, plural for listings

---

## Top-Level Public Routes

| Route | Page |
|---|---|
| `/` | Homepage |
| `/enterprise` | Enterprise audience landing |
| `/university` | University audience landing |
| `/students` | Students audience landing |
| `/phd-professors` | PhD & Professors audience landing |
| `/hiring-partners` | Hiring Partners landing |
| `/join-us` | Careers / Join Us |
| `/mentors` | All Mentors listing |
| `/partners` | Partners page |
| `/search` | Global search results |
| `/legal` | Legal index |
| `/legal/payment-policy` | Payment Policy |
| `/legal/cancellation-policy` | Cancellation Policy |
| `/legal/refund-policy` | Refund Policy |
| `/legal/privacy-policy` | Privacy Policy |
| `/legal/consent-policy` | Consent Policy |

---

## Domain Routes

| Route | Page |
|---|---|
| `/ai` | AI domain landing |
| `/biotechnology` | Biotechnology domain landing |
| `/nanotechnology` | Nanotechnology domain landing |

---

## Domain Subpages (per domain)

| Route Pattern | Page |
|---|---|
| `/[domain]/courses` | Courses listing |
| `/[domain]/workshops` | Workshops listing |
| `/[domain]/internships` | Internships listing |
| `/[domain]/flagship-programs` | Flagship Programs listing |
| `/[domain]/packages` | Packages listing |
| `/[domain]/enterprise` | Enterprise audience (domain-specific) |
| `/[domain]/university` | University audience (domain-specific) |
| `/[domain]/students` | Students audience (domain-specific) |
| `/[domain]/phd-professors` | PhD & Professors (domain-specific) |
| `/[domain]/hiring-partners` | Hiring Partners (domain-specific) |
| `/[domain]/mentors` | Mentors for this domain |

---

## Product Detail Routes

| Route Pattern | Page |
|---|---|
| `/[domain]/course/[slug]` | Course detail |
| `/[domain]/workshop/[slug]` | Workshop detail |
| `/[domain]/internship/[slug]` | Internship detail |
| `/[domain]/flagship-program/[slug]` | Flagship Program detail |
| `/[domain]/package/[slug]` | Package detail |

---

## Dashboard Routes (auth-protected)

| Route | Role | Page |
|---|---|---|
| `/dashboard` | All | Redirect to role dashboard |
| `/dashboard/participant` | participant | Overview |
| `/dashboard/participant/enrollments` | participant | My Enrollments |
| `/dashboard/participant/certificates` | participant | My Certificates |
| `/dashboard/participant/invoices` | participant | My Invoices |
| `/dashboard/mentor` | mentor | Overview |
| `/dashboard/mentor/programs` | mentor | Assigned Programs |
| `/dashboard/mentor/students` | mentor | My Learners |
| `/dashboard/program-manager` | program_manager | Overview |
| `/dashboard/program-manager/cohorts` | program_manager | Cohorts |
| `/dashboard/program-manager/progress` | program_manager | Progress |
| `/dashboard/admin` | admin | Overview |
| `/dashboard/admin/products` | admin | Product Management |
| `/dashboard/admin/users` | admin | User Management |
| `/dashboard/admin/enrollments` | admin | Enrollments |
| `/dashboard/admin/payments` | admin | Payments |

---

## Valid Domain Slugs

```ts
export const DOMAINS = ['ai', 'biotechnology', 'nanotechnology'] as const
```

## Valid Product Types

```ts
export const PRODUCT_TYPES = [
  'course',
  'workshop',
  'internship',
  'flagship_program',
  'package',
] as const
```

## Valid Audience Slugs

```ts
export const AUDIENCES = [
  'enterprise',
  'university',
  'students',
  'phd-professors',
  'hiring-partners',
  'mentors',
] as const
```
