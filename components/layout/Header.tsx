'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import styles from './Header.module.css'

const DOMAINS = [
  { label: 'Artificial Intelligence', slug: 'ai', color: '#6366f1' },
  { label: 'Biotechnology', slug: 'biotechnology', color: '#22c55e' },
  { label: 'Nanotechnology', slug: 'nanotechnology', color: '#22d3ee' },
]

const AUDIENCES = [
  { label: 'Enterprise', slug: 'enterprise' },
  { label: 'University', slug: 'university' },
  { label: 'Students', slug: 'students' },
  { label: 'PhD & Professors', slug: 'phd-professors' },
  { label: 'Hiring Partners', slug: 'hiring-partners' },
]

type AuthUser = {
  role: 'admin' | 'mentor' | 'participant' | 'program_manager'
}

const DASHBOARD_BY_ROLE: Record<AuthUser['role'], string> = {
  admin: '/dashboard/admin',
  mentor: '/dashboard/mentor',
  participant: '/dashboard/participant',
  program_manager: '/dashboard/program-manager',
}

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [domainMenuOpen, setDomainMenuOpen] = useState(false)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) {
          if (active) setAuthUser(null)
          return
        }
        const data = await response.json() as { role?: AuthUser['role'] }
        if (active && data?.role && data.role in DASHBOARD_BY_ROLE) {
          setAuthUser({ role: data.role })
        }
      } catch {
        if (active) setAuthUser(null)
      }
    }

    loadSession()
    return () => {
      active = false
    }
  }, [])

  const dashboardHref = authUser ? DASHBOARD_BY_ROLE[authUser.role] : '/dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>N</span>
            <span className={styles.logoText}>NSTC</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav} aria-label="Main navigation">
            {/* Domains dropdown */}
            <div
              className={styles.dropdown}
              onMouseEnter={() => setDomainMenuOpen(true)}
              onMouseLeave={() => setDomainMenuOpen(false)}
            >
              <button className={styles.navBtn} aria-expanded={domainMenuOpen}>
                Domains
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {domainMenuOpen && (
                <div className={styles.dropdownMenu}>
                  {DOMAINS.map((d) => (
                    <Link key={d.slug} href={`/${d.slug}`} className={styles.dropdownItem}>
                      <span className={styles.domainDot} style={{ background: d.color }} />
                      {d.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/mentors" className={`${styles.navLink} ${pathname === '/mentors' ? styles.active : ''}`}>
              Mentors
            </Link>
            <Link href="/partners" className={`${styles.navLink} ${pathname === '/partners' ? styles.active : ''}`}>
              Partners
            </Link>
            <Link href="/join-us" className={`${styles.navLink} ${pathname === '/join-us' ? styles.active : ''}`}>
              Join Us
            </Link>
            <Link href="/search" className={styles.searchBtn} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>
          </nav>

          {/* CTA */}
          <div className={styles.cta}>
            {authUser ? (
              <>
                <Link href={dashboardHref} className="btn btn-ghost btn--sm">Dashboard</Link>
                <a href="/api/auth/signout" className="btn btn-secondary btn--sm">Sign out</a>
              </>
            ) : (
              <Link href="/login" className="btn btn-ghost btn--sm">Log in</Link>
            )}
            <Link href="/ai" className="btn btn-primary btn--sm">Get Started</Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileSection}>
            <p className={styles.mobileSectionLabel}>Domains</p>
            {DOMAINS.map((d) => (
              <Link key={d.slug} href={`/${d.slug}`} className={styles.mobileLink}>
                <span className={styles.domainDot} style={{ background: d.color }} />
                {d.label}
              </Link>
            ))}
          </div>
          <div className={styles.mobileSection}>
            <p className={styles.mobileSectionLabel}>For</p>
            {AUDIENCES.map((a) => (
              <Link key={a.slug} href={`/${a.slug}`} className={styles.mobileLink}>
                {a.label}
              </Link>
            ))}
          </div>
          <div className={styles.mobileSection}>
            <Link href="/mentors" className={styles.mobileLink}>Mentors</Link>
            <Link href="/partners" className={styles.mobileLink}>Partners</Link>
            <Link href="/join-us" className={styles.mobileLink}>Join Us</Link>
          </div>
          <div className={styles.mobileCta}>
            {authUser ? (
              <>
                <Link href={dashboardHref} className="btn btn-secondary" style={{ width: '100%' }}>Dashboard</Link>
                <a href="/api/auth/signout" className="btn btn-ghost" style={{ width: '100%', textAlign: 'center', color: 'var(--color-error)' }}>Sign out</a>
              </>
            ) : (
              <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }}>Log in</Link>
            )}
            <Link href="/ai" className="btn btn-primary" style={{ width: '100%' }}>Get Started →</Link>
          </div>
        </div>
      )}
    </>
  )
}
