import { promises as fs } from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const INVOICE_PREFIX = 'invoices'

function normalizeBaseUrl(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function getS3Client(): S3Client {
  const region = process.env.S3_REGION || 'ap-south-1'
  const endpoint = process.env.S3_ENDPOINT
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('[InvoiceStorage] Missing S3 credentials')
  }

  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

async function uploadToS3(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
  const bucket = process.env.S3_BUCKET
  if (!bucket) {
    throw new Error('[InvoiceStorage] S3_BUCKET is not configured')
  }

  const key = `${INVOICE_PREFIX}/${invoiceId}.pdf`
  const s3 = getS3Client()
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    })
  )

  const publicBase = process.env.S3_PUBLIC_BASE_URL
  if (publicBase) {
    return `${normalizeBaseUrl(publicBase)}/${key}`
  }

  const endpoint = process.env.S3_ENDPOINT
  if (endpoint) {
    return `${normalizeBaseUrl(endpoint)}/${bucket}/${key}`
  }

  return `https://${bucket}.s3.${process.env.S3_REGION || 'ap-south-1'}.amazonaws.com/${key}`
}

async function storeLocally(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
  const invoicesDir = path.join(process.cwd(), 'public', INVOICE_PREFIX)
  await fs.mkdir(invoicesDir, { recursive: true })
  const filePath = path.join(invoicesDir, `${invoiceId}.pdf`)
  await fs.writeFile(filePath, pdfBuffer)
  return `/${INVOICE_PREFIX}/${invoiceId}.pdf`
}

export async function storeInvoicePdf(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
  try {
    return await uploadToS3(invoiceId, pdfBuffer)
  } catch (error) {
    console.warn('[InvoiceStorage] S3 upload failed, falling back to local storage:', error)
    return storeLocally(invoiceId, pdfBuffer)
  }
}
