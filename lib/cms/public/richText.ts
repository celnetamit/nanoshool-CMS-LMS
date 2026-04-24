export function extractPlainText(value: unknown): string {
  const chunks: string[] = []

  const visit = (node: unknown) => {
    if (!node) return

    if (typeof node === 'string') {
      const text = node.trim()
      if (text) chunks.push(text)
      return
    }

    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }

    if (typeof node === 'object') {
      const record = node as Record<string, unknown>

      if (typeof record.text === 'string') {
        const text = record.text.trim()
        if (text) chunks.push(text)
      }

      if (record.children) visit(record.children)
      if (record.root) visit(record.root)
      if (record.content) visit(record.content)
    }
  }

  visit(value)
  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

export function extractTextBlocks(value: unknown): string[] {
  const blocks: string[] = []

  const readInlineText = (node: unknown): string => {
    if (!node) return ''
    if (typeof node === 'string') return node.trim()
    if (Array.isArray(node)) {
      return node.map(readInlineText).filter(Boolean).join(' ').trim()
    }
    if (typeof node === 'object') {
      const record = node as Record<string, unknown>
      const parts: string[] = []

      if (typeof record.text === 'string' && record.text.trim()) {
        parts.push(record.text.trim())
      }
      if (record.children) {
        const childText = readInlineText(record.children)
        if (childText) parts.push(childText)
      }

      return parts.join(' ').replace(/\s+/g, ' ').trim()
    }

    return ''
  }

  const root =
    typeof value === 'object' && value !== null && 'root' in (value as Record<string, unknown>)
      ? (value as { root?: { children?: unknown[] } }).root
      : null

  const children = root?.children ?? []
  for (const child of children) {
    const text = readInlineText(child)
    if (text) blocks.push(text)
  }

  return blocks
}
