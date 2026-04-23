const { Client } = require('pg')
const bcrypt = require('bcryptjs')

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile()
  }
} catch {
  // ignore: env is usually injected by the runtime
}

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('[db:seed] DATABASE_URL is not set')
  }

  const client = new Client({ connectionString })
  await client.connect()

  const email = process.env.ADMIN_EMAIL || 'amit.rai@celnet.in'
  const password = process.env.ADMIN_PASSWORD || 'password123'
  const hash = await bcrypt.hash(password, 10)

  try {
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('System Admin', $1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE
       SET role = 'admin', password_hash = $2, updated_at = NOW()`,
      [email, hash]
    )
    console.log('[db:seed] Admin user seeded successfully.')
    console.log(`[db:seed] Email: ${email}`)
    if (!process.env.ADMIN_PASSWORD) {
      console.log('[db:seed] Password used default ADMIN_PASSWORD fallback.')
    }
  } finally {
    await client.end()
  }
}

seedAdmin().catch((error) => {
  console.error('[db:seed] Failed:', error.message)
  process.exit(1)
})
