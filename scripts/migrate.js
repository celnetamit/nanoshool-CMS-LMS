const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile()
  }
} catch {
  // ignore: env is usually injected by the runtime
}

async function run() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('[db:migrate] DATABASE_URL is not set')
  }

  const migrationPath = path.join(__dirname, 'migrate.sql')
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`[db:migrate] Migration file not found at ${migrationPath}`)
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')
  if (!sql.trim()) {
    throw new Error('[db:migrate] Migration file is empty')
  }

  const client = new Client({ connectionString })

  try {
    await client.connect()
    await client.query(sql)
    console.log('[db:migrate] Migration completed successfully.')
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error('[db:migrate] Failed:', error.message)
  process.exit(1)
})

