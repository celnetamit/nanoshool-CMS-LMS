import Link from 'next/link'
import styles from './Footer.module.css'

const DOMAIN_LINKS = [
  { label: 'Artificial Intelligence', href: '/ai' },
  { label: 'AI Courses', href: '/ai/courses' },
  { label: 'AI Internships', href: '/ai/internships' },
  { label: 'Biotechnology', href: '/biotechnology' },
  { label: 'Nanotechnology', href: '/nanotechnology' },
]

const COMPANY_LINKS = [
  { label: 'About Us', href: '/' },
  { label: 'Mentors', href: '/mentors' },
  { label: 'Partners', href: '/partners' },
  { label: 'Join Us', href: '/join-us' },
  { label: 'Legal', href: '/legal' },
]

const AUDIENCE_LINKS = [
  { label: 'For Enterprise', href: '/enterprise' },
  { label: 'For Universities', href: '/university' },
  { label: 'For Students', href: '/students' },
  { label: 'PhD & Professors', href: '/phd-professors' },
  { label: 'Hiring Partners', href: '/hiring-partners' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/legal/privacy-policy' },
  { label: 'Refund Policy', href: '/legal/refund-policy' },
  { label: 'Cancellation Policy', href: '/legal/cancellation-policy' },
  { label: 'Payment Policy', href: '/legal/payment-policy' },
  { label: 'Consent Policy', href: '/legal/consent-policy' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      {/* CTA Banner */}
      <div className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2 className={styles.ctaTitle}>Ready to advance your career?</h2>
              <p className={styles.ctaSubtitle}>Join 10,000+ learners across AI, Biotechnology & Nanotechnology</p>
            </div>
            <div className={styles.ctaButtons}>
              <Link href="/ai" className="btn btn-primary btn--lg">Explore Programs</Link>
              <Link href="/enterprise" className="btn btn-secondary btn--lg">For Enterprise</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brand}>
              <Link href="/" className={styles.logo}>
                <span className={styles.logoMark}>N</span>
                <span className={styles.logoText}>NSTC</span>
              </Link>
              <p className={styles.tagline}>
                Accelerate your career with industry-led programs in emerging science & technology.
              </p>
              <div className={styles.socials}>
                <a href="mailto:support@nanostc.org" className={styles.footerLink}>support@nanostc.org</a>
                <Link href="/partners" className={styles.footerLink}>Partnership enquiries</Link>
                <Link href="/join-us" className={styles.footerLink}>Mentor and team applications</Link>
              </div>
            </div>

            {/* Links */}
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Domains</h4>
              {DOMAIN_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={styles.footerLink}>{l.label}</Link>
              ))}
            </div>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>For</h4>
              {AUDIENCE_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={styles.footerLink}>{l.label}</Link>
              ))}
            </div>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Company</h4>
              {COMPANY_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={styles.footerLink}>{l.label}</Link>
              ))}
            </div>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Legal</h4>
              {LEGAL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={styles.footerLink}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div className={styles.bottom}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} NSTC. All rights reserved.
            </p>
            <p className={styles.location}>
              🇮🇳 Made in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
