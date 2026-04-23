'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './search.module.css'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ hits: { id: string; title: string; type: string; domain: string; price: number; shortDescription?: string }[] } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (q: string) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
    } catch { setResults({ hits: [] }) }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      {/* Search Header */}
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Search Programs</h1>
          <p className={styles.subtitle}>Find courses, workshops, internships, and programs across all domains.</p>
          <div className={styles.searchBar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search for AI courses, biotech internships, nanotech programs..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); handleSearch(e.target.value) }}
              autoFocus
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => { setQuery(''); setResults(null) }}>✕</button>
            )}
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            {['All', 'AI', 'Biotechnology', 'Nanotechnology'].map((f) => (
              <button key={f} className={`${styles.filterChip} ${f === 'All' ? styles.filterChipActive : ''}`}>
                {f}
              </button>
            ))}
            <div className={styles.divider} />
            {['Courses', 'Workshops', 'Internships', 'Flagship Programs'].map((t) => (
              <button key={t} className={styles.filterChip}>{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {loading && (
          <div className={styles.loadingGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`skeleton ${styles.skeletonCard}`} />
            ))}
          </div>
        )}

        {!loading && results && results.hits.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔍</span>
            <h2>No results for "{query}"</h2>
            <p>Try different keywords or browse by domain below.</p>
            <div className={styles.emptyLinks}>
              {['ai', 'biotechnology', 'nanotechnology'].map((d) => (
                <Link key={d} href={`/${d}`} className="btn btn-secondary">
                  Browse {d.charAt(0).toUpperCase() + d.slice(1)} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && results && results.hits.length > 0 && (
          <>
            <p className={styles.resultCount}>{results.hits.length} result{results.hits.length !== 1 ? 's' : ''} for "{query}"</p>
            <div className={styles.resultsGrid}>
              {results.hits.map((hit) => (
                <Link key={hit.id} href={`/${hit.domain}/${hit.type}/${hit.id}`} className={`card card--hover ${styles.resultCard}`}>
                  <div className={styles.resultType}>{hit.type?.replace('_', ' ')}</div>
                  <h3 className={styles.resultTitle}>{hit.title}</h3>
                  {hit.shortDescription && <p className={styles.resultDesc}>{hit.shortDescription}</p>}
                  <div className={styles.resultFooter}>
                    <span className={styles.resultDomain}>{hit.domain}</span>
                    <span className={styles.resultPrice}>
                      {hit.price === 0 ? 'Free' : `₹${Number(hit.price).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {!loading && !results && (
          <div className={styles.emptyState}>
            <div className={styles.suggestTitle}>Browse popular categories</div>
            <div className={styles.suggests}>
              {['AI Courses', 'ML Internship', 'Biotech Workshop', 'Nanotech Program', 'Data Science', 'Genomics'].map((s) => (
                <button key={s} className={styles.suggestChip} onClick={() => { setQuery(s); handleSearch(s) }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
