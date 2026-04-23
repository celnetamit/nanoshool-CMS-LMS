import MeiliSearch from 'meilisearch'

export const searchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
})

// ─── Index Names ───────────────────────────────────────────
export const SEARCH_INDEXES = {
  products: 'products',
  mentors: 'mentors',
  domains: 'domains',
  pages: 'pages',
} as const

// ─── Initialize Indexes ────────────────────────────────────
export async function initSearchIndexes(): Promise<void> {
  // Products
  await searchClient.index(SEARCH_INDEXES.products).updateSettings({
    filterableAttributes: ['domain', 'type', 'level', 'certificate', 'status', 'price'],
    sortableAttributes: ['price', 'createdAt'],
    searchableAttributes: ['title', 'shortDescription', 'longDescription', 'mentorNames'],
  })

  // Mentors
  await searchClient.index(SEARCH_INDEXES.mentors).updateSettings({
    filterableAttributes: ['domains'],
    searchableAttributes: ['name', 'tagline', 'bio', 'expertise'],
  })

  // Domains
  await searchClient.index(SEARCH_INDEXES.domains).updateSettings({
    searchableAttributes: ['name', 'tagline', 'overview'],
  })

  console.log('[Search] Indexes initialized')
}

// ─── Index a product ───────────────────────────────────────
export async function indexProduct(product: {
  id: string
  title: string
  slug: string
  shortDescription?: string
  longDescription?: string
  domain: string
  type: string
  price: number
  salePrice?: number
  level?: string
  certificate: boolean
  status: string
}): Promise<void> {
  await searchClient.index(SEARCH_INDEXES.products).addDocuments([{ ...product }])
}

// ─── Remove a product from index ──────────────────────────
export async function removeProductFromIndex(id: string): Promise<void> {
  await searchClient.index(SEARCH_INDEXES.products).deleteDocument(id)
}

// ─── Search products ───────────────────────────────────────
export async function searchProducts(
  query: string,
  options?: { domain?: string; type?: string; page?: number; hitsPerPage?: number }
) {
  const filters: string[] = ["status = 'published'"]
  if (options?.domain) filters.push(`domain = '${options.domain}'`)
  if (options?.type) filters.push(`type = '${options.type}'`)

  return searchClient.index(SEARCH_INDEXES.products).search(query, {
    filter: filters.join(' AND '),
    page: options?.page ?? 1,
    hitsPerPage: options?.hitsPerPage ?? 20,
  })
}

// ─── Full Site Search ──────────────────────────────────────
export async function searchFullSite(query: string, hitsPerPage = 5) {
  const [products, domains, mentors] = await Promise.all([
    searchClient.index(SEARCH_INDEXES.products).search(query, { hitsPerPage, filter: "status = 'published'" }),
    searchClient.index(SEARCH_INDEXES.domains).search(query, { hitsPerPage }),
    searchClient.index(SEARCH_INDEXES.mentors).search(query, { hitsPerPage }),
  ])

  return {
    products: products.hits,
    domains: domains.hits,
    mentors: mentors.hits,
    totalHits: ((products as any).estimatedTotalHits ?? (products as any).totalHits ?? 0) + ((domains as any).estimatedTotalHits ?? (domains as any).totalHits ?? 0) + ((mentors as any).estimatedTotalHits ?? (mentors as any).totalHits ?? 0),
  }
}
