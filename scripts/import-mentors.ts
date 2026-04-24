import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@/payload.config'

type DomainDoc = { id: string; name?: string; slug?: string }
type MentorDoc = { id: string; slug?: string; name?: string }

type ImportRow = {
  referenceId: string
  fullName: string
  email: string
  biography: string
  skills: string
  profileExpertise: string
  keyTools: string
  designation: string
  org: string
  primaryDomain: string
  otherDomains: string
  website: string
  introVideoUrl: string
  profilePicUrl: string
  entryStatus: string
}

function parseArgs(argv: string[]) {
  const apply = argv.includes('--apply')
  const includeHold = argv.includes('--include-hold')
  const csvArg = argv.find((arg) => arg.endsWith('.csv'))
  const csvPath = csvArg || '260424044248_new-mentorship-form-basic-info_formidable_entries.csv'
  return {
    apply,
    includeHold,
    csvPath: path.resolve(process.cwd(), csvPath),
  }
}

function parseCSV(content: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i]
    const next = content[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1
      row.push(field)
      field = ''
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      continue
    }

    field += ch
  }

  if (field.length || row.length) {
    row.push(field)
    if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  }

  return rows
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase()
}

function findColumnIndex(headers: string[], candidates: string[]) {
  const normalized = headers.map(normalizeHeader)
  for (const candidate of candidates) {
    const index = normalized.indexOf(normalizeHeader(candidate))
    if (index >= 0) return index
  }
  return -1
}

function getValue(row: string[], idx: number): string {
  if (idx < 0) return ''
  return (row[idx] || '').trim()
}

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildLexicalParagraphs(text: string) {
  const paragraphs = text
    .split(/\n{2,}|\r\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) {
    return {
      root: {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }

  return {
    root: {
      children: paragraphs.map((paragraph) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: paragraph,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

function splitExpertise(...values: string[]) {
  const parts = values
    .flatMap((value) => value.split(/[\n;,|]/g))
    .map((item) => item.trim())
    .filter(Boolean)

  const deduped: string[] = []
  for (const item of parts) {
    if (item.length < 2) continue
    const normalized = item.toLowerCase()
    if (!deduped.some((existing) => existing.toLowerCase() === normalized)) {
      deduped.push(item)
    }
  }
  return deduped.slice(0, 20)
}

function mapDomainValues(rawPrimary: string, rawOther: string, domainBySlug: Map<string, DomainDoc>) {
  const values = [rawPrimary, rawOther]
    .flatMap((value) => value.split(/[,;/|]/g))
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)

  const mapped = new Set<string>()
  for (const value of values) {
    if (value.includes('ai') || value.includes('ml') || value.includes('data science')) {
      if (domainBySlug.has('ai')) mapped.add('ai')
      continue
    }
    if (value.includes('biotech') || value.includes('bio')) {
      if (domainBySlug.has('biotechnology')) mapped.add('biotechnology')
      continue
    }
    if (value.includes('nano')) {
      if (domainBySlug.has('nanotechnology')) mapped.add('nanotechnology')
      continue
    }
  }

  return Array.from(mapped).map((slug) => domainBySlug.get(slug)!.id)
}

async function ensureUniqueSlug(payload: Awaited<ReturnType<typeof getPayload>>, desired: string) {
  const base = slugify(desired) || 'mentor'
  let candidate = base
  let i = 1

  while (true) {
    const existing = await payload.find({
      collection: 'mentors',
      where: { slug: { equals: candidate } },
      limit: 1,
      pagination: false,
    })
    if (existing.docs.length === 0) return candidate
    candidate = `${base}-${i}`
    i += 1
  }
}

async function main() {
  try { process.loadEnvFile?.() } catch { /* ignore */ }

  const { apply, includeHold, csvPath } = parseArgs(process.argv.slice(2))
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`)
  }

  const raw = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCSV(raw)
  if (rows.length < 2) throw new Error('CSV has no data rows')

  const headers = rows[0]
  const dataRows = rows.slice(1)

  const idx = {
    referenceId: findColumnIndex(headers, ['Mentor Reference ID']),
    fullName: findColumnIndex(headers, ['Full Name (as per official ID) ']),
    email: findColumnIndex(headers, ['Primary Email Address', 'Email']),
    biography: findColumnIndex(headers, ['Biography']),
    skills: findColumnIndex(headers, ['Skills']),
    profileExpertise: findColumnIndex(headers, ['Professional Profile & Expertise']),
    keyTools: findColumnIndex(headers, ['Key Technical Skills & Tools']),
    designation: findColumnIndex(headers, ['Current Designation / Role', 'Current Designation']),
    org: findColumnIndex(headers, ['Name of the Organization', 'Current Organization']),
    primaryDomain: findColumnIndex(headers, ['Primary Domain']),
    otherDomains: findColumnIndex(headers, ['Other Domains']),
    website: findColumnIndex(headers, ['Website/URL']),
    introVideoUrl: findColumnIndex(headers, ['Intro video URL']),
    profilePicUrl: findColumnIndex(headers, ['Profile Pic URL']),
    entryStatus: findColumnIndex(headers, ['Entry Status']),
  }

  const parsedRows: ImportRow[] = dataRows.map((row) => ({
    referenceId: getValue(row, idx.referenceId),
    fullName: getValue(row, idx.fullName),
    email: getValue(row, idx.email),
    biography: getValue(row, idx.biography),
    skills: getValue(row, idx.skills),
    profileExpertise: getValue(row, idx.profileExpertise),
    keyTools: getValue(row, idx.keyTools),
    designation: getValue(row, idx.designation),
    org: getValue(row, idx.org),
    primaryDomain: getValue(row, idx.primaryDomain),
    otherDomains: getValue(row, idx.otherDomains),
    website: getValue(row, idx.website),
    introVideoUrl: getValue(row, idx.introVideoUrl),
    profilePicUrl: getValue(row, idx.profilePicUrl),
    entryStatus: getValue(row, idx.entryStatus),
  }))

  const eligibleRows = parsedRows.filter((row) => {
    if (!row.fullName) return false
    if (!includeHold && row.entryStatus && row.entryStatus.toLowerCase() !== 'approved') return false
    return true
  })

  const payload = await getPayload({ config })
  const domains = await payload.find({
    collection: 'domains',
    limit: 100,
    pagination: false,
  })
  const domainBySlug = new Map<string, DomainDoc>()
  for (const doc of domains.docs as DomainDoc[]) {
    if (doc.slug) domainBySlug.set(doc.slug, doc)
  }

  let created = 0
  let skipped = 0
  let failed = 0

  for (const row of eligibleRows) {
    try {
      const baseSlug = slugify(row.fullName)
      if (!baseSlug) {
        skipped += 1
        continue
      }

      const existingByName = await payload.find({
        collection: 'mentors',
        where: { name: { equals: row.fullName } },
        limit: 1,
        pagination: false,
      })
      if (existingByName.docs.length > 0) {
        skipped += 1
        continue
      }

      const slug = await ensureUniqueSlug(payload, baseSlug)
      const expertiseList = splitExpertise(row.skills, row.keyTools, row.profileExpertise)
      const domainIds = mapDomainValues(row.primaryDomain, row.otherDomains, domainBySlug)
      const taglineParts = [row.designation, row.org].filter(Boolean)
      const tagline = taglineParts.join(' @ ').slice(0, 140)
      const website =
        row.website &&
        row.website.toLowerCase() !== 'website' &&
        row.website.toLowerCase() !== 'na'
          ? row.website
          : row.introVideoUrl

      const mentorData = {
        name: row.fullName,
        slug,
        tagline: tagline || undefined,
        bio: row.biography ? buildLexicalParagraphs(row.biography) : undefined,
        domains: domainIds.length ? domainIds : undefined,
        expertise: expertiseList.map((area) => ({ area })),
        socialLinks: {
          website: website || undefined,
        },
        seo: {
          title: `${row.fullName} | NSTC Mentor`,
          description: (row.profileExpertise || row.biography || '').slice(0, 155) || undefined,
        },
      }

      if (apply) {
        await payload.create({
          collection: 'mentors',
          data: mentorData,
        })
      }

      created += 1
      const mode = apply ? 'CREATED' : 'DRY-RUN'
      console.log(`[${mode}] ${row.fullName} (${slug})`)
    } catch (error) {
      failed += 1
      console.error(`[ERROR] ${row.fullName}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log('\nMentor import summary')
  console.log(`CSV rows: ${dataRows.length}`)
  console.log(`Eligible rows: ${eligibleRows.length}${includeHold ? ' (including hold)' : ' (approved only)'}`)
  console.log(`Processed: ${created}`)
  console.log(`Skipped (existing/invalid): ${skipped}`)
  console.log(`Failed: ${failed}`)
  console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`)
}

main().catch((error) => {
  console.error('[mentors:import] Failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
