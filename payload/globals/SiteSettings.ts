import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'NSTC' },
    { name: 'tagline', type: 'text', defaultValue: 'Learn. Grow. Lead.' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    { name: 'supportEmail', type: 'email' },
    { name: 'supportPhone', type: 'text' },
    {
      name: 'defaultSeo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        { name: 'posthogKey', type: 'text' },
        { name: 'googleAnalyticsId', type: 'text' },
      ],
    },
  ],
}
