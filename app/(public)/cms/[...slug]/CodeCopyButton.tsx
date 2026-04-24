'use client'

import { useState } from 'react'
import styles from './cms-page.module.css'

type Props = {
  code: string
}

export function CodeCopyButton({ code }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Copy code block">
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
