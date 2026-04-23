import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Student Programs — NSTC',
  description: 'Career-oriented programs and internships for students across emerging domains.',
}

export default function StudentsPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>Student Programs</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: 760 }}>
        Build practical skills through courses, workshops, internships, and flagship programs designed for students.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href="/ai/students" className="btn btn-primary">AI for Students</Link>
        <Link href="/biotechnology/students" className="btn btn-secondary">Biotech for Students</Link>
        <Link href="/nanotechnology/students" className="btn btn-secondary">Nanotech for Students</Link>
      </div>
    </div>
  )
}

