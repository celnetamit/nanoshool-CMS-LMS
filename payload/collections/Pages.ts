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
      name: 'pageType',
      type: 'select',
      defaultValue: 'generic',
      options: [
        { label: 'Generic', value: 'generic' },
        { label: 'Home', value: 'home' },
        { label: 'Partner', value: 'partner' },
        { label: 'Campaign', value: 'campaign' },
        { label: 'About', value: 'about' },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'headline', type: 'text' },
        { name: 'subheadline', type: 'textarea' },
        { name: 'primaryCtaLabel', type: 'text' },
        { name: 'primaryCtaUrl', type: 'text' },
        { name: 'secondaryCtaLabel', type: 'text' },
        { name: 'secondaryCtaUrl', type: 'text' },
        { name: 'media', type: 'upload', relationTo: 'media' },
      ],
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
      name: 'sections',
      type: 'blocks',
      blocks: [
        {
          slug: 'stats',
          labels: { singular: 'Stats', plural: 'Stats' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          slug: 'domainCards',
          labels: { singular: 'Domain Cards', plural: 'Domain Cards' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
          ],
        },
        {
          slug: 'featuredProducts',
          labels: { singular: 'Featured Products', plural: 'Featured Products' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
            {
              name: 'products',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
            },
          ],
        },
        {
          slug: 'audienceCards',
          labels: { singular: 'Audience Cards', plural: 'Audience Cards' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
            {
              name: 'audiences',
              type: 'relationship',
              relationTo: 'audiences',
              hasMany: true,
            },
          ],
        },
        {
          slug: 'mentorSpotlights',
          labels: { singular: 'Mentor Spotlights', plural: 'Mentor Spotlights' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
            {
              name: 'mentors',
              type: 'relationship',
              relationTo: 'mentors',
              hasMany: true,
            },
          ],
        },
        {
          slug: 'partnerLogos',
          labels: { singular: 'Partner Logos', plural: 'Partner Logos' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
            {
              name: 'partners',
              type: 'relationship',
              relationTo: 'partners',
              hasMany: true,
            },
          ],
        },
        {
          slug: 'testimonials',
          labels: { singular: 'Testimonials', plural: 'Testimonials' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'body', type: 'textarea' },
            {
              name: 'testimonials',
              type: 'relationship',
              relationTo: 'testimonials',
              hasMany: true,
            },
          ],
        },
        {
          slug: 'faq',
          labels: { singular: 'FAQ', plural: 'FAQs' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'richText', required: true },
              ],
            },
          ],
        },
        {
          slug: 'richText',
          labels: { singular: 'Rich Text', plural: 'Rich Text Blocks' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text' },
            { name: 'content', type: 'richText', required: true },
          ],
        },
        {
          slug: 'ctaBanner',
          labels: { singular: 'CTA Banner', plural: 'CTA Banners' },
          fields: [
            { name: 'kicker', type: 'text' },
            { name: 'heading', type: 'text', required: true },
            { name: 'body', type: 'textarea' },
            { name: 'primaryCtaLabel', type: 'text' },
            { name: 'primaryCtaUrl', type: 'text' },
            { name: 'secondaryCtaLabel', type: 'text' },
            { name: 'secondaryCtaUrl', type: 'text' },
          ],
        },
      ],
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
