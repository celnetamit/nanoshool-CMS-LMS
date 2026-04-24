import { getPayload } from 'payload'

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
      partnerType: 'university',
      shortDescription: 'Academic and research-aligned collaboration pathways for advanced technology learning.',
      featured: true,
      displayOrder: 1,
      status: 'published',
    },
    {
      slug: 'industry-ai-collaboration-network',
      name: 'AI Industry Collaboration Network',
      partnerType: 'corporate',
      shortDescription: 'Industry-facing collaboration model for future-ready AI learning pathways.',
      featured: true,
      displayOrder: 2,
      status: 'published',
    },
    {
      slug: 'biotech-research-partner-network',
      name: 'Biotech Research Partner Network',
      partnerType: 'research_lab',
      shortDescription: 'Research-aware collaboration support for biotechnology programs and scientific capability building.',
      featured: true,
      displayOrder: 3,
      status: 'published',
    },
    {
      slug: 'nano-innovation-ecosystem',
      name: 'Nano Innovation Ecosystem',
      partnerType: 'ecosystem_partner',
      shortDescription: 'Innovation-oriented support for nanotechnology pathways and domain partnerships.',
      featured: true,
      displayOrder: 4,
      status: 'published',
    },
    {
      slug: 'future-skills-enterprise-forum',
      name: 'Future Skills Enterprise Forum',
      partnerType: 'corporate',
      shortDescription: 'Enterprise collaboration support for role-based upskilling and workforce-readiness programs.',
      featured: true,
      displayOrder: 5,
      status: 'published',
    },
    {
      slug: 'advanced-science-university-consortium',
      name: 'Advanced Science University Consortium',
      partnerType: 'university',
      shortDescription: 'Institutional collaboration model for curriculum enrichment, mentor access, and research-aware pathways.',
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
        'This document explains the core payment expectations for NSTC products and services.',
        'Payment completion, enrollment confirmation, and invoice generation are handled through the platform workflow.',
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
        'This document outlines the high-level cancellation expectations for platform-linked programs and services.',
        'Specific operational conditions may differ by product type, schedule, and institutional context.',
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
        'This document explains the high-level refund policy framework for NSTC products and platform interactions.',
        'Refund eligibility may depend on product category, program schedule, and service state.',
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
        'This privacy policy describes how NSTC handles platform-related user information and operational data.',
        'It should be reviewed and finalized with the exact production compliance language before go-live.',
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
        'This consent policy explains high-level consent expectations across platform usage, program participation, and operational workflows.',
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
        'Institutional and industry partners collaborating with NSTC programs and learning pathways.',
      content: buildLexicalParagraphs([
        'The partners page should communicate institutional and industry credibility with a cleaner platform structure.',
      ]),
      status: 'published',
      seo: {
        title: 'Partners — NSTC',
        description: 'Explore institutional and industry partners collaborating with NSTC.',
      },
    },
    {
      slug: 'legal-index',
      path: '/legal',
      pageType: 'generic',
      title: 'Legal',
      excerpt:
        'Review legal policies, terms, and platform-related compliance documents.',
      content: buildLexicalParagraphs([
        'The legal index should make policies easy to discover and review.',
      ]),
      status: 'published',
      seo: {
        title: 'Legal — NSTC',
        description: 'Review all legal policies, terms, and compliance documents.',
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
  for (const product of products) {
    const domainId = getRelationshipId(product.domain)
    if (!domainId) continue
    if (!productsByDomain.has(domainId)) productsByDomain.set(domainId, [])
    productsByDomain.get(domainId)!.push(product.id)
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

  const audienceProductMap: Record<string, string[]> = {
    enterprise: products.slice(0, 3).map((product) => product.id),
    university: products.slice(0, 3).map((product) => product.id),
    students: products.slice(0, 4).map((product) => product.id),
    'phd-professors': products.slice(0, 3).map((product) => product.id),
    'hiring-partners': products.slice(0, 3).map((product) => product.id),
    mentors: products.slice(0, 2).map((product) => product.id),
  }

  const mentorResult = await payload.find({
    collection: 'mentors',
    depth: 0,
    limit: 20,
    pagination: false,
    overrideAccess: true,
  })
  const mentorIds = mentorResult.docs.map((doc) => doc.id)

  for (const [slug, audience] of audiencesBySlug.entries()) {
    const featuredProducts = audienceProductMap[slug] ?? []
    await payload.update({
      collection: 'audiences',
      id: audience.id,
      data: {
        featuredProducts,
        featuredMentors: mentorIds.slice(0, 3),
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
  await seedMentors(payload, domainsBySlug)
  const partnerIds = await seedPartners(payload)
  const testimonialIds = await seedTestimonials(payload, domainsBySlug)
  await seedLegalDocuments(payload)
  await seedPages(payload, audiencesBySlug)
  await linkRelationships(payload, domainsBySlug, audiencesBySlug, partnerIds, testimonialIds)

  console.log('[db:seed:public] Public CMS content seeded successfully.')
}

main().catch((error) => {
  console.error('[db:seed:public] Failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
