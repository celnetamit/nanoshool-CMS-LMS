import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Users } from './payload/collections/Users'
import { Domains } from './payload/collections/Domains'
import { Products } from './payload/collections/Products'
import { Mentors } from './payload/collections/Mentors'
import { Audiences } from './payload/collections/Audiences'
import { LegalDocuments } from './payload/collections/LegalDocuments'
import { Media } from './payload/collections/Media'

// Globals
import { Navigation } from './payload/globals/Navigation'
import { SiteSettings } from './payload/globals/SiteSettings'

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
