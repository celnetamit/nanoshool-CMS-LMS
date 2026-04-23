// ─── User Roles ────────────────────────────────────────────
export type UserRole = 'admin' | 'mentor' | 'participant' | 'program_manager'

// ─── Product Types ─────────────────────────────────────────
export type ProductType = 'course' | 'workshop' | 'internship' | 'flagship_program' | 'package'
export type ProductStatus = 'draft' | 'published' | 'archived'
export type ProductLevel = 'beginner' | 'intermediate' | 'advanced'
export type ProductFormat = 'self_paced' | 'live_cohort' | 'hybrid'

// ─── Payment & Enrollment ──────────────────────────────────
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type AccessStatus = 'locked' | 'active' | 'revoked' | 'completed'

// ─── Domain ────────────────────────────────────────────────
export type DomainSlug = 'ai' | 'biotechnology' | 'nanotechnology'

// ─── Database Row Types ────────────────────────────────────
export interface DBUser {
  id: string
  name: string
  email: string
  password_hash: string
  role: UserRole
  phone?: string
  moodle_user_id?: string
  created_at: Date
  updated_at: Date
}

export interface DBDomain {
  id: string
  name: string
  slug: string
  description?: string
  created_at: Date
}

export interface DBProduct {
  id: string
  domain_id: string
  title: string
  slug: string
  type: ProductType
  short_description?: string
  long_description?: string
  price: number
  sale_price?: number
  duration?: string
  level?: ProductLevel
  format?: ProductFormat
  certificate: boolean
  moodle_course_id?: string
  status: ProductStatus
  created_at: Date
  updated_at: Date
}

export interface DBMentor {
  id: string
  name: string
  slug: string
  bio?: string
  photo_url?: string
}

export interface DBEnrollment {
  id: string
  user_id: string
  product_id: string
  payment_id?: string
  invoice_id?: string
  payment_status: PaymentStatus
  access_status: AccessStatus
  razorpay_payment_id?: string
  moodle_enrollment_status: boolean
  created_at: Date
  updated_at: Date
}

export interface DBPayment {
  id: string
  user_id: string
  amount: number
  currency: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  status: PaymentStatus
  created_at: Date
  updated_at: Date
}

export interface DBInvoice {
  id: string
  user_id: string
  payment_id?: string
  amount: number
  status: string
  pdf_url?: string
  created_at: Date
  updated_at: Date
}

export interface DBCertificate {
  id: string
  user_id: string
  product_id: string
  certificate_url: string
  issued_at: Date
}

// ─── NextAuth Session Extension ────────────────────────────
import "next-auth"
import "next-auth/jwt"

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
    }
  }
  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
