import { getPublicPayload } from './payload'

export async function getMentorsPage() {
  try {
    const payload = await getPublicPayload()
    const [pageResult, mentorsResult, testimonialsResult] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: {
          path: { equals: '/mentors' },
          status: { equals: 'published' },
        },
        depth: 2,
        limit: 1,
      }),
      payload.find({
        collection: 'mentors',
        where: {
          showOnMentorsPage: { equals: true },
        },
        depth: 1,
        sort: 'displayOrder',
        limit: 120,
      }),
      payload.find({
        collection: 'testimonials',
        where: { status: { equals: 'published' } },
        depth: 1,
        sort: 'displayOrder',
        limit: 6,
      }),
    ])

    return {
      page: pageResult.docs[0] ?? null,
      mentors: mentorsResult.docs,
      testimonials: testimonialsResult.docs,
    }
  } catch (error) {
    console.error('[CMS] Failed to load mentors page content:', error)
    return {
      page: null,
      mentors: [],
      testimonials: [],
    }
  }
}
