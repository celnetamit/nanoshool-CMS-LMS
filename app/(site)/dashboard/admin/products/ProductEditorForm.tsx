'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProductFormat, ProductLevel, ProductStatus, ProductType } from '@/types'

type DomainOption = { id: string; name: string; slug: string }

type ProductEditorValue = {
  domainId: string
  title: string
  slug: string
  type: ProductType
  shortDescription: string
  longDescription: string
  price: string
  salePrice: string
  duration: string
  level: ProductLevel | ''
  format: ProductFormat | ''
  certificate: boolean
  moodleCourseId: string
  status: ProductStatus
}

type Props = {
  mode: 'create' | 'edit'
  productId?: string
  domains: DomainOption[]
  initialValue: ProductEditorValue
}

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'course', label: 'Course' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'internship', label: 'Internship' },
  { value: 'flagship_program', label: 'Flagship Program' },
  { value: 'package', label: 'Package' },
]

const PRODUCT_LEVELS: { value: ProductLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const PRODUCT_FORMATS: { value: ProductFormat; label: string }[] = [
  { value: 'self_paced', label: 'Self Paced' },
  { value: 'live_cohort', label: 'Live Cohort' },
  { value: 'hybrid', label: 'Hybrid' },
]

const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ProductEditorForm({ mode, productId, domains, initialValue }: Props) {
  const router = useRouter()
  const [value, setValue] = useState<ProductEditorValue>(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canDelete = mode === 'edit' && Boolean(productId)
  const submitLabel = mode === 'create' ? 'Create Product' : 'Save Changes'

  const selectedDomain = useMemo(
    () => domains.find((item) => item.id === value.domainId),
    [domains, value.domainId]
  )

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const body = {
      domainId: value.domainId,
      title: value.title.trim(),
      slug: value.slug.trim(),
      type: value.type,
      shortDescription: value.shortDescription.trim(),
      longDescription: value.longDescription.trim(),
      price: value.price,
      salePrice: value.salePrice,
      duration: value.duration.trim(),
      level: value.level || undefined,
      format: value.format || undefined,
      certificate: value.certificate,
      moodleCourseId: value.moodleCourseId.trim(),
      status: value.status,
    }

    const endpoint = mode === 'create'
      ? '/api/admin/products'
      : `/api/admin/products/${productId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || 'Failed to save product')
        return
      }

      router.push('/dashboard/admin/products')
      router.refresh()
    } catch {
      setError('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!productId) return
    const confirmed = window.confirm('Delete this product? This action cannot be undone.')
    if (!confirmed) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error || 'Failed to delete product')
        return
      }
      router.push('/dashboard/admin/products')
      router.refresh()
    } catch {
      setError('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ marginTop: '1.25rem', padding: '1.25rem', display: 'grid', gap: '1rem' }}>
      {error && (
        <div className="badge badge-error" style={{ width: 'fit-content', textTransform: 'none', letterSpacing: 0 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label className="form-group">
          <span className="label">Domain</span>
          <select
            className="select"
            value={value.domainId}
            onChange={(event) => setValue((prev) => ({ ...prev, domainId: event.target.value }))}
            required
          >
            <option value="" disabled>Select domain</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </select>
        </label>

        <label className="form-group">
          <span className="label">Type</span>
          <select
            className="select"
            value={value.type}
            onChange={(event) => setValue((prev) => ({ ...prev, type: event.target.value as ProductType }))}
          >
            {PRODUCT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="form-group">
          <span className="label">Status</span>
          <select
            className="select"
            value={value.status}
            onChange={(event) => setValue((prev) => ({ ...prev, status: event.target.value as ProductStatus }))}
          >
            {PRODUCT_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="form-group">
        <span className="label">Title</span>
        <input
          className="input"
          value={value.title}
          onChange={(event) => setValue((prev) => ({ ...prev, title: event.target.value }))}
          required
          minLength={3}
          maxLength={180}
        />
      </label>

      <label className="form-group">
        <span className="label">Slug</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input"
            value={value.slug}
            onChange={(event) => setValue((prev) => ({ ...prev, slug: toSlug(event.target.value) }))}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            required
          />
          <button
            type="button"
            className="btn btn-secondary btn--sm"
            onClick={() => setValue((prev) => ({ ...prev, slug: toSlug(prev.title || prev.slug) }))}
          >
            Generate
          </button>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
          URL preview: /{selectedDomain?.slug ?? 'domain'}/{value.type.replace('_', '-')}/{value.slug || 'product-slug'}
        </span>
      </label>

      <label className="form-group">
        <span className="label">Short Description</span>
        <textarea
          className="textarea"
          rows={3}
          value={value.shortDescription}
          onChange={(event) => setValue((prev) => ({ ...prev, shortDescription: event.target.value }))}
          maxLength={300}
        />
      </label>

      <label className="form-group">
        <span className="label">Long Description</span>
        <textarea
          className="textarea"
          rows={8}
          value={value.longDescription}
          onChange={(event) => setValue((prev) => ({ ...prev, longDescription: event.target.value }))}
        />
      </label>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <label className="form-group">
          <span className="label">Price (INR)</span>
          <input
            className="input"
            type="number"
            step="0.01"
            min={0}
            value={value.price}
            onChange={(event) => setValue((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
        </label>

        <label className="form-group">
          <span className="label">Sale Price (INR)</span>
          <input
            className="input"
            type="number"
            step="0.01"
            min={0}
            value={value.salePrice}
            onChange={(event) => setValue((prev) => ({ ...prev, salePrice: event.target.value }))}
          />
        </label>

        <label className="form-group">
          <span className="label">Duration</span>
          <input
            className="input"
            value={value.duration}
            onChange={(event) => setValue((prev) => ({ ...prev, duration: event.target.value }))}
          />
        </label>

        <label className="form-group">
          <span className="label">Level</span>
          <select
            className="select"
            value={value.level}
            onChange={(event) => setValue((prev) => ({ ...prev, level: event.target.value as ProductLevel | '' }))}
          >
            <option value="">Not set</option>
            {PRODUCT_LEVELS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="form-group">
          <span className="label">Format</span>
          <select
            className="select"
            value={value.format}
            onChange={(event) => setValue((prev) => ({ ...prev, format: event.target.value as ProductFormat | '' }))}
          >
            <option value="">Not set</option>
            {PRODUCT_FORMATS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="form-group">
          <span className="label">Moodle Course ID</span>
          <input
            className="input"
            value={value.moodleCourseId}
            onChange={(event) => setValue((prev) => ({ ...prev, moodleCourseId: event.target.value }))}
          />
        </label>
      </div>

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
        <input
          type="checkbox"
          checked={value.certificate}
          onChange={(event) => setValue((prev) => ({ ...prev, certificate: event.target.checked }))}
        />
        Includes certificate
      </label>

      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-primary" disabled={saving || deleting}>
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.push('/dashboard/admin/products')}>
          Cancel
        </button>
        {canDelete && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onDelete}
            disabled={saving || deleting}
            style={{ color: 'var(--color-error)' }}
          >
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        )}
      </div>
    </form>
  )
}
