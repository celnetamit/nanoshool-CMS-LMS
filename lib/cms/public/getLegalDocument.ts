import { getPublicPayload } from './payload'

export async function getLegalDocument(slug: string) {
  try {
    const payload = await getPublicPayload()
    const [docResult, allDocsResult] = await Promise.all([
      payload.find({
        collection: 'legal-documents',
        where: {
          slug: { equals: slug },
        },
        depth: 1,
        limit: 1,
      }),
      payload.find({
        collection: 'legal-documents',
        depth: 1,
        sort: '-effectiveDate',
        limit: 50,
      }),
    ])

    return {
      document: docResult.docs[0] ?? null,
      allDocuments: allDocsResult.docs,
    }
  } catch (error) {
    console.error(`[CMS] Failed to load legal document "${slug}":`, error)
    return {
      document: null,
      allDocuments: [],
    }
  }
}
