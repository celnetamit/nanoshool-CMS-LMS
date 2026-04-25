import { getPayload } from 'payload'
import { Client } from 'pg'

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile()
  }
} catch {
  // env is often injected already; ignore when native loading is unavailable
}

type DocWithId = { id: string }

type DomainDoc = DocWithId & { slug: string; name: string }
type AudienceDoc = DocWithId & { slug: string; name: string }
type MentorDoc = DocWithId & { slug: string; name: string; domains?: Array<string | DomainDoc> | null }
type ProductDoc = DocWithId & {
  slug: string
  title: string
  status?: string
  domain?: string | DomainDoc | null
  audiences?: Array<string | AudienceDoc> | null
}

type SqlSeedProduct = {
  domainSlug: string
  title: string
  slug: string
  type: 'course' | 'workshop' | 'internship' | 'flagship_program' | 'package'
  shortDescription: string
  longDescription: string
  price: number
  salePrice?: number | null
  duration?: string | null
  level?: 'beginner' | 'intermediate' | 'advanced' | null
  format?: 'self_paced' | 'live_cohort' | 'hybrid' | null
  certificate?: boolean
  audiences: string[]
}

type LexicalNode = {
  root: {
    children: Array<{
      children: Array<{
        detail: number
        format: number
        mode: string
        style: string
        text: string
        type: string
        version: number
      }>
      direction: string
      format: string
      indent: number
      type: string
      version: number
    }>
    direction: string
    format: string
    indent: number
    type: string
    version: number
  }
}

function buildLexicalParagraphs(paragraphs: string[]): LexicalNode {
  return {
    root: {
      children: paragraphs
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => ({
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

function getRelationshipId(value: string | DocWithId | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

async function upsertByUniqueField<T extends DocWithId>({
  payload,
  collection,
  field,
  value,
  data,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  collection: string
  field: string
  value: string
  data: Record<string, unknown>
}): Promise<T> {
  const existing = await payload.find({
    collection: collection as any,
    where: {
      [field]: {
        equals: value,
      },
    },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  const doc = existing.docs[0] as T | undefined
  if (doc) {
    return (await payload.update({
      collection: collection as any,
      id: doc.id,
      data,
      depth: 0,
      overrideAccess: true,
    })) as T
  }

  return (await payload.create({
    collection: collection as any,
    data,
    depth: 0,
    overrideAccess: true,
  })) as T
}

async function seedDomains(payload: Awaited<ReturnType<typeof getPayload>>) {
  const domains = [
    {
      slug: 'ai',
      name: 'Artificial Intelligence',
      tagline: 'Bridge theory, workflow, and applied intelligent systems.',
      overview: buildLexicalParagraphs([
        'NanoSchool positions Artificial Intelligence as a practical capability-building track for learners, professionals, researchers, and institutions.',
        'The AI domain should help users move from conceptual understanding into real workflows, technical judgment, and industry-oriented execution.',
      ]),
      hero: {
        eyebrow: 'AI Domain',
        headline: 'Artificial Intelligence',
        subheadline: 'Programs, mentors, and pathways for modern AI capability building.',
        primaryCtaLabel: 'Browse AI Courses',
        primaryCtaUrl: '/ai/courses',
      },
      highlights: [
        { title: 'Applied learning', description: 'Move from concepts into working systems, evaluation, and decision logic.' },
        { title: 'Role-aware pathways', description: 'Support students, teams, institutions, and advanced learners on one platform.' },
        { title: 'Mentor-led depth', description: 'Learn from practitioners, researchers, and domain specialists.' },
      ],
      stats: [
        { label: 'Programs', value: '40+' },
        { label: 'Mentors', value: '80+' },
        { label: 'Learners', value: '5,000+' },
        { label: 'Placement Rate', value: '92%' },
      ],
      faqs: [
        { question: 'Who is this AI domain for?', answer: buildLexicalParagraphs(['The AI catalog is designed for students, professionals, institutions, and advanced learners who want practical capability development.']) },
        { question: 'What kinds of formats are offered?', answer: buildLexicalParagraphs(['The platform supports courses, workshops, internships, flagship programs, and packages.']) },
      ],
      seo: {
        title: 'Artificial Intelligence Programs — NSTC',
        description: 'Explore AI programs, mentors, and applied learning pathways on NSTC.',
      },
    },
    {
      slug: 'biotechnology',
      name: 'Biotechnology',
      tagline: 'Connect research depth with emerging biotech applications.',
      overview: buildLexicalParagraphs([
        'The Biotechnology domain helps learners and institutions build capability across bioinformatics, genomics, applied biotech workflows, and research-facing pathways.',
        'It is designed to bridge scientific depth with practical relevance and modern industry contexts.',
      ]),
      hero: {
        eyebrow: 'Biotechnology Domain',
        headline: 'Biotechnology',
        subheadline: 'Research-aware and industry-relevant biotechnology learning pathways.',
        primaryCtaLabel: 'Browse Biotechnology Courses',
        primaryCtaUrl: '/biotechnology/courses',
      },
      highlights: [
        { title: 'Research-aligned', description: 'Suitable for learners who need rigor, not just surface-level exposure.' },
        { title: 'Industry-relevant', description: 'Connect domain science to practical and commercial contexts.' },
        { title: 'Multiple user segments', description: 'Useful across students, universities, faculty, and professionals.' },
      ],
      stats: [
        { label: 'Programs', value: '25+' },
        { label: 'Mentors', value: '50+' },
        { label: 'Learners', value: '3,000+' },
        { label: 'Placement Rate', value: '88%' },
      ],
      faqs: [
        { question: 'Is biotechnology only for academic users?', answer: buildLexicalParagraphs(['No. The domain is intended for both academic depth and practical workforce readiness.']) },
        { question: 'Do these pathways support institutions too?', answer: buildLexicalParagraphs(['Yes. The platform is designed to support universities, faculty, and structured institutional use cases.']) },
      ],
      seo: {
        title: 'Biotechnology Programs — NSTC',
        description: 'Explore biotechnology programs, mentors, and applied deep-science learning pathways.',
      },
    },
    {
      slug: 'nanotechnology',
      name: 'Nanotechnology',
      tagline: 'Develop nanoscale science capability with applied context.',
      overview: buildLexicalParagraphs([
        'The Nanotechnology domain is built for deep-science learners who want stronger visibility into emerging nanoscale applications, innovation pathways, and commercialization contexts.',
        'It combines scientific credibility with more modern platform-led discovery and learning journeys.',
      ]),
      hero: {
        eyebrow: 'Nanotechnology Domain',
        headline: 'Nanotechnology',
        subheadline: 'Programs and mentorship for learners exploring nanoscale science and innovation.',
        primaryCtaLabel: 'Browse Nanotechnology Courses',
        primaryCtaUrl: '/nanotechnology/courses',
      },
      highlights: [
        { title: 'Deep-science positioning', description: 'Keep scientific credibility front and center.' },
        { title: 'Modernized discovery', description: 'Translate a legacy concept into a cleaner platform experience.' },
        { title: 'Mentor-supported growth', description: 'Support progression through guided domain pathways.' },
      ],
      stats: [
        { label: 'Programs', value: '20+' },
        { label: 'Mentors', value: '35+' },
        { label: 'Learners', value: '2,000+' },
        { label: 'Placement Rate', value: '85%' },
      ],
      faqs: [
        { question: 'Can nanotechnology learners discover multiple product types?', answer: buildLexicalParagraphs(['Yes. The route model supports courses, workshops, internships, flagship programs, and packages.']) },
        { question: 'Is this domain meant only for advanced users?', answer: buildLexicalParagraphs(['No. The platform can support foundational through advanced learning journeys.']) },
      ],
      seo: {
        title: 'Nanotechnology Programs — NSTC',
        description: 'Explore nanotechnology programs, mentors, and deep-science pathways on NSTC.',
      },
    },
  ]

  const result = new Map<string, DomainDoc>()
  for (const domain of domains) {
    const doc = await upsertByUniqueField<DomainDoc>({
      payload,
      collection: 'domains',
      field: 'slug',
      value: domain.slug,
      data: {
        ...domain,
        status: 'published',
      },
    })
    result.set(domain.slug, doc)
  }

  return result
}

async function seedAudienceDocs(payload: Awaited<ReturnType<typeof getPayload>>) {
  const audiences = [
    {
      slug: 'enterprise',
      name: 'Enterprise',
      headline: 'Enterprise learning pathways for science and technology teams',
      subheadline: 'Help enterprise teams build structured capability across AI, Biotechnology, and Nanotechnology.',
      landingContent: buildLexicalParagraphs([
        'The enterprise pathway is designed for organizations that need structured capability building rather than isolated course consumption.',
        'It should support L&D, role-based upskilling, domain exploration, and more credible workforce-readiness positioning.',
      ]),
      valueProps: [
        { title: 'Role-based learning', description: 'Shape learning journeys around functional team needs instead of generic catalogs.' },
        { title: 'Domain specialization', description: 'Choose high-value domain tracks aligned with business priorities.' },
      ],
      faq: [
        {
          question: 'Can enterprise pathways be customized for different team functions?',
          answer: buildLexicalParagraphs([
            'Yes. Enterprise pathways are meant to support role-based capability plans instead of one-size-fits-all learning catalogs.',
          ]),
        },
        {
          question: 'Do these pathways support applied outcomes rather than content consumption only?',
          answer: buildLexicalParagraphs([
            'Yes. The positioning is deliberately practical so teams can connect learning to workflow, delivery, and workforce readiness.',
          ]),
        },
      ],
      ctaText: 'Explore Enterprise Pathways',
      ctaUrl: '/enterprise',
      seo: {
        title: 'Enterprise Programs — NSTC',
        description: 'Upskill teams with science and technology learning pathways on NSTC.',
      },
    },
    {
      slug: 'university',
      name: 'University',
      headline: 'University collaborations and curriculum-aligned pathways',
      subheadline: 'Bring domain-specific learning and mentor-led programs into institutional environments.',
      landingContent: buildLexicalParagraphs([
        'The university pathway is built for institutions that want industry-aware and research-aware learning integration.',
        'It should support curriculum enrichment, student exposure, mentorship, and more structured collaboration models.',
      ]),
      valueProps: [
        { title: 'Institution-ready', description: 'Support structured academic partnerships and scalable program models.' },
        { title: 'Learner outcomes', description: 'Connect academic progression with workforce and research relevance.' },
      ],
      faq: [
        {
          question: 'Is this only for curriculum partnerships?',
          answer: buildLexicalParagraphs([
            'No. University pathways can also support mentorship, workshops, flagship initiatives, and institution-level collaboration models.',
          ]),
        },
        {
          question: 'Can universities use multiple domains at once?',
          answer: buildLexicalParagraphs([
            'Yes. The public model is designed to let institutions explore AI, Biotechnology, and Nanotechnology under one platform umbrella.',
          ]),
        },
      ],
      ctaText: 'Explore University Pathways',
      ctaUrl: '/university',
      seo: {
        title: 'University Programs — NSTC',
        description: 'Academic partnerships, curriculum support, and university-focused learning tracks.',
      },
    },
    {
      slug: 'students',
      name: 'Students',
      headline: 'Student pathways for practical, future-ready growth',
      subheadline: 'Courses, workshops, internships, and flagship programs designed to move students toward real capability.',
      landingContent: buildLexicalParagraphs([
        'The student pathway focuses on practical readiness, not only informational exposure.',
        'It should help students discover the right format, domain, and learning intensity for where they are now.',
      ]),
      valueProps: [
        { title: 'Multiple formats', description: 'Choose between shorter learning experiences and deeper guided programs.' },
        { title: 'Applied orientation', description: 'Build capability that is easier to translate into internships, research, and career momentum.' },
      ],
      faq: [
        {
          question: 'Are these programs beginner friendly?',
          answer: buildLexicalParagraphs([
            'Some are beginner-friendly and others are deeper specializations. The catalog is meant to support progression rather than a single learner stage.',
          ]),
        },
        {
          question: 'Can students move from short formats into deeper programs?',
          answer: buildLexicalParagraphs([
            'Yes. Workshops, courses, internships, and flagship programs are meant to create a more credible progression path.',
          ]),
        },
      ],
      ctaText: 'Explore Student Programs',
      ctaUrl: '/students',
      seo: {
        title: 'Student Programs — NSTC',
        description: 'Career-oriented programs and internships for students across emerging domains.',
      },
    },
    {
      slug: 'phd-professors',
      name: 'PhD & Professors',
      headline: 'Advanced pathways for researchers, PhD scholars, and faculty',
      subheadline: 'Support research-aligned learning, collaboration, and advanced domain exploration.',
      landingContent: buildLexicalParagraphs([
        'This audience pathway is designed for users who care about credibility, depth, and research-facing relevance.',
        'It should support collaboration, advanced learning, and scientific-commercialization adjacency where appropriate.',
      ]),
      valueProps: [
        { title: 'Research-aware content', description: 'Designed for users who expect stronger scientific grounding.' },
        { title: 'Collaboration-ready positioning', description: 'Useful for advanced academic and institutional relationships.' },
      ],
      faq: [
        {
          question: 'Does this pathway prioritize academic depth?',
          answer: buildLexicalParagraphs([
            'Yes. This audience is positioned for users who care about stronger scientific grounding, advanced context, and research alignment.',
          ]),
        },
        {
          question: 'Can faculty use these pathways for collaboration as well as learning?',
          answer: buildLexicalParagraphs([
            'Yes. The pathway is meant to support research-facing learning, collaboration, and institutional engagement opportunities.',
          ]),
        },
      ],
      ctaText: 'Explore Advanced Tracks',
      ctaUrl: '/phd-professors',
      seo: {
        title: 'PhD & Professors — NSTC',
        description: 'Research collaboration and advanced domain learning tracks for PhD scholars and professors.',
      },
    },
    {
      slug: 'hiring-partners',
      name: 'Hiring Partners',
      headline: 'Hiring partner pathways for workforce-ready talent discovery',
      subheadline: 'Connect with learners and cohorts being trained across future-facing science and technology domains.',
      landingContent: buildLexicalParagraphs([
        'The hiring-partners pathway helps frame NanoSchool as more than a content destination.',
        'It positions the platform as a capability ecosystem that can support better talent visibility and partner engagement.',
      ]),
      valueProps: [
        { title: 'Domain-ready talent pools', description: 'Connect hiring intent with domain-focused skill development.' },
        { title: 'Stronger ecosystem fit', description: 'Use platform pathways to support long-term partnership and talent access.' },
      ],
      faq: [
        {
          question: 'Is this page only for recruitment?',
          answer: buildLexicalParagraphs([
            'No. It also frames NSTC as a long-term capability partner, not just a one-time hiring source.',
          ]),
        },
        {
          question: 'Can hiring partners explore multiple domains from one surface?',
          answer: buildLexicalParagraphs([
            'Yes. Hiring partners can use this pathway to understand talent and program direction across all three core domains.',
          ]),
        },
      ],
      ctaText: 'Explore Talent Pathways',
      ctaUrl: '/hiring-partners',
      seo: {
        title: 'Hiring Partners — NSTC',
        description: 'Discover and hire job-ready learners trained in high-impact science and technology domains.',
      },
    },
    {
      slug: 'mentors',
      name: 'Mentors',
      headline: 'Join the mentor ecosystem shaping future-ready scientific capability',
      subheadline: 'Support learners and institutions with expertise across high-impact deep-science domains.',
      landingContent: buildLexicalParagraphs([
        'The mentors audience pathway helps explain why mentorship is a core platform surface rather than a small supporting detail.',
      ]),
      valueProps: [
        { title: 'High-signal positioning', description: 'Showcase why mentors matter to the platform’s credibility and outcomes.' },
        { title: 'Cross-domain opportunity', description: 'Connect mentors to domain-specific and audience-specific journeys.' },
      ],
      faq: [
        {
          question: 'Why is mentorship a public trust surface?',
          answer: buildLexicalParagraphs([
            'Mentorship is part of how the platform signals credibility, guidance, and stronger learner outcomes across complex domains.',
          ]),
        },
      ],
      ctaText: 'Meet Our Mentors',
      ctaUrl: '/mentors',
      seo: {
        title: 'Mentors — NSTC',
        description: 'Explore the mentor network supporting NSTC learners and programs.',
      },
    },
  ]

  const result = new Map<string, AudienceDoc>()
  for (const audience of audiences) {
    const doc = await upsertByUniqueField<AudienceDoc>({
      payload,
      collection: 'audiences',
      field: 'slug',
      value: audience.slug,
      data: {
        ...audience,
        status: 'published',
      },
    })
    result.set(audience.slug, doc)
  }

  return result
}

async function seedMentors(
  payload: Awaited<ReturnType<typeof getPayload>>,
  domainsBySlug: Map<string, DomainDoc>
) {
  const mentors = [
    {
      slug: 'dr-aisha-mehra',
      name: 'Dr. Aisha Mehra',
      tagline: 'AI systems mentor focused on applied learning design',
      designation: 'AI Research Lead',
      organization: 'NSTC Mentor Network',
      shortBio: 'Works at the intersection of applied AI education, model evaluation, and workflow-driven learning design.',
      bio: buildLexicalParagraphs([
        'Dr. Aisha Mehra focuses on making AI education more applied, structured, and usable for learners across multiple stages.',
      ]),
      domains: [domainsBySlug.get('ai')?.id].filter(Boolean),
      expertise: [{ area: 'Machine Learning' }, { area: 'Applied AI Workflows' }, { area: 'Model Evaluation' }],
      credentials: [{ value: 'Research-led AI program design' }],
      featured: true,
      showOnMentorsPage: true,
      displayOrder: 1,
      seo: {
        title: 'Dr. Aisha Mehra | NSTC Mentor',
        description: 'AI mentor supporting applied learning and workflow-driven capability building.',
      },
    },
    {
      slug: 'dr-rohan-kapoor',
      name: 'Dr. Rohan Kapoor',
      tagline: 'Biotechnology mentor for research-aware capability development',
      designation: 'Biotech Program Advisor',
      organization: 'NSTC Mentor Network',
      shortBio: 'Supports biotechnology learning paths that connect academic depth with practical relevance.',
      bio: buildLexicalParagraphs([
        'Dr. Rohan Kapoor helps shape biotechnology pathways for learners, faculty, and institutions seeking more practical domain readiness.',
      ]),
      domains: [domainsBySlug.get('biotechnology')?.id].filter(Boolean),
      expertise: [{ area: 'Bioinformatics' }, { area: 'Applied Biotechnology' }, { area: 'Research Pathways' }],
      credentials: [{ value: 'Research and industry-aligned mentoring' }],
      featured: true,
      showOnMentorsPage: true,
      displayOrder: 2,
      seo: {
        title: 'Dr. Rohan Kapoor | NSTC Mentor',
        description: 'Biotechnology mentor for research-aware and industry-relevant learning.',
      },
    },
    {
      slug: 'dr-neha-sen',
      name: 'Dr. Neha Sen',
      tagline: 'Nanotechnology mentor for deep-science learning journeys',
      designation: 'Nanotechnology Advisor',
      organization: 'NSTC Mentor Network',
      shortBio: 'Supports deep-science learning journeys with a focus on credible domain progression and innovation context.',
      bio: buildLexicalParagraphs([
        'Dr. Neha Sen helps learners and institutions navigate nanotechnology pathways with stronger scientific clarity and application awareness.',
      ]),
      domains: [domainsBySlug.get('nanotechnology')?.id].filter(Boolean),
      expertise: [{ area: 'Nanomaterials' }, { area: 'Innovation Pathways' }, { area: 'Scientific Capability Building' }],
      credentials: [{ value: 'Deep-science mentoring and program guidance' }],
      featured: true,
      showOnMentorsPage: true,
      displayOrder: 3,
      seo: {
        title: 'Dr. Neha Sen | NSTC Mentor',
        description: 'Nanotechnology mentor supporting deep-science learning and domain progression.',
      },
    },
    {
      slug: 'dr-karan-malhotra',
      name: 'Dr. Karan Malhotra',
      tagline: 'AI mentor focused on deployment-ready model systems and evaluation practice',
      designation: 'Generative AI Architect',
      organization: 'NSTC Mentor Network',
      shortBio: 'Helps learners move from prompt experimentation into system design, evaluation, and applied AI delivery.',
      bio: buildLexicalParagraphs([
        'Dr. Karan Malhotra supports AI learners who need a clearer bridge from experimentation to production-aware workflows and technical decision making.',
      ]),
      domains: [domainsBySlug.get('ai')?.id].filter(Boolean),
      expertise: [{ area: 'Generative AI Systems' }, { area: 'Model Evaluation' }, { area: 'AI Productization' }],
      credentials: [{ value: 'Production-oriented AI systems mentoring' }],
      featured: true,
      showOnMentorsPage: true,
      displayOrder: 4,
      seo: {
        title: 'Dr. Karan Malhotra | NSTC Mentor',
        description: 'AI mentor for evaluation-driven and deployment-aware AI learning pathways.',
      },
    },
    {
      slug: 'dr-isha-banerjee',
      name: 'Dr. Isha Banerjee',
      tagline: 'Biotechnology mentor for translational research and modern lab-to-industry thinking',
      designation: 'Biotech Innovation Mentor',
      organization: 'NSTC Mentor Network',
      shortBio: 'Guides learners and institutions through translational biotechnology pathways with stronger industry relevance.',
      bio: buildLexicalParagraphs([
        'Dr. Isha Banerjee helps biotechnology learners understand how research depth, scientific credibility, and real-world application can fit together on the same pathway.',
      ]),
      domains: [domainsBySlug.get('biotechnology')?.id].filter(Boolean),
      expertise: [{ area: 'Translational Biotechnology' }, { area: 'Biotech Innovation' }, { area: 'Applied Research' }],
      credentials: [{ value: 'Lab-to-industry biotech mentoring' }],
      featured: true,
      showOnMentorsPage: true,
      displayOrder: 5,
      seo: {
        title: 'Dr. Isha Banerjee | NSTC Mentor',
        description: 'Biotechnology mentor for translational research and applied scientific capability building.',
      },
    },
    {
      slug: 'dr-vivek-raman',
      name: 'Dr. Vivek Raman',
      tagline: 'Nanotechnology mentor for materials-focused learning and innovation strategy',
      designation: 'Nano Innovation Fellow',
      organization: 'NSTC Mentor Network',
      shortBio: 'Supports nanoscale science learners with clearer pathways across materials, applications, and innovation context.',
      bio: buildLexicalParagraphs([
        'Dr. Vivek Raman helps nanotechnology learners connect scientific fundamentals with innovation pathways and credible domain progression.',
      ]),
      domains: [domainsBySlug.get('nanotechnology')?.id].filter(Boolean),
      expertise: [{ area: 'Nanomaterials' }, { area: 'Nano Applications' }, { area: 'Innovation Strategy' }],
      credentials: [{ value: 'Applied nanotechnology mentoring and advisory' }],
      featured: true,
      showOnMentorsPage: true,
      displayOrder: 6,
      seo: {
        title: 'Dr. Vivek Raman | NSTC Mentor',
        description: 'Nanotechnology mentor for material science learning, innovation context, and domain progression.',
      },
    },
  ]

  const result = new Map<string, MentorDoc>()
  for (const mentor of mentors) {
    const doc = await upsertByUniqueField<MentorDoc>({
      payload,
      collection: 'mentors',
      field: 'slug',
      value: mentor.slug,
      data: mentor,
    })
    result.set(mentor.slug, doc)
  }
  return result
}

async function seedPartners(payload: Awaited<ReturnType<typeof getPayload>>) {
  const partners = [
    {
      slug: 'iit-delhi-collaboration',
      name: 'IIT Delhi',
      website: 'https://home.iitd.ac.in/',
      partnerType: 'university',
      shortDescription: 'Academic and research-aligned collaboration supporting advanced technology programming, scientific credibility, and mentor-connected learning pathways.',
      featured: true,
      displayOrder: 1,
      status: 'published',
    },
    {
      slug: 'industry-ai-collaboration-network',
      name: 'AI Industry Collaboration Network',
      partnerType: 'corporate',
      shortDescription: 'Industry-facing collaboration model for applied AI capability building, live problem framing, and workflow-aware learning design.',
      featured: true,
      displayOrder: 2,
      status: 'published',
    },
    {
      slug: 'biotech-research-partner-network',
      name: 'Biotech Research Partner Network',
      partnerType: 'research_lab',
      shortDescription: 'Research-aware collaboration support for biotechnology programs, translational exposure, and scientific capability-building initiatives.',
      featured: true,
      displayOrder: 3,
      status: 'published',
    },
    {
      slug: 'nano-innovation-ecosystem',
      name: 'Nano Innovation Ecosystem',
      partnerType: 'ecosystem_partner',
      shortDescription: 'Innovation-oriented support for nanotechnology pathways, application framing, and ecosystem-level domain partnerships.',
      featured: true,
      displayOrder: 4,
      status: 'published',
    },
    {
      slug: 'future-skills-enterprise-forum',
      name: 'Future Skills Enterprise Forum',
      partnerType: 'corporate',
      shortDescription: 'Enterprise collaboration support for role-based upskilling, workforce-readiness programs, and capability planning across future-facing domains.',
      featured: true,
      displayOrder: 5,
      status: 'published',
    },
    {
      slug: 'advanced-science-university-consortium',
      name: 'Advanced Science University Consortium',
      partnerType: 'university',
      shortDescription: 'Institutional collaboration model for curriculum enrichment, mentor access, research-aware pathways, and cross-domain academic programming.',
      featured: true,
      displayOrder: 6,
      status: 'published',
    },
  ]

  const result: string[] = []
  for (const partner of partners) {
    const doc = await upsertByUniqueField<DocWithId>({
      payload,
      collection: 'partners',
      field: 'slug',
      value: partner.slug,
      data: partner,
    })
    result.push(doc.id)
  }
  return result
}

async function seedTestimonials(
  payload: Awaited<ReturnType<typeof getPayload>>,
  domainsBySlug: Map<string, DomainDoc>
) {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'ML Engineer',
      organization: 'Applied AI Cohort Graduate',
      quote: 'The platform makes advanced domains feel structured, credible, and much easier to navigate.',
      domains: [domainsBySlug.get('ai')?.id].filter(Boolean),
      featured: true,
      displayOrder: 1,
      status: 'published',
    },
    {
      name: 'Rahul Mehta',
      role: 'Research Scholar',
      organization: 'Biotechnology Pathway Learner',
      quote: 'The biotechnology journey feels research-aware without becoming inaccessible or overly academic in presentation.',
      domains: [domainsBySlug.get('biotechnology')?.id].filter(Boolean),
      featured: true,
      displayOrder: 2,
      status: 'published',
    },
    {
      name: 'Aisha Patel',
      role: 'PhD Candidate',
      organization: 'Nanotechnology Learner',
      quote: 'The new platform direction finally gives the deep-science experience a cleaner, more modern structure.',
      domains: [domainsBySlug.get('nanotechnology')?.id].filter(Boolean),
      featured: true,
      displayOrder: 3,
      status: 'published',
    },
    {
      name: 'Nikhil Verma',
      role: 'L&D Manager',
      organization: 'Enterprise Learning Partner',
      quote: 'The updated public experience makes it much easier to understand how domain pathways map to real workforce capability goals.',
      domains: [domainsBySlug.get('ai')?.id].filter(Boolean),
      featured: true,
      displayOrder: 4,
      status: 'published',
    },
    {
      name: 'Sneha Deshmukh',
      role: 'University Program Lead',
      organization: 'Academic Collaboration Partner',
      quote: 'The platform now presents scientific depth and institutional relevance in a way that feels clear, modern, and partnership-ready.',
      domains: [domainsBySlug.get('biotechnology')?.id].filter(Boolean),
      featured: true,
      displayOrder: 5,
      status: 'published',
    },
    {
      name: 'Arjun Rao',
      role: 'Graduate Researcher',
      organization: 'NSTC Learner',
      quote: 'The domain hubs and mentor surfaces make the learning journey feel curated instead of scattered.',
      domains: [domainsBySlug.get('nanotechnology')?.id].filter(Boolean),
      featured: true,
      displayOrder: 6,
      status: 'published',
    },
  ]

  const result: string[] = []
  for (const testimonial of testimonials) {
    const doc = await upsertByUniqueField<DocWithId>({
      payload,
      collection: 'testimonials',
      field: 'name',
      value: testimonial.name,
      data: testimonial,
    })
    result.push(doc.id)
  }
  return result
}

async function seedLegalDocuments(payload: Awaited<ReturnType<typeof getPayload>>) {
  const docs = [
    {
      slug: 'payment-policy',
      title: 'Payment Policy',
      version: 'v1.0',
      effectiveDate: new Date().toISOString(),
      content: buildLexicalParagraphs([
        'Payments for NSTC programs are processed through the checkout flow shown on the relevant program page or enrollment surface.',
        'Program access is confirmed only after successful payment authorization and the creation of a corresponding enrollment or payment record inside the platform.',
        'Invoices, payment status, and support follow-up may depend on the learner account information supplied during checkout. Users are responsible for sharing accurate contact and billing details.',
        'If a transaction appears successful at the banking layer but the platform does not confirm enrollment, users should contact support before attempting repeated payments.',
        'For invoice corrections, payment confirmation delays, or other transaction-related questions, users should contact NSTC support with the registered email address and the relevant payment reference.',
        'Published program pricing, discounts, taxes, and enrollment rules may change over time, but the terms shown at checkout are the terms used to evaluate the transaction at the moment of purchase.',
      ]),
      seo: {
        title: 'Payment Policy — NSTC',
        description: 'Review the payment policy for NSTC products and platform services.',
      },
    },
    {
      slug: 'cancellation-policy',
      title: 'Cancellation Policy',
      version: 'v1.0',
      effectiveDate: new Date().toISOString(),
      content: buildLexicalParagraphs([
        'Cancellation requests for instructor-led programs, internships, workshops, or bundled pathways are reviewed against the specific schedule, seat commitment, and delivery stage of the purchased program.',
        'Requests raised before a cohort, workshop, or guided program begins are generally easier to review than requests submitted after content access, mentor coordination, or operational allocation has started.',
        'Institutional or enterprise engagements may follow separately approved commercial terms when those terms differ from the default public checkout flow.',
        'Users should submit cancellation questions in writing so the NSTC team can review the applicable program conditions and respond with the right next step.',
        'A cancellation request does not automatically create a refund, transfer, or fee waiver unless that outcome is confirmed through the applicable program review.',
        'Where a program reserves limited seats, mentor time, or operational onboarding capacity, the timing of the cancellation request can materially affect the options that remain available.',
      ]),
      seo: {
        title: 'Cancellation Policy — NSTC',
        description: 'Review the cancellation policy for NSTC products and services.',
      },
    },
    {
      slug: 'refund-policy',
      title: 'Refund Policy',
      version: 'v1.0',
      effectiveDate: new Date().toISOString(),
      content: buildLexicalParagraphs([
        'Refund eligibility depends on the kind of product purchased, the delivery stage of the program, and whether learner access or mentor-supported operations have already started.',
        'Short-format workshops, digitally unlocked content, and scheduled cohort programs may follow different review criteria because resource allocation and access activation happen at different points in the journey.',
        'Approved refunds are typically returned to the original payment method, subject to the processing timelines of the payment partner or banking network.',
        'Refund requests that do not meet the applicable policy conditions may instead be handled through rescheduling, transfer review, or support-led resolution where appropriate.',
        'Users seeking a refund review should include the program name, registered email address, payment reference, and a short explanation of the request so the NSTC team can assess the case quickly.',
        'Submitting a refund request does not pause the underlying review timeline automatically unless NSTC confirms that the request has been accepted for formal processing.',
      ]),
      seo: {
        title: 'Refund Policy — NSTC',
        description: 'Review the refund policy for NSTC platform purchases and services.',
      },
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      version: 'v1.0',
      effectiveDate: new Date().toISOString(),
      content: buildLexicalParagraphs([
        'NSTC collects account, payment, enrollment, and program-interaction data required to operate the learning platform, support users, and deliver purchased services.',
        'This information may be used for authentication, learner support, program administration, payments, analytics, compliance review, and product improvement across the platform experience.',
        'Where mentors, institutional collaborators, or service providers are involved in program delivery, data access should be limited to the minimum operational information required for that workflow.',
        'Users may contact NSTC support for questions related to stored personal information, platform communications, or operational privacy expectations.',
        'This public policy copy is intended to describe the platform data model and operational expectations clearly; final production legal review should still align the wording with the organization’s formal compliance requirements.',
        'Operational analytics or service logs may also be used to maintain platform reliability, investigate support issues, and improve the quality of the learner experience over time.',
      ]),
      seo: {
        title: 'Privacy Policy — NSTC',
        description: 'Review the privacy policy for NSTC platform usage.',
      },
    },
    {
      slug: 'consent-policy',
      title: 'Consent Policy',
      version: 'v1.0',
      effectiveDate: new Date().toISOString(),
      content: buildLexicalParagraphs([
        'By using NSTC services, users acknowledge the platform workflows required for account access, payments, program participation, learner support, and operational communications.',
        'Additional consent may be requested when a program involves mentor interaction, institutional coordination, learner outcome tracking, recordings, or other delivery-specific processes.',
        'Users should review program details carefully before enrollment so that any program-specific expectations are understood before access is activated.',
        'Where a program includes recordings, external tools, institution-linked delivery, or mentor feedback loops, continued participation may depend on accepting the relevant operational terms for that program format.',
        'If a learner or collaborating organization does not agree with a required operational condition for a specific program format, participation may need to be paused or declined before access is activated.',
      ]),
      seo: {
        title: 'Consent Policy — NSTC',
        description: 'Review the consent policy for NSTC products and services.',
      },
    },
  ]

  for (const doc of docs) {
    await upsertByUniqueField({
      payload,
      collection: 'legal-documents',
      field: 'slug',
      value: doc.slug,
      data: doc,
    })
  }
}

async function seedPages(
  payload: Awaited<ReturnType<typeof getPayload>>,
  audiencesBySlug: Map<string, AudienceDoc>
) {
  const audienceIds = Array.from(audiencesBySlug.values())
    .filter((audience) => audience.slug !== 'mentors')
    .map((audience) => audience.id)

  const pages = [
    {
      slug: 'home',
      path: '/',
      pageType: 'home',
      title: 'Bridge Academia, Research and Industry with Future-Ready Skills.',
      excerpt:
        'NanoSchool is a global workforce-learning platform for deep science and emerging technologies across AI, Biotechnology, and Nanotechnology.',
      hero: {
        eyebrow: 'Deep Science Learning Commerce Platform',
        headline: 'Bridge Academia, Research and Industry with Future-Ready Skills.',
        subheadline:
          'NanoSchool is a global workforce-learning platform for deep science and emerging technologies, built for students, professionals, researchers, faculty, and institutions.',
        primaryCtaLabel: 'Explore Programs',
        primaryCtaUrl: '/ai',
        secondaryCtaLabel: 'Meet Our Mentors',
        secondaryCtaUrl: '/mentors',
      },
      content: buildLexicalParagraphs([
        'The home page should communicate the platform as more than a course storefront.',
        'It should position NanoSchool as a modern capability-building platform for learners, researchers, faculty, professionals, and institutions.',
      ]),
      sections: [
        {
          blockType: 'domainCards',
          kicker: 'Core Domains',
          heading: 'Explore the Future Across Three Applied Science Tracks',
          body: 'The public platform is organized around the core NanoSchool domains so learners and institutions can find relevant programs, mentors, and pathways quickly.',
        },
        {
          blockType: 'featuredProducts',
          kicker: 'Featured Programs',
          heading: 'Live Products from the New Catalog',
          body: 'These cards are driven from the shared public CMS helper layer and use published catalog data.',
        },
        {
          blockType: 'audienceCards',
          kicker: 'Audience Pathways',
          heading: 'Built for Learners, Institutions, and Industry Partners',
          audiences: audienceIds,
        },
        {
          blockType: 'testimonials',
          kicker: 'Proof and People',
          heading: 'Mentors and outcomes that make the platform credible',
        },
        {
          blockType: 'mentorSpotlights',
          kicker: 'Expert network',
          heading: 'Guided by mentors who bridge theory, research, and execution',
          body: 'The public experience should make mentor quality visible early, especially for complex domains where credibility matters.',
        },
        {
          blockType: 'partnerLogos',
          kicker: 'Institutional trust',
          heading: 'Built with universities, research partners, and industry collaborators',
          body: 'Trust surfaces should feel integrated into the platform story, not bolted on at the bottom of the page.',
        },
        {
          blockType: 'faq',
          kicker: 'FAQ',
          heading: 'Common questions about the NanoSchool platform',
          items: [
            {
              question: 'What makes NanoSchool different from a normal course catalog?',
              answer: buildLexicalParagraphs([
                'The public site is positioned as a capability-building platform that connects domain learning, mentorship, products, and institutional pathways.',
              ]),
            },
            {
              question: 'Who is the platform built for?',
              answer: buildLexicalParagraphs([
                'It is built for students, professionals, researchers, faculty, institutions, and ecosystem partners navigating applied science and emerging technology domains.',
              ]),
            },
          ],
        },
        {
          blockType: 'ctaBanner',
          kicker: 'Next step',
          heading: 'Start building the next version of your capability stack.',
          body: 'Browse programs by domain, explore mentors, and move from academic understanding to real applied workflows.',
          primaryCtaLabel: 'Start with AI',
          primaryCtaUrl: '/ai',
          secondaryCtaLabel: 'Search All Programs',
          secondaryCtaUrl: '/search',
        },
      ],
      status: 'published',
      seo: {
        title: 'NSTC — AI, Biotechnology & Nanotechnology Learning Platform',
        description: 'Bridge academia, research, and industry with future-ready learning in AI, Biotechnology, and Nanotechnology.',
      },
    },
    {
      slug: 'mentors',
      path: '/mentors',
      pageType: 'generic',
      title: 'Mentors',
      excerpt:
        'Meet mentors shaping programs across AI, Biotechnology, and Nanotechnology.',
      content: buildLexicalParagraphs([
        'The mentors page should establish the mentor network as a core trust and outcomes surface for the platform.',
      ]),
      status: 'published',
      seo: {
        title: 'Mentors — NSTC',
        description: 'Meet the mentors supporting NSTC learners and programs.',
      },
    },
    {
      slug: 'partners',
      path: '/partners',
      pageType: 'partner',
      title: 'Partners',
      excerpt:
        'NSTC works with universities, research organizations, and enterprise collaborators to build credible domain programs, mentor-led pathways, and workforce-aligned learning experiences.',
      content: buildLexicalParagraphs([
        'The partners page should communicate institutional and industry credibility with a clearer collaboration story.',
        'It should help organizations understand that NSTC is designed for long-term capability-building partnerships, not just one-off listing visibility.',
        'The messaging should make it obvious that partnership can span curriculum, mentorship, institutional programming, and enterprise capability outcomes.',
      ]),
      status: 'published',
      seo: {
        title: 'Partners — NSTC',
        description: 'Explore the institutional, research, and enterprise partners helping shape NSTC programs and learning pathways.',
      },
    },
    {
      slug: 'legal-index',
      path: '/legal',
      pageType: 'generic',
      title: 'Legal',
      excerpt:
        'Review the operating policies, learner-facing terms, and public legal documents that support NSTC platform usage.',
      content: buildLexicalParagraphs([
        'The legal index should make policies easy to discover, compare, and review before enrollment or partnership engagement.',
        'These documents are structured to explain the main operational expectations of the platform in a clearer public-facing format.',
        'They should help learners, institutions, and partners understand the trust model of the platform before they begin a deeper commercial or academic engagement.',
      ]),
      status: 'published',
      seo: {
        title: 'Legal — NSTC',
        description: 'Review NSTC payment, refund, privacy, consent, and related platform policies.',
      },
    },
  ]

  for (const page of pages) {
    await upsertByUniqueField({
      payload,
      collection: 'pages',
      field: 'path',
      value: page.path,
      data: page,
    })
  }
}

function buildSeedProducts(): SqlSeedProduct[] {
  return [
    {
      domainSlug: 'ai',
      title: 'Applied Machine Learning Foundations',
      slug: 'ai-applied-machine-learning-foundations',
      type: 'course',
      shortDescription: 'Build practical AI literacy across data workflows, model training, evaluation, and real-world decision use cases.',
      longDescription:
        'This course helps learners move from basic machine learning theory into practical model-building, evaluation, and workflow literacy for real-world teams.',
      price: 14999,
      salePrice: 11999,
      duration: '8 weeks',
      level: 'beginner',
      format: 'live_cohort',
      certificate: true,
      audiences: ['students', 'enterprise', 'university'],
    },
    {
      domainSlug: 'ai',
      title: 'Generative AI Workflow Design Sprint',
      slug: 'ai-generative-ai-workflow-design-sprint',
      type: 'workshop',
      shortDescription: 'A live workshop for designing prompt workflows, evaluation loops, and production-aware GenAI usage patterns.',
      longDescription:
        'This workshop is built for learners and teams who need stronger judgment around prompt systems, evaluation, orchestration, and applied AI delivery.',
      price: 6999,
      salePrice: 4999,
      duration: '2 days',
      level: 'intermediate',
      format: 'live_cohort',
      certificate: true,
      audiences: ['enterprise', 'students', 'hiring-partners'],
    },
    {
      domainSlug: 'ai',
      title: 'AI Systems Internship Track',
      slug: 'ai-systems-internship-track',
      type: 'internship',
      shortDescription: 'Gain guided exposure to evaluation, workflow automation, and real AI delivery patterns in a mentored internship format.',
      longDescription:
        'The internship track helps learners build practical momentum through mentor-led project work, AI system thinking, and applied execution experience.',
      price: 19999,
      salePrice: 16999,
      duration: '10 weeks',
      level: 'intermediate',
      format: 'hybrid',
      certificate: true,
      audiences: ['students', 'phd-professors', 'hiring-partners'],
    },
    {
      domainSlug: 'ai',
      title: 'AI Product and Leadership Flagship',
      slug: 'ai-product-and-leadership-flagship',
      type: 'flagship_program',
      shortDescription: 'A flagship pathway for advanced AI strategy, model evaluation, and productization with mentor guidance.',
      longDescription:
        'This flagship program is designed for ambitious learners and teams who need a stronger bridge from experimentation into production-aware AI thinking.',
      price: 44999,
      salePrice: 38999,
      duration: '16 weeks',
      level: 'advanced',
      format: 'hybrid',
      certificate: true,
      audiences: ['enterprise', 'students', 'phd-professors'],
    },
    {
      domainSlug: 'ai',
      title: 'AI Workforce Readiness Bundle',
      slug: 'ai-workforce-readiness-bundle',
      type: 'package',
      shortDescription: 'A bundled pathway combining core AI learning, workshop depth, and project readiness for workforce preparation.',
      longDescription:
        'This package combines foundational learning, guided practice, and applied outcomes for users who need a more structured AI growth path.',
      price: 52999,
      salePrice: 44999,
      duration: '20 weeks',
      level: 'intermediate',
      format: 'hybrid',
      certificate: true,
      audiences: ['students', 'enterprise', 'university'],
    },
    {
      domainSlug: 'biotechnology',
      title: 'Biotechnology and Bioinformatics Foundations',
      slug: 'biotechnology-and-bioinformatics-foundations',
      type: 'course',
      shortDescription: 'Understand core biotech workflows, data interpretation, and modern bioinformatics fundamentals with applied context.',
      longDescription:
        'This course helps learners connect scientific concepts to practical biotechnology workflows, research readiness, and emerging industry relevance.',
      price: 15999,
      salePrice: 12999,
      duration: '8 weeks',
      level: 'beginner',
      format: 'live_cohort',
      certificate: true,
      audiences: ['students', 'university', 'phd-professors'],
    },
    {
      domainSlug: 'biotechnology',
      title: 'Translational Biotechnology Design Workshop',
      slug: 'biotechnology-translational-design-workshop',
      type: 'workshop',
      shortDescription: 'A hands-on workshop on moving from research concepts into translational biotech problem framing and opportunity mapping.',
      longDescription:
        'The workshop focuses on translational thinking, applied biotech workflows, and the language needed to connect research depth with practical pathways.',
      price: 7499,
      salePrice: 5499,
      duration: '2 days',
      level: 'intermediate',
      format: 'live_cohort',
      certificate: true,
      audiences: ['university', 'enterprise', 'phd-professors'],
    },
    {
      domainSlug: 'biotechnology',
      title: 'Biotech Research Readiness Internship',
      slug: 'biotech-research-readiness-internship',
      type: 'internship',
      shortDescription: 'Develop research-aware biotech capability through mentored project work and scientific workflow exposure.',
      longDescription:
        'This internship experience helps learners understand lab-to-application thinking, documentation rigor, and modern biotechnology workflow expectations.',
      price: 21999,
      salePrice: 18999,
      duration: '10 weeks',
      level: 'intermediate',
      format: 'hybrid',
      certificate: true,
      audiences: ['students', 'phd-professors', 'university'],
    },
    {
      domainSlug: 'biotechnology',
      title: 'Biotechnology Innovation Flagship',
      slug: 'biotechnology-innovation-flagship',
      type: 'flagship_program',
      shortDescription: 'An advanced flagship program connecting biotechnology depth, translational relevance, and guided mentor support.',
      longDescription:
        'The flagship track is designed for serious learners and institutional collaborators who want more depth than a standalone short-format course.',
      price: 46999,
      salePrice: 40999,
      duration: '16 weeks',
      level: 'advanced',
      format: 'hybrid',
      certificate: true,
      audiences: ['university', 'enterprise', 'phd-professors'],
    },
    {
      domainSlug: 'biotechnology',
      title: 'Biotech Career Acceleration Bundle',
      slug: 'biotech-career-acceleration-bundle',
      type: 'package',
      shortDescription: 'A package combining biotech foundations, translational thinking, and mentored career-facing capability building.',
      longDescription:
        'This bundle is structured for learners who need a credible, guided path from scientific interest to stronger research and career readiness.',
      price: 54999,
      salePrice: 46999,
      duration: '20 weeks',
      level: 'intermediate',
      format: 'hybrid',
      certificate: true,
      audiences: ['students', 'university', 'hiring-partners'],
    },
    {
      domainSlug: 'nanotechnology',
      title: 'Nanotechnology Foundations and Applications',
      slug: 'nanotechnology-foundations-and-applications',
      type: 'course',
      shortDescription: 'Learn nanoscale science fundamentals, materials concepts, and applied innovation pathways in a modernized learning format.',
      longDescription:
        'This course helps learners understand nanotechnology through a mix of scientific grounding, applied context, and clearer pathway design.',
      price: 15499,
      salePrice: 12499,
      duration: '8 weeks',
      level: 'beginner',
      format: 'live_cohort',
      certificate: true,
      audiences: ['students', 'university', 'phd-professors'],
    },
    {
      domainSlug: 'nanotechnology',
      title: 'Nano Innovation Systems Workshop',
      slug: 'nano-innovation-systems-workshop',
      type: 'workshop',
      shortDescription: 'A workshop on nanoscale innovation, materials thinking, and translating deep-science ideas into clearer application paths.',
      longDescription:
        'This workshop gives learners a practical way to frame nanotechnology applications, innovation signals, and scientific-commercialization context.',
      price: 7299,
      salePrice: 5199,
      duration: '2 days',
      level: 'intermediate',
      format: 'live_cohort',
      certificate: true,
      audiences: ['students', 'enterprise', 'phd-professors'],
    },
    {
      domainSlug: 'nanotechnology',
      title: 'Nanomaterials Internship Studio',
      slug: 'nanomaterials-internship-studio',
      type: 'internship',
      shortDescription: 'A mentored internship pathway focused on nanomaterials exploration, documentation, and innovation-oriented project work.',
      longDescription:
        'The internship studio helps learners turn deep-science interest into more structured project experience and domain progression.',
      price: 20999,
      salePrice: 17999,
      duration: '10 weeks',
      level: 'intermediate',
      format: 'hybrid',
      certificate: true,
      audiences: ['students', 'phd-professors', 'hiring-partners'],
    },
    {
      domainSlug: 'nanotechnology',
      title: 'Nanotechnology Research and Innovation Flagship',
      slug: 'nanotechnology-research-and-innovation-flagship',
      type: 'flagship_program',
      shortDescription: 'An advanced flagship track for nanotechnology learners who want stronger research depth and innovation framing.',
      longDescription:
        'This flagship pathway combines deep-science grounding, mentor support, and a clearer innovation lens for long-form learning journeys.',
      price: 45999,
      salePrice: 39999,
      duration: '16 weeks',
      level: 'advanced',
      format: 'hybrid',
      certificate: true,
      audiences: ['phd-professors', 'university', 'enterprise'],
    },
    {
      domainSlug: 'nanotechnology',
      title: 'Nano Career and Innovation Bundle',
      slug: 'nano-career-and-innovation-bundle',
      type: 'package',
      shortDescription: 'A structured nanotechnology package that combines foundational learning, mentoring, and application-aware progression.',
      longDescription:
        'The bundle is designed to make nanotechnology pathways feel more coherent, guided, and workforce-aware for long-term learners.',
      price: 53999,
      salePrice: 45999,
      duration: '20 weeks',
      level: 'intermediate',
      format: 'hybrid',
      certificate: true,
      audiences: ['students', 'university', 'enterprise'],
    },
  ]
}

function buildProductRichText(product: SqlSeedProduct) {
  return buildLexicalParagraphs([
    product.longDescription,
    'Learners are expected to move from understanding the domain into clearer workflow judgment, mentor-supported practice, and stronger program outcomes.',
  ])
}

function buildProductCurriculum(product: SqlSeedProduct) {
  return [
    {
      moduleTitle: 'Foundations and framing',
      lessons: [
        { title: `${product.title} orientation`, duration: '45 min' },
        { title: 'Core concepts and terminology', duration: '60 min' },
      ],
    },
    {
      moduleTitle: 'Applied workflows',
      lessons: [
        { title: 'Real-world workflow walkthroughs', duration: '75 min' },
        { title: 'Decision making and applied practice', duration: '90 min' },
      ],
    },
    {
      moduleTitle: 'Outcomes and progression',
      lessons: [
        { title: 'Mentor review and feedback', duration: '60 min' },
        { title: 'Next-step roadmap', duration: '45 min' },
      ],
    },
  ]
}

async function seedProducts(
  payload: Awaited<ReturnType<typeof getPayload>>,
  domainsBySlug: Map<string, DomainDoc>,
  audiencesBySlug: Map<string, AudienceDoc>,
  mentorsBySlug: Map<string, MentorDoc>
) {
  const sqlConnectionString = process.env.DATABASE_URL
  if (!sqlConnectionString) {
    throw new Error('[db:seed:public] DATABASE_URL is not set')
  }

  const productSeeds = buildSeedProducts()
  const sql = new Client({ connectionString: sqlConnectionString })
  await sql.connect()

  try {
    const sqlDomainRows = await sql.query<{ id: string; slug: string; name: string }>(
      `INSERT INTO domains (name, slug, description)
       VALUES
         ('Artificial Intelligence', 'ai', 'Courses, programs, and internships in AI and Machine Learning'),
         ('Biotechnology', 'biotechnology', 'Learn biotechnology, genomics, and life sciences'),
         ('Nanotechnology', 'nanotechnology', 'Explore nanotechnology and materials science')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, slug, name`
    )

    const sqlAudienceRows = await sql.query<{ id: string; slug: string; name: string }>(
      `INSERT INTO audiences (name, slug)
       VALUES
         ('Enterprise', 'enterprise'),
         ('University', 'university'),
         ('Students', 'students'),
         ('PhD & Professors', 'phd-professors'),
         ('Hiring Partners', 'hiring-partners'),
         ('Mentors', 'mentors')
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, slug, name`
    )

    const sqlDomainsBySlug = new Map(sqlDomainRows.rows.map((row) => [row.slug, row]))
    const sqlAudiencesBySlug = new Map(sqlAudienceRows.rows.map((row) => [row.slug, row]))

    const mentorIdsByDomain: Record<string, string[]> = {
      ai: ['dr-aisha-mehra', 'dr-karan-malhotra']
        .map((slug) => mentorsBySlug.get(slug)?.id)
        .filter(Boolean) as string[],
      biotechnology: ['dr-rohan-kapoor', 'dr-isha-banerjee']
        .map((slug) => mentorsBySlug.get(slug)?.id)
        .filter(Boolean) as string[],
      nanotechnology: ['dr-neha-sen', 'dr-vivek-raman']
        .map((slug) => mentorsBySlug.get(slug)?.id)
        .filter(Boolean) as string[],
    }

    const payloadProductsByDomain = new Map<string, string[]>()

    for (const product of productSeeds) {
      const payloadDomain = domainsBySlug.get(product.domainSlug)
      const sqlDomain = sqlDomainsBySlug.get(product.domainSlug)
      if (!payloadDomain || !sqlDomain) continue

      const payloadAudienceIds = product.audiences
        .map((slug) => audiencesBySlug.get(slug)?.id)
        .filter(Boolean) as string[]
      const payloadMentorIds = mentorIdsByDomain[product.domainSlug] ?? []

      const payloadDoc = await upsertByUniqueField<ProductDoc>({
        payload,
        collection: 'products',
        field: 'slug',
        value: product.slug,
        data: {
          title: product.title,
          slug: product.slug,
          domain: payloadDomain.id,
          type: product.type,
          audiences: payloadAudienceIds,
          mentors: payloadMentorIds,
          shortDescription: product.shortDescription,
          longDescription: buildProductRichText(product),
          curriculum: buildProductCurriculum(product),
          learningOutcomes: [
            { outcome: 'Build stronger domain vocabulary and practical workflow literacy.' },
            { outcome: 'Understand how mentors, projects, and product formats fit into progression.' },
            { outcome: 'Translate learning into clearer next-step academic or workforce outcomes.' },
          ],
          prerequisites: [
            { prerequisite: 'A working interest in the domain and willingness to engage in applied learning.' },
            { prerequisite: 'Basic comfort with structured study, mentor feedback, and guided project work.' },
          ],
          faqs: [
            {
              question: 'Who is this product best suited for?',
              answer: buildLexicalParagraphs([
                'This product is designed for users who want more than awareness-level exposure and need clearer capability progression.',
              ]),
            },
            {
              question: 'What will learners leave with?',
              answer: buildLexicalParagraphs([
                'Learners should leave with stronger practical judgment, clearer domain framing, and a more structured next-step path.',
              ]),
            },
          ],
          price: product.price,
          salePrice: product.salePrice ?? undefined,
          duration: product.duration,
          level: product.level ?? undefined,
          format: product.format ?? undefined,
          certificate: Boolean(product.certificate),
          relatedProducts: [],
          seo: {
            title: `${product.title} — NSTC`,
            description: product.shortDescription,
          },
          status: 'published',
        },
      })

      if (!payloadProductsByDomain.has(product.domainSlug)) {
        payloadProductsByDomain.set(product.domainSlug, [])
      }
      payloadProductsByDomain.get(product.domainSlug)!.push(payloadDoc.id)

      const sqlProduct = await sql.query<{ id: string }>(
        `INSERT INTO products (
           domain_id, title, slug, type, short_description, long_description,
           price, sale_price, duration, level, format, certificate, status, updated_at
         )
         VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11, $12, 'published', NOW()
         )
         ON CONFLICT (domain_id, type, slug) DO UPDATE
         SET title = EXCLUDED.title,
             short_description = EXCLUDED.short_description,
             long_description = EXCLUDED.long_description,
             price = EXCLUDED.price,
             sale_price = EXCLUDED.sale_price,
             duration = EXCLUDED.duration,
             level = EXCLUDED.level,
             format = EXCLUDED.format,
             certificate = EXCLUDED.certificate,
             status = EXCLUDED.status,
             updated_at = NOW()
         RETURNING id`,
        [
          sqlDomain.id,
          product.title,
          product.slug,
          product.type,
          product.shortDescription,
          product.longDescription,
          product.price,
          product.salePrice ?? null,
          product.duration ?? null,
          product.level ?? null,
          product.format ?? null,
          Boolean(product.certificate),
        ]
      )

      const sqlProductId = sqlProduct.rows[0]?.id
      if (!sqlProductId) continue

      await sql.query(`DELETE FROM product_audiences WHERE product_id = $1`, [sqlProductId])
      for (const audienceSlug of product.audiences) {
        const sqlAudience = sqlAudiencesBySlug.get(audienceSlug)
        if (!sqlAudience) continue
        await sql.query(
          `INSERT INTO product_audiences (product_id, audience_id)
           VALUES ($1, $2)
           ON CONFLICT (product_id, audience_id) DO NOTHING`,
          [sqlProductId, sqlAudience.id]
        )
      }
    }

    for (const relatedIds of payloadProductsByDomain.values()) {
      for (let index = 0; index < relatedIds.length; index += 1) {
        const current = relatedIds[index]
        const related = relatedIds.filter((id) => id !== current).slice(0, 3)
        await payload.update({
          collection: 'products',
          id: current,
          data: {
            relatedProducts: related,
          },
          depth: 0,
          overrideAccess: true,
        })
      }
    }
  } finally {
    await sql.end()
  }
}

async function linkRelationships(
  payload: Awaited<ReturnType<typeof getPayload>>,
  domainsBySlug: Map<string, DomainDoc>,
  audiencesBySlug: Map<string, AudienceDoc>,
  partnerIds: string[],
  testimonialIds: string[]
) {
  const productsResult = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'published' },
    },
    depth: 2,
    limit: 100,
    pagination: false,
    overrideAccess: true,
  })
  const products = productsResult.docs as ProductDoc[]

  const productsByDomain = new Map<string, string[]>()
  const productsByAudience = new Map<string, string[]>()
  const productsByAudienceAndDomain = new Map<string, Map<string, string[]>>()
  for (const product of products) {
    const domainId = getRelationshipId(product.domain)
    if (!domainId) continue
    if (!productsByDomain.has(domainId)) productsByDomain.set(domainId, [])
    productsByDomain.get(domainId)!.push(product.id)

    for (const audience of product.audiences ?? []) {
      const audienceId = getRelationshipId(audience)
      if (!audienceId) continue

      if (!productsByAudience.has(audienceId)) productsByAudience.set(audienceId, [])
      productsByAudience.get(audienceId)!.push(product.id)

      if (!productsByAudienceAndDomain.has(audienceId)) {
        productsByAudienceAndDomain.set(audienceId, new Map<string, string[]>())
      }

      const byDomain = productsByAudienceAndDomain.get(audienceId)!
      if (!byDomain.has(domainId)) byDomain.set(domainId, [])
      byDomain.get(domainId)!.push(product.id)
    }
  }

  const allAudienceIds = Array.from(audiencesBySlug.values()).map((audience) => audience.id)

  for (const [slug, domain] of domainsBySlug.entries()) {
    await payload.update({
      collection: 'domains',
      id: domain.id,
      data: {
        featuredProducts: (productsByDomain.get(domain.id) ?? []).slice(0, 6),
        audienceLinks: allAudienceIds,
        partnerReferences: partnerIds,
        testimonialReferences: testimonialIds,
        status: 'published',
      },
      depth: 0,
      overrideAccess: true,
    })

    if (slug === 'ai' || slug === 'biotechnology' || slug === 'nanotechnology') {
      const mentors = await payload.find({
        collection: 'mentors',
        depth: 0,
        limit: 10,
        pagination: false,
        where: {
          domains: {
            contains: domain.id,
          },
        },
        overrideAccess: true,
      })

      await payload.update({
        collection: 'domains',
        id: domain.id,
        data: {
          featuredMentors: mentors.docs.map((doc) => doc.id).slice(0, 4),
        },
        depth: 0,
        overrideAccess: true,
      })
    }
  }

  const mentorResult = await payload.find({
    collection: 'mentors',
    depth: 0,
    limit: 20,
    pagination: false,
    overrideAccess: true,
  })
  const mentorDocs = mentorResult.docs as MentorDoc[]
  const mentorIdsByDomain = new Map<string, string[]>()

  for (const mentor of mentorDocs) {
    for (const domain of mentor.domains ?? []) {
      const domainId = getRelationshipId(domain)
      if (!domainId) continue
      if (!mentorIdsByDomain.has(domainId)) mentorIdsByDomain.set(domainId, [])
      mentorIdsByDomain.get(domainId)!.push(mentor.id)
    }
  }

  for (const [, audience] of audiencesBySlug.entries()) {
    const featuredProducts = (productsByAudience.get(audience.id) ?? []).slice(0, 4)
    const audienceDomains = Array.from((productsByAudienceAndDomain.get(audience.id) ?? new Map()).keys())
    const featuredMentors = Array.from(
      new Set(audienceDomains.flatMap((domainId) => mentorIdsByDomain.get(domainId) ?? []))
    ).slice(0, 3)
    const domainOverrides = audienceDomains.map((domainId) => ({
      domain: domainId,
      featuredProducts: (productsByAudienceAndDomain.get(audience.id)?.get(domainId) ?? []).slice(0, 3),
      featuredMentors: (mentorIdsByDomain.get(domainId) ?? []).slice(0, 3),
    }))

    await payload.update({
      collection: 'audiences',
      id: audience.id,
      data: {
        featuredProducts,
        featuredMentors,
        domainOverrides,
        status: 'published',
      },
      depth: 0,
      overrideAccess: true,
    })
  }
}

async function main() {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  console.log('[db:seed:public] Seeding public CMS content...')

  const domainsBySlug = await seedDomains(payload)
  const audiencesBySlug = await seedAudienceDocs(payload)
  const mentorsBySlug = await seedMentors(payload, domainsBySlug)
  const partnerIds = await seedPartners(payload)
  const testimonialIds = await seedTestimonials(payload, domainsBySlug)
  await seedProducts(payload, domainsBySlug, audiencesBySlug, mentorsBySlug)
  await seedLegalDocuments(payload)
  await seedPages(payload, audiencesBySlug)
  await linkRelationships(payload, domainsBySlug, audiencesBySlug, partnerIds, testimonialIds)

  console.log('[db:seed:public] Public CMS content seeded successfully.')
}

main().catch((error) => {
  console.error('[db:seed:public] Failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
