/**
 * NSTC Platform — Route Constants
 * Single source of truth for all routes.
 * Never hardcode route strings anywhere else.
 */

// ─── Domains ───────────────────────────────────────────────
export const DOMAINS = ['ai', 'biotechnology', 'nanotechnology'] as const
export type Domain = (typeof DOMAINS)[number]

// ─── Product Types ─────────────────────────────────────────
export const PRODUCT_TYPES = [
  'course',
  'workshop',
  'internship',
  'flagship_program',
  'package',
] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

// URL-friendly product type segments (plural for listings, singular for detail)
export const PRODUCT_TYPE_SLUGS: Record<ProductType, { list: string; detail: string }> = {
  course: { list: 'courses', detail: 'course' },
  workshop: { list: 'workshops', detail: 'workshop' },
  internship: { list: 'internships', detail: 'internship' },
  flagship_program: { list: 'flagship-programs', detail: 'flagship-program' },
  package: { list: 'packages', detail: 'package' },
}

// ─── Audience Slugs ────────────────────────────────────────
export const AUDIENCES = [
  'enterprise',
  'university',
  'students',
  'phd-professors',
  'hiring-partners',
  'mentors',
] as const
export type Audience = (typeof AUDIENCES)[number]

// ─── User Roles ────────────────────────────────────────────
export const USER_ROLES = ['admin', 'mentor', 'participant', 'program_manager'] as const
export type UserRole = (typeof USER_ROLES)[number]

// ─── Public Routes ─────────────────────────────────────────
export const ROUTES = {
  home: '/',
  enterprise: '/enterprise',
  university: '/university',
  students: '/students',
  phdProfessors: '/phd-professors',
  hiringPartners: '/hiring-partners',
  joinUs: '/join-us',
  mentors: '/mentors',
  partners: '/partners',
  search: '/search',

  legal: {
    index: '/legal',
    paymentPolicy: '/legal/payment-policy',
    cancellationPolicy: '/legal/cancellation-policy',
    refundPolicy: '/legal/refund-policy',
    privacyPolicy: '/legal/privacy-policy',
    consentPolicy: '/legal/consent-policy',
  },

  domain: (domain: Domain) => `/${domain}`,

  domainListing: (domain: Domain, type: ProductType) =>
    `/${domain}/${PRODUCT_TYPE_SLUGS[type].list}`,

  domainAudience: (domain: Domain, audience: Audience) =>
    `/${domain}/${audience}`,

  productDetail: (domain: Domain, type: ProductType, slug: string) =>
    `/${domain}/${PRODUCT_TYPE_SLUGS[type].detail}/${slug}`,

  dashboard: {
    root: '/dashboard',
    participant: {
      root: '/dashboard/participant',
      enrollments: '/dashboard/participant/enrollments',
      certificates: '/dashboard/participant/certificates',
      invoices: '/dashboard/participant/invoices',
    },
    mentor: {
      root: '/dashboard/mentor',
      programs: '/dashboard/mentor/programs',
      students: '/dashboard/mentor/students',
    },
    programManager: {
      root: '/dashboard/program-manager',
      cohorts: '/dashboard/program-manager/cohorts',
      progress: '/dashboard/program-manager/progress',
    },
    admin: {
      root: '/dashboard/admin',
      products: '/dashboard/admin/products',
      users: '/dashboard/admin/users',
      enrollments: '/dashboard/admin/enrollments',
      payments: '/dashboard/admin/payments',
    },
  },
} as const

// ─── Dashboard redirect by role ────────────────────────────
export const DASHBOARD_ROOT_BY_ROLE: Record<UserRole, string> = {
  admin: ROUTES.dashboard.admin.root,
  program_manager: ROUTES.dashboard.programManager.root,
  mentor: ROUTES.dashboard.mentor.root,
  participant: ROUTES.dashboard.participant.root,
}

// ─── API Routes ────────────────────────────────────────────
export const API_ROUTES = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    me: '/api/auth/me',
  },
  products: {
    list: '/api/products',
    detail: (slug: string) => `/api/products/${slug}`,
    adminCreate: '/api/admin/products',
    adminUpdate: (id: string) => `/api/admin/products/${id}`,
  },
  enrollment: {
    enroll: '/api/enroll',
    userEnrollments: '/api/enrollments/user',
  },
  payment: {
    createOrder: '/api/payment/create-order',
    webhook: '/api/payment/webhook',
    refund: '/api/admin/refund',
  },
  coupon: {
    validate: '/api/coupon/validate',
  },
  search: '/api/search',
} as const
