import type { Metadata } from 'next'
import Link from 'next/link'
import { buildSeoMetadata } from '@/lib/cms/public/getSeoMetadata'
import styles from './join-us.module.css'

export const metadata: Metadata = buildSeoMetadata({
  fallbackTitle: 'Join Us',
  fallbackDescription: 'Join NSTC as a mentor, partner, academic collaborator, or core team contributor.',
  canonicalPath: '/join-us',
})

export default function JoinUsPage() {
  const collaborationSignals = [
    'Mentor-led programs',
    'University and research collaborations',
    'Platform and growth execution',
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.hero}>
          <span className={`badge badge-primary ${styles.eyebrow}`}>Collaborate with NSTC</span>
          <h1 className={styles.title}>Build the next generation of applied science learning with us.</h1>
          <p className={styles.subtitle}>
            We work with mentors, universities, research communities, and operating teams who want to turn deep-domain knowledge into credible learner outcomes.
          </p>
          <div className={styles.signalRow}>
            {collaborationSignals.map((signal) => (
              <span key={signal} className={`badge badge-neutral ${styles.signalBadge}`}>{signal}</span>
            ))}
          </div>
          <div className={styles.actions}>
            <a href="mailto:support@nanostc.org?subject=NSTC%20Collaboration" className="btn btn-primary btn--lg">
              Start a Conversation
            </a>
            <Link href="/partners" className="btn btn-secondary btn--lg">
              View Partnership Surface
            </Link>
          </div>
        </section>

        <section className={styles.grid}>
          <article className={`card ${styles.card}`}>
            <h2>Mentors and domain experts</h2>
            <p>
              Join mentor-led pathways across AI, Biotechnology, and Nanotechnology to support applied projects, workshops, internships, and flagship programs.
            </p>
          </article>
          <article className={`card ${styles.card}`}>
            <h2>Academic and research collaborators</h2>
            <p>
              Work with us on curriculum enrichment, cohort design, research-aware programming, and institution-facing capability-building initiatives.
            </p>
          </article>
          <article className={`card ${styles.card}`}>
            <h2>Program and growth contributors</h2>
            <p>
              Help shape learner journeys, partnership operations, public positioning, and execution across the platform as the public experience scales.
            </p>
          </article>
        </section>

        <section className={`card ${styles.noteCard}`}>
          <h2>What to include when you reach out</h2>
          <p>
            The fastest way to start is to share your role, domain area, organization context, and the kind of contribution or collaboration model you have in mind. That helps us route you into the right next conversation quickly.
          </p>
        </section>

        <section className={`card ${styles.process}`}>
          <div>
            <h2>How collaboration starts</h2>
            <p>
              Share your expertise area, organization context, and the kind of contribution you want to make. We use that to route the conversation into mentor onboarding, institutional collaboration, or platform team follow-up.
            </p>
          </div>
          <div className={styles.processActions}>
            <Link href="/mentors" className="btn btn-ghost">Meet Existing Mentors</Link>
            <Link href="/enterprise" className="btn btn-ghost">Explore Enterprise Programs</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
