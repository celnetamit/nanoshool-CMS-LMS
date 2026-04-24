import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Users } from './payload/collections/Users.ts'
import { Domains } from './payload/collections/Domains.ts'
import { Products } from './payload/collections/Products.ts'
import { Pages } from './payload/collections/Pages.ts'
import { Mentors } from './payload/collections/Mentors.ts'
import { Audiences } from './payload/collections/Audiences.ts'
import { LegalDocuments } from './payload/collections/LegalDocuments.ts'
import { Media } from './payload/collections/Media.ts'

// Globals
import { Navigation } from './payload/globals/Navigation.ts'
import { SiteSettings } from './payload/globals/SiteSettings.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— NSTC Admin',
    },
  },

  collections: [
    Users,
    Domains,
    Audiences,
    Pages,
    Products,
    Mentors,
    LegalDocuments,
    Media,
  ],

  globals: [Navigation, SiteSettings],

  editor: lexicalEditor({}),

  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-change-in-production',

  typescript: {
    outputFile: path.resolve(dirname, 'payload/payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: 'payload',
  }),

  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || 'nstc-media',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'ap-south-1',
        endpoint: process.env.S3_ENDPOINT,
      },
    }),
  ],

  upload: {
    limits: {
      fileSize: 10_000_000, // 10MB
    },
  },
})
