import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { query, queryOne } from '@/lib/db'
import { z } from 'zod'
import type { UserRole } from '@/types'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type AuthUserRecord = {
  id: string
  name: string
  email: string
  role: UserRole
}

async function upsertOAuthUser(email: string, name?: string | null): Promise<AuthUserRecord> {
  const normalizedEmail = email.trim().toLowerCase()
  const fallbackName = normalizedEmail.split('@')[0] || 'NSTC Learner'
  const displayName = name?.trim() || fallbackName

  const rows = await query<AuthUserRecord>(
    `INSERT INTO users (name, email, role)
     VALUES ($1, $2, 'participant')
     ON CONFLICT (email) DO UPDATE
     SET name = COALESCE(NULLIF(users.name, ''), EXCLUDED.name),
         updated_at = NOW()
     RETURNING id, name, email, role`,
    [displayName, normalizedEmail]
  )

  return rows[0]
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await queryOne<{
          id: string
          name: string
          email: string
          password_hash: string
          role: UserRole
        }>('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email])

        if (!user || !user.password_hash) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true
      if (!user.email) {
        console.error('[Auth] Google sign-in denied: no email returned by provider')
        return false
      }

      try {
        const dbUser = await upsertOAuthUser(user.email, user.name)
        user.id = dbUser.id
        user.role = dbUser.role
        user.name = dbUser.name
        user.email = dbUser.email
        return true
      } catch (error) {
        console.error('[Auth] Google sign-in upsert failed:', error)
        return false
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: UserRole }).role
      }

      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await upsertOAuthUser(token.email, token.name)
          token.id = dbUser.id
          token.role = dbUser.role
          token.name = dbUser.name
          token.email = dbUser.email
        } catch (error) {
          console.error('[Auth] Google JWT sync failed:', error)
        }
      }

      if ((!token.id || !token.role) && token.email) {
        const dbUser = await queryOne<AuthUserRecord>(
          'SELECT id, name, email, role FROM users WHERE email = $1',
          [token.email.toLowerCase()]
        )

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.name = dbUser.name
          token.email = dbUser.email
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
})
