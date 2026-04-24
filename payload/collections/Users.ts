import type { CollectionConfig } from 'payload'
import { randomBytes } from 'crypto'
import { getToken } from 'next-auth/jwt'

type BridgedRole = 'admin' | 'mentor' | 'participant' | 'program_manager'

const VALID_ROLES = new Set<BridgedRole>(['admin', 'mentor', 'participant', 'program_manager'])

async function getBridgedSessionUser(headers: Headers): Promise<{
  email: string
  name: string
  role: BridgedRole
} | null> {
  const cookie = headers.get('cookie') ?? ''
  if (!cookie) return null

  try {
    const token = await getToken({
      req: {
        headers: {
          cookie,
        },
      } as any,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) return null

    const email = token.email?.trim().toLowerCase()
    const roleRaw =
      (typeof token.role === 'string' ? token.role.trim() : 'participant') || 'participant'
    const name = token.name?.trim() || (email?.split('@')[0] ?? 'NSTC User')

    if (!email) return null
    if (!VALID_ROLES.has(roleRaw as BridgedRole)) return null

    return {
      email,
      name,
      role: roleRaw as BridgedRole,
    }
  } catch {
    return null
  }
}

async function ensurePayloadUserForNextAuth({
  payload,
  email,
  name,
  role,
}: {
  payload: any
  email: string
  name: string
  role: BridgedRole
}) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const existingDoc = existing.docs?.[0]
  if (existingDoc) {
    return existingDoc
  }

  const strongPassword = `${randomBytes(24).toString('hex')}A!9`
  return payload.create({
    collection: 'users',
    data: {
      email,
      name,
      role,
      password: strongPassword,
    },
    overrideAccess: true,
    depth: 0,
  })
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Keep auth fields in DB/types, but disable local login in favor of NextAuth bridge.
    disableLocalStrategy: {
      enableFields: true,
      optionalPassword: true,
    },
    strategies: [
      {
        name: 'next-auth-bridge',
        authenticate: async ({ headers, payload }) => {
          const bridgedUser = await getBridgedSessionUser(headers)
          const email = bridgedUser?.email ?? headers.get('x-nstc-auth-user-email')?.trim().toLowerCase()
          const roleRaw = bridgedUser?.role ?? (headers.get('x-nstc-auth-user-role')?.trim() ?? 'participant')
          const name =
            bridgedUser?.name ??
            (headers.get('x-nstc-auth-user-name')?.trim() || (email?.split('@')[0] ?? 'NSTC User'))

          if (!email) return { user: null }
          if (!VALID_ROLES.has(roleRaw as BridgedRole)) return { user: null }
          if (roleRaw !== 'admin') return { user: null }

          const role = roleRaw as BridgedRole
          const userDoc = await ensurePayloadUserForNextAuth({
            payload,
            email,
            name,
            role,
          })

          return {
            user: {
              ...(userDoc as Record<string, unknown>),
              _strategy: 'next-auth-bridge',
              collection: 'users',
            } as any,
          }
        },
      },
    ],
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'participant',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Program Manager', value: 'program_manager' },
        { label: 'Mentor', value: 'mentor' },
        { label: 'Participant', value: 'participant' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'moodleUserId',
      type: 'text',
      admin: {
        description: 'Moodle user ID after sync',
        readOnly: true,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
    delete: ({ req }) => req.user?.role === 'admin',
    create: () => true,
  },
}
