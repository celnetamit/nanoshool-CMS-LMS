import type { CollectionConfig } from 'payload'

export const Audiences: CollectionConfig = {
  slug: 'audiences',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'e.g. enterprise, university, students, phd-professors, hiring-partners, mentors',
      },
    },
    {
      name: 'headline',
      type: 'text',
    },
    {
      name: 'subheadline',
      type: 'textarea',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'landingContent',
      type: 'richText',
    },
    {
      name: 'valueProps',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'featuredMentors',
      type: 'relationship',
      relationTo: 'mentors',
      hasMany: true,
    },
    {
      name: 'faq',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', required: true },
      ],
    },
    {
      name: 'ctaText',
      type: 'text',
    },
    {
      name: 'ctaUrl',
      type: 'text',
    },
    {
      name: 'domainOverrides',
      type: 'array',
      fields: [
        {
          name: 'domain',
          type: 'relationship',
          relationTo: 'domains',
          required: true,
        },
        { name: 'headline', type: 'text' },
        { name: 'subheadline', type: 'textarea' },
        { name: 'landingContent', type: 'richText' },
        {
          name: 'featuredProducts',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
        },
        {
          name: 'featuredMentors',
          type: 'relationship',
          relationTo: 'mentors',
          hasMany: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea', maxLength: 160 },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
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
}
