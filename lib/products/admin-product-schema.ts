import { z } from 'zod'

const PRODUCT_TYPES = ['course', 'workshop', 'internship', 'flagship_program', 'package'] as const
const PRODUCT_STATUSES = ['draft', 'published', 'archived'] as const
const PRODUCT_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
const PRODUCT_FORMATS = ['self_paced', 'live_cohort', 'hybrid'] as const

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (value === '') return undefined
    return value
  }, schema.optional())

export const adminProductInputSchema = z.object({
  domainId: z.string().uuid(),
  title: z.string().trim().min(3).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and hyphenated'),
  type: z.enum(PRODUCT_TYPES),
  shortDescription: emptyToUndefined(z.string().trim().max(300)),
  longDescription: emptyToUndefined(z.string().trim().max(50_000)),
  price: z.coerce.number().min(0).max(1_00_00_000),
  salePrice: emptyToUndefined(z.coerce.number().min(0).max(1_00_00_000)),
  duration: emptyToUndefined(z.string().trim().max(80)),
  level: emptyToUndefined(z.enum(PRODUCT_LEVELS)),
  format: emptyToUndefined(z.enum(PRODUCT_FORMATS)),
  certificate: z.coerce.boolean().default(false),
  moodleCourseId: emptyToUndefined(z.string().trim().max(100)),
  status: z.enum(PRODUCT_STATUSES).default('draft'),
})

export type AdminProductInput = z.infer<typeof adminProductInputSchema>
