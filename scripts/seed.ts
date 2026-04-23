import { Client } from 'pg'
import bcrypt from 'bcryptjs'

// Load .env variables natively in Node 20+
try { process.loadEnvFile() } catch { /* ignore if already loaded */ }

async function seedAdmin() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const email = process.env.ADMIN_EMAIL || 'amit.rai@celnet.in'
  const password = 'password123'
  const hash = await bcrypt.hash(password, 10)

  try {
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ('System Admin', $1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = $2`,
      [email, hash]
    )
    console.log('✅ Admin user seeded successfully.')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
  } catch (err) {
    console.error('Failed to seed admin:', err)
  } finally {
    await client.end()
  }
}

seedAdmin()
