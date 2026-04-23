import type { CollectionConfig } from 'payload'

export const Audiences: CollectionConfig = {
  slug: 'audiences',
  admin: {
    useAsTitle: 'name',
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
      name: 'landingContent',
      type: 'richText',
    },
    {
      name: 'ctaText',
      type: 'text',
    },
    {
      name: 'ctaUrl',
      type: 'text',
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
}
