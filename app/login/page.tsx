'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Signup failed. Please try again.')
      setLoading(false)
      return
    }
    // Auto-login after signup
    await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    router.push('/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>N</span>
          <span className={styles.logoText}>NSTC</span>
        </Link>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`} onClick={() => { setTab('login'); setError('') }}>
            Log In
          </button>
          <button className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`} onClick={() => { setTab('signup'); setError('') }}>
            Sign Up
          </button>
        </div>

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email</label>
              <input id="login-email" name="email" type="email" className="input" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <input id="login-password" name="password" type="password" className="input" placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className={styles.form}>
            <div className="form-group">
              <label className="label" htmlFor="signup-name">Full Name</label>
              <input id="signup-name" name="name" type="text" className="input" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="signup-email">Email</label>
              <input id="signup-email" name="email" type="email" className="input" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="signup-password">Password</label>
              <input id="signup-password" name="password" type="password" className="input" placeholder="Min 8 characters" required minLength={8} />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        )}

        <p className={styles.legal}>
          By continuing, you agree to our{' '}
          <Link href="/legal/privacy-policy">Privacy Policy</Link> and{' '}
          <Link href="/legal/consent-policy">Terms of Use</Link>.
        </p>
      </div>
    </div>
  )
}
