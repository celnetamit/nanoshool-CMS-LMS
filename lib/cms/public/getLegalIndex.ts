import { getPublicPayload } from './payload'

export async function getLegalIndex() {
  try {
    const payload = await getPublicPayload()
    const [pageResult, legalResult] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: {
          path: { equals: '/legal' },
          status: { equals: 'published' },
        },
        depth: 2,
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
      page: pageResult.docs[0] ?? null,
      documents: legalResult.docs,
    }
  } catch (error) {
    console.error('[CMS] Failed to load legal index content:', error)
    return {
      page: null,
      documents: [],
    }
  }
}
