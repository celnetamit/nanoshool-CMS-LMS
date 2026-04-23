import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export const metadata: Metadata = { title: 'Mentor Programs — NSTC' }

export default async function MentorProgramsPage() {
  const session = await auth()
  if (!session?.user) return null

  let programs: {
    id: string
    title: string
    slug: string
    type: string
    domain_name: string
    domain_slug: string
    total_enrollments: string
    active_enrollments: string
    completed_enrollments: string
  }[] = []

  try {
    programs = await query(
      `SELECT p.id, p.title, p.slug, p.type, d.name AS domain_name, d.slug AS domain_slug,
              COUNT(e.id) AS total_enrollments,
              COUNT(CASE WHEN e.access_status = 'active' THEN 1 END) AS active_enrollments,
              COUNT(CASE WHEN e.access_status = 'completed' THEN 1 END) AS completed_enrollments
       FROM products p
       JOIN domains d ON d.id = p.domain_id
       LEFT JOIN product_mentors pm ON pm.product_id = p.id
       LEFT JOIN users u ON u.id = pm.user_id
       LEFT JOIN enrollments e ON e.product_id = p.id
       WHERE (u.email = $1 OR $2 = 'admin') AND p.status = 'published'
       GROUP BY p.id, d.name, d.slug
       ORDER BY active_enrollments DESC, total_enrollments DESC`,
      [session.user.email, session.user.role]
    ) as unknown as typeof programs
  } catch {
    programs = []
  }

  return (
    <div>
      <h1>My Programs</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
        Track assigned programs, active cohorts, and completion progress.
      </p>
      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        {programs.length === 0 ? (
          <div className="card" style={{ padding: '1.25rem' }}>
            No published programs are assigned to this mentor yet.
          </div>
        ) : (
          programs.map((program) => (
            <div key={program.id} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{program.title}</h3>
                  <p style={{ marginTop: '0.4rem', color: 'var(--color-text-muted)' }}>
                    {program.domain_name} · {program.type.replace('_', ' ')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link href={`/${program.domain_slug}/${program.type.replace('_', '-')}/${program.slug}`} className="btn btn-secondary btn--sm" target="_blank">
                    View Program
                  </Link>
                  <Link href="/dashboard/mentor/students" className="btn btn-primary btn--sm">
                    View Students
                  </Link>
                </div>
              </div>
              <div style={{ marginTop: '0.9rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--color-text-muted)' }}>
                <span>📚 Total: {program.total_enrollments}</span>
                <span>▶ Active: {program.active_enrollments}</span>
                <span>🏁 Completed: {program.completed_enrollments}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
