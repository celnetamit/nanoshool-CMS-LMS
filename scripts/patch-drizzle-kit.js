const fs = require('fs')
const path = require('path')

const files = [
  path.join(process.cwd(), 'node_modules/drizzle-kit/api.js'),
  path.join(process.cwd(), 'node_modules/drizzle-kit/api.mjs'),
]

const oldSnippet = `  const db2 = {
    query: async (query, params) => {
      const res = await drizzleInstance.execute(sql3.raw(query));
      return res.rows;
    }
  };`

const newSnippet = `  const db2 = {
    query: async (query, params) => {
      let sqlText = query;
      if (Array.isArray(params) && params.length) {
        sqlText = query.replace(/\\$(\\d+)/g, (_match, rawIndex) => {
          const value = params[Number(rawIndex) - 1];
          if (value === null || value === undefined) {
            return 'NULL';
          }
          return "'" + String(value).replace(/'/g, "''") + "'";
        });
      }
      const res = await drizzleInstance.execute(sql3.raw(sqlText));
      return res.rows;
    }
  };`

let patchedAny = false

for (const file of files) {
  if (!fs.existsSync(file)) continue

  const original = fs.readFileSync(file, 'utf8')

  if (original.includes(newSnippet)) {
    console.log(`[patch-drizzle-kit] already patched: ${path.relative(process.cwd(), file)}`)
    patchedAny = true
    continue
  }

  if (!original.includes(oldSnippet)) {
    console.log(`[patch-drizzle-kit] target snippet not found: ${path.relative(process.cwd(), file)}`)
    continue
  }

  const updated = original.replace(oldSnippet, newSnippet)
  fs.writeFileSync(file, updated, 'utf8')
  console.log(`[patch-drizzle-kit] patched: ${path.relative(process.cwd(), file)}`)
  patchedAny = true
}

if (!patchedAny) {
  console.log('[patch-drizzle-kit] nothing patched')
}
