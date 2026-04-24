import { getPublicPayload } from './payload'

export async function getHomePage() {
  try {
    const payload = await getPublicPayload()
    const [pageResult, domainsResult, audiencesResult, productsResult, mentorsResult, partnersResult, testimonialsResult] =
      await Promise.all([
        payload.find({
          collection: 'pages',
          where: {
            path: { equals: '/' },
            status: { equals: 'published' },
          },
          depth: 3,
          limit: 1,
        }),
        payload.find({
          collection: 'domains',
          where: { status: { equals: 'published' } },
          depth: 1,
          sort: 'name',
          limit: 10,
        }),
        payload.find({
          collection: 'audiences',
          where: { status: { equals: 'published' } },
          depth: 1,
          sort: 'name',
          limit: 10,
        }),
        payload.find({
          collection: 'products',
          where: { status: { equals: 'published' } },
          depth: 2,
          sort: '-updatedAt',
          limit: 8,
        }),
        payload.find({
          collection: 'mentors',
          where: {
            showOnMentorsPage: { equals: true },
          },
          depth: 1,
          sort: 'displayOrder',
          limit: 8,
        }),
        payload.find({
          collection: 'partners',
          where: { status: { equals: 'published' } },
          depth: 1,
          sort: 'displayOrder',
          limit: 12,
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
      domains: domainsResult.docs,
      audiences: audiencesResult.docs,
      featuredProducts: productsResult.docs,
      featuredMentors: mentorsResult.docs,
      partners: partnersResult.docs,
      testimonials: testimonialsResult.docs,
    }
  } catch (error) {
    console.error('[CMS] Failed to load home page content:', error)
    return {
      page: null,
      domains: [],
      audiences: [],
      featuredProducts: [],
      featuredMentors: [],
      partners: [],
      testimonials: [],
    }
  }
}
