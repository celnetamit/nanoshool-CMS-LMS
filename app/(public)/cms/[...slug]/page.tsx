import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import styles from './cms-page.module.css'
import { CodeCopyButton } from './CodeCopyButton'

type Props = { params: Promise<{ slug: string[] }> }

type PayloadPage = {
  title?: string | null
  path?: string | null
  excerpt?: string | null
  content?: unknown
  updatedAt?: string | null
  publishedAt?: string | null
  seo?: {
    title?: string | null
    description?: string | null
  } | null
}

type LexicalNode = {
  type?: string
  tag?: string
  language?: string
  headerState?: number
  format?: number
  text?: string
  url?: string
  rel?: string
  target?: string
  newTab?: boolean
  listType?: string
  value?: {
    url?: string
    alt?: string
    filename?: string
  } | null
  children?: LexicalNode[]
  root?: {
    children?: LexicalNode[]
  } | null
}

type CodeTokenType = 'plain' | 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'variable'
type CodeToken = { text: string; type: CodeTokenType }

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 1 << 1
const FORMAT_STRIKETHROUGH = 1 << 2
const FORMAT_UNDERLINE = 1 << 3
const FORMAT_CODE = 1 << 4
const FORMAT_SUBSCRIPT = 1 << 5
const FORMAT_SUPERSCRIPT = 1 << 6

function applyTextFormatting(text: ReactNode, format = 0): ReactNode {
  let output = text

  if (format & FORMAT_CODE) output = <code className={styles.inlineCode}>{output}</code>
  if (format & FORMAT_BOLD) output = <strong>{output}</strong>
  if (format & FORMAT_ITALIC) output = <em>{output}</em>
  if (format & FORMAT_UNDERLINE) output = <span className={styles.underline}>{output}</span>
  if (format & FORMAT_STRIKETHROUGH) output = <span className={styles.strikethrough}>{output}</span>
  if (format & FORMAT_SUBSCRIPT) output = <sub>{output}</sub>
  if (format & FORMAT_SUPERSCRIPT) output = <sup>{output}</sup>

  return output
}

function renderLexicalNodes(nodes: LexicalNode[] = [], keyPrefix = 'node'): ReactNode {
  return nodes.map((node, index) => renderLexicalNode(node, `${keyPrefix}-${index}`))
}

function isHeaderCell(node: LexicalNode): boolean {
  return (node.type === 'tablecell' || node.type === 'tableCell') && ((node.headerState ?? 0) > 0 || node.tag === 'th')
}

function isHeaderRow(node: LexicalNode): boolean {
  if (node.type !== 'tablerow' && node.type !== 'tableRow') return false
  const cells = node.children ?? []
  if (!cells.length) return false
  return cells.every(isHeaderCell)
}

function extractTextFromLexicalNode(node: LexicalNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'linebreak') return '\n'
  if (Array.isArray(node.children) && node.children.length > 0) {
    return node.children.map(extractTextFromLexicalNode).join('')
  }
  if (node.root?.children?.length) {
    return node.root.children.map(extractTextFromLexicalNode).join('')
  }
  return ''
}

function tokenizeWithRegex(
  line: string,
  regex: RegExp,
  classify: (token: string, tokenStart: number, sourceLine: string) => CodeTokenType
): CodeToken[] {
  const tokens: CodeToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null = regex.exec(line)

  while (match) {
    const token = match[0]
    const index = match.index

    if (index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, index), type: 'plain' })
    }

    tokens.push({ text: token, type: classify(token, index, line) })
    lastIndex = index + token.length
    match = regex.exec(line)
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: 'plain' })
  }

  return tokens
}

function tokenizeCodeLine(line: string, language: string): CodeToken[] {
  const lang = language.toLowerCase()

  if (lang === 'json') {
    const regex = /"(?:\\.|[^"])*"(?=\s*:)|"(?:\\.|[^"])*"|\btrue\b|\bfalse\b|\bnull\b|-?\b\d+(?:\.\d+)?\b/g
    return tokenizeWithRegex(line, regex, (token, start, source) => {
      if (token.startsWith('"')) {
        const rest = source.slice(start + token.length)
        return /^\s*:/.test(rest) ? 'keyword' : 'string'
      }
      if (/^-?\d/.test(token)) return 'number'
      return 'keyword'
    })
  }

  if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh') {
    const regex = /#[^\n]*|\$\w+|\$\{[^}]+\}|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b(?:if|then|else|fi|for|in|do|done|while|case|esac|function|echo|export|local|cd|ls|cat|grep|awk|sed|curl|npm|node|bash|sh)\b/g
    return tokenizeWithRegex(line, regex, (token) => {
      if (token.startsWith('#')) return 'comment'
      if (token.startsWith('$')) return 'variable'
      if (token.startsWith('"') || token.startsWith("'")) return 'string'
      return 'keyword'
    })
  }

  if (lang === 'sql') {
    const regex = /--.*$|'(?:''|[^'])*'|\b(?:select|from|where|join|left|right|inner|outer|on|insert|into|values|update|set|delete|create|table|index|alter|drop|and|or|not|null|as|group|by|order|limit|having|distinct)\b|\b\d+(?:\.\d+)?\b/gi
    return tokenizeWithRegex(line, regex, (token) => {
      if (token.startsWith('--')) return 'comment'
      if (token.startsWith("'")) return 'string'
      if (/^\d/.test(token)) return 'number'
      return 'keyword'
    })
  }

  // Default: JS/TS style tokenization
  const regex = /\/\/.*$|\/\*.*\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|continue|import|from|export|default|class|new|try|catch|finally|throw|async|await|extends|implements|interface|type|public|private|protected|static|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|[=+\-*/%<>!&|^~?:]+/g
  return tokenizeWithRegex(line, regex, (token) => {
    if (token.startsWith('//') || token.startsWith('/*')) return 'comment'
    if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) return 'string'
    if (/^\d/.test(token)) return 'number'
    if (/^[=+\-*/%<>!&|^~?:]+$/.test(token)) return 'operator'
    return 'keyword'
  })
}

function renderHighlightedCode(code: string, language: string, key: string): ReactNode {
  const lines = code.split('\n')
  return lines.map((line, lineIndex) => {
    const tokens = tokenizeCodeLine(line, language)
    return (
      <span key={`${key}-line-${lineIndex}`} className={styles.codeLine}>
        {tokens.map((token, tokenIndex) => {
          if (token.type === 'plain') return <span key={`${key}-token-${lineIndex}-${tokenIndex}`}>{token.text}</span>
          return (
            <span key={`${key}-token-${lineIndex}-${tokenIndex}`} className={styles[`token-${token.type}`]}>
              {token.text}
            </span>
          )
        })}
        {lineIndex < lines.length - 1 ? '\n' : null}
      </span>
    )
  })
}

function renderLexicalNode(node: LexicalNode, key: string): ReactNode {
  const children = renderLexicalNodes(node.children ?? [], key)

  switch (node.type) {
    case 'root':
      return <div key={key}>{renderLexicalNodes(node.root?.children ?? node.children ?? [], `${key}-root`)}</div>
    case 'heading': {
      const tag = node.tag
      if (tag === 'h1') return <h1 key={key}>{children}</h1>
      if (tag === 'h2') return <h2 key={key}>{children}</h2>
      if (tag === 'h3') return <h3 key={key}>{children}</h3>
      if (tag === 'h4') return <h4 key={key}>{children}</h4>
      if (tag === 'h5') return <h5 key={key}>{children}</h5>
      if (tag === 'h6') return <h6 key={key}>{children}</h6>
      return <h2 key={key}>{children}</h2>
    }
    case 'paragraph':
      return <p key={key}>{children}</p>
    case 'quote':
      return <blockquote key={key}>{children}</blockquote>
    case 'list': {
      const listType = node.listType || node.tag || 'bullet'
      if (listType === 'number') return <ol key={key}>{children}</ol>
      return <ul key={key}>{children}</ul>
    }
    case 'listitem':
      return <li key={key}>{children}</li>
    case 'table':
      {
        const rows = (node.children ?? []).filter((child) => child.type === 'tablerow' || child.type === 'tableRow')
        let splitIndex = 0
        while (splitIndex < rows.length && isHeaderRow(rows[splitIndex])) {
          splitIndex += 1
        }
        const headerRows = rows.slice(0, splitIndex)
        const bodyRows = rows.slice(splitIndex)

        return (
          <div key={key} className={styles.tableWrap}>
            <table className={styles.table}>
              {headerRows.length > 0 ? (
                <thead>
                  {headerRows.map((row, rowIndex) => renderLexicalNode(row, `${key}-thead-${rowIndex}`))}
                </thead>
              ) : null}
              <tbody>
                {(bodyRows.length > 0 ? bodyRows : rows).map((row, rowIndex) =>
                  renderLexicalNode(row, `${key}-tbody-${rowIndex}`)
                )}
              </tbody>
            </table>
          </div>
        )
      }
    case 'tablerow':
    case 'tableRow':
      return <tr key={key}>{children}</tr>
    case 'tablecell':
    case 'tableCell': {
      const isHeader = (node.headerState ?? 0) > 0 || node.tag === 'th'
      if (isHeader) return <th key={key}>{children}</th>
      return <td key={key}>{children}</td>
    }
    case 'code': {
      const codeText = extractTextFromLexicalNode(node)
      const language = (node.language || node.tag || 'text').toLowerCase()
      return (
        <div key={key} className={styles.codeBlockWrap}>
          <div className={styles.codeHeader}>
            <span>{language}</span>
            <CodeCopyButton code={codeText} />
          </div>
          <pre className={styles.codeBlock}>
            <code>{renderHighlightedCode(codeText, language, key)}</code>
          </pre>
        </div>
      )
    }
    case 'link': {
      const href = node.url || '#'
      const target = node.newTab ? '_blank' : node.target
      const rel = target === '_blank' ? 'noopener noreferrer' : node.rel
      return (
        <a key={key} href={href} target={target} rel={rel}>
          {children}
        </a>
      )
    }
    case 'linebreak':
      return <br key={key} />
    case 'upload':
      if (node.value?.url) {
        return (
          <figure key={key} className={styles.figure}>
            <img src={node.value.url} alt={node.value.alt || node.value.filename || 'Content image'} />
          </figure>
        )
      }
      return null
    case 'text': {
      const text = node.text ?? ''
      return <span key={key}>{applyTextFormatting(text, node.format)}</span>
    }
    default:
      if (children && Array.isArray(children) && children.length > 0) {
        return <div key={key}>{children}</div>
      }
      return null
  }
}

function renderRichText(content: unknown): ReactNode {
  if (!content || typeof content !== 'object') return null
  const data = content as LexicalNode
  const nodes = data.root?.children ?? data.children ?? []
  if (!Array.isArray(nodes) || nodes.length === 0) return null
  return renderLexicalNodes(nodes, 'content')
}

async function findPageByPath(path: string): Promise<PayloadPage | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      where: {
        path: { equals: path },
        status: { equals: 'published' },
      },
      depth: 1,
      limit: 1,
    })

    return (result.docs[0] as PayloadPage | undefined) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const path = `/${slug.join('/')}`
  const page = await findPageByPath(path)

  if (!page) {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    }
  }

  const pageTitle = page.seo?.title?.trim() || page.title?.trim() || 'NSTC'
  const pageDescription = page.seo?.description?.trim() || page.excerpt?.trim() || undefined

  return {
    title: pageTitle,
    description: pageDescription,
    robots: { index: true, follow: true },
  }
}

export default async function CMSPageRenderer({ params }: Props) {
  const { slug } = await params
  const path = `/${slug.join('/')}`
  const page = await findPageByPath(path)

  if (!page) notFound()

  const richBody = renderRichText(page.content)

  return (
    <div className={`container ${styles.container}`}>
      <article className={`card ${styles.article}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>{page.title || 'Untitled Page'}</h1>
          {page.excerpt ? (
            <p className={styles.excerpt}>{page.excerpt}</p>
          ) : null}
          {(page.publishedAt || page.updatedAt) ? (
            <p className={styles.meta}>
              Updated {new Date((page.publishedAt || page.updatedAt) as string).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          ) : null}
        </header>

        <section className={styles.richContent}>
          {richBody ? (
            richBody
          ) : (
            <p className={styles.empty}>
              No content has been added to this page yet.
            </p>
          )}
        </section>
      </article>
    </div>
  )
}
