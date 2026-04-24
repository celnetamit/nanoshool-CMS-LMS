import type { CollectionConfig } from 'payload'

export const Mentors: CollectionConfig = {
  slug: 'mentors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'featured', 'displayOrder'],
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
    },
    { name: 'tagline', type: 'text' },
    { name: 'designation', type: 'text' },
    { name: 'organization', type: 'text' },
    { name: 'shortBio', type: 'textarea', maxLength: 280 },
    { name: 'bio', type: 'richText' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'domains',
      type: 'relationship',
      relationTo: 'domains',
      hasMany: true,
    },
    {
      name: 'expertise',
      type: 'array',
      fields: [{ name: 'area', type: 'text', required: true }],
    },
    {
      name: 'credentials',
      type: 'array',
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'showOnMentorsPage',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'linkedin', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'website', type: 'text' },
      ],
    },
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
