import { getPublicPayload } from './payload'

export async function getPartnersPage() {
  try {
    const payload = await getPublicPayload()
    const [pageResult, partnersResult] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: {
          path: { equals: '/partners' },
          status: { equals: 'published' },
        },
        depth: 2,
        limit: 1,
      }),
      payload.find({
        collection: 'partners',
        where: { status: { equals: 'published' } },
        depth: 1,
        sort: 'displayOrder',
        limit: 120,
      }),
    ])

    return {
      page: pageResult.docs[0] ?? null,
      partners: partnersResult.docs,
    }
  } catch (error) {
    console.error('[CMS] Failed to load partners page content:', error)
    return {
      page: null,
      partners: [],
    }
  }
}
