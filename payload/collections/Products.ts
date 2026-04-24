import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'domain', 'type', 'status', 'price'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    // ─── Identity ──────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'URL slug — immutable after publish. Use lowercase-hyphenated format.',
      },
    },
    {
      name: 'domain',
      type: 'relationship',
      relationTo: 'domains',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Course', value: 'course' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Internship', value: 'internship' },
        { label: 'Flagship Program', value: 'flagship_program' },
        { label: 'Package', value: 'package' },
      ],
    },
    {
      name: 'audiences',
      type: 'relationship',
      relationTo: 'audiences',
      hasMany: true,
    },
    // ─── Content ───────────────────────────────────────────
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      maxLength: 300,
    },
    {
      name: 'longDescription',
      type: 'richText',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'curriculum',
      type: 'array',
      label: 'Curriculum Modules',
      fields: [
        { name: 'moduleTitle', type: 'text', required: true },
        { name: 'lessons', type: 'array', fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'duration', type: 'text' },
        ]},
      ],
    },
    {
      name: 'learningOutcomes',
      type: 'array',
      fields: [{ name: 'outcome', type: 'text', required: true }],
    },
    {
      name: 'prerequisites',
      type: 'array',
      fields: [{ name: 'prerequisite', type: 'text', required: true }],
    },
    {
      name: 'faqs',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', required: true },
      ],
    },
    // ─── Mentors ───────────────────────────────────────────
    {
      name: 'mentors',
      type: 'relationship',
      relationTo: 'mentors',
      hasMany: true,
    },
    // ─── Pricing ───────────────────────────────────────────
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'salePrice',
      type: 'number',
      min: 0,
    },
    // ─── Details ───────────────────────────────────────────
    {
      name: 'duration',
      type: 'text',
      admin: { description: 'e.g. "6 weeks", "3 months"' },
    },
    {
      name: 'level',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
    },
    {
      name: 'format',
      type: 'select',
      options: [
        { label: 'Self-Paced', value: 'self_paced' },
        { label: 'Live Cohort', value: 'live_cohort' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
    },
    {
      name: 'certificate',
      type: 'checkbox',
      defaultValue: false,
    },
    // ─── Moodle ────────────────────────────────────────────
    {
      name: 'moodleCourseId',
      type: 'text',
      admin: { description: 'Moodle course ID for enrollment sync' },
    },
    // ─── Related ───────────────────────────────────────────
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    // ─── SEO ───────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea', maxLength: 160 },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
    // ─── Status ────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ],
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        try {
          const { indexProduct, removeProductFromIndex } = await import('../../lib/search/index.ts')
          if (doc.status === 'published') {
            const domainSlug =
              typeof doc.domain === 'object' && doc.domain !== null
                ? doc.domain.slug
                : undefined

            if (!domainSlug) {
              console.warn(`[Search] Skipping indexing: missing domain slug for product ${doc.id}`)
              return
            }

            await indexProduct({
              id: doc.id,
              title: doc.title,
              slug: doc.slug,
              shortDescription: doc.shortDescription,
              longDescription: '',
              domain: domainSlug,
              type: doc.type,
              price: Number(doc.price || 0),
              salePrice: doc.salePrice ?? undefined,
              level: doc.level ?? undefined,
              certificate: Boolean(doc.certificate),
              status: doc.status,
            })
            console.log(`[Search] Indexed product: ${doc.title}`)
            return
          }

          await removeProductFromIndex(doc.id)
          console.log(`[Search] Removed non-published product from index: ${doc.id}`)
        } catch (error) {
          console.error('[Search] Product indexing hook failed:', error)
        }
      },
    ],
    afterDelete: [
      async ({ id }) => {
        try {
          const { removeProductFromIndex } = await import('../../lib/search/index.ts')
          if (typeof id === 'string') {
            await removeProductFromIndex(id)
            console.log(`[Search] Removed deleted product from index: ${id}`)
          }
        } catch (error) {
          console.error('[Search] Product delete hook failed:', error)
        }
      },
    ],
  },
}
