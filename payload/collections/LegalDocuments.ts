import type { CollectionConfig } from 'payload'

export const LegalDocuments: CollectionConfig = {
  slug: 'legal-documents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'version', 'effectiveDate'],
  },
  versions: {
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'e.g. payment-policy, refund-policy, privacy-policy',
      },
    },
    { name: 'version', type: 'text', required: true, admin: { description: 'e.g. v1.0, v2.1' } },
    { name: 'effectiveDate', type: 'date', required: true },
    { name: 'content', type: 'richText', required: true },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
}
