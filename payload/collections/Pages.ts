import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'status', 'updatedAt'],
  },
  versions: {
    drafts: true,
    maxPerDoc: 30,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique page identifier, e.g. about-us',
      },
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Frontend URL path, e.g. /about-us',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Path is required'
        if (!value.startsWith('/')) return 'Path must start with "/"'
        return true
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 280,
      admin: {
        description: 'Short summary for cards and previews',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'showInNavigation',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'navigationLabel',
      type: 'text',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showInNavigation),
        description: 'Label to use when this page appears in navigation',
      },
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
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Optional publish timestamp',
      },
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
