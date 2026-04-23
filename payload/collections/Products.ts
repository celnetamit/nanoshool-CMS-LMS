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
      async ({ doc, req }) => {
        // Trigger search re-indexing on publish
        if (doc.status === 'published') {
          // Search indexing will be handled by search service
          console.log(`[Search] Re-indexing product: ${doc.title}`)
        }
      },
    ],
  },
}
