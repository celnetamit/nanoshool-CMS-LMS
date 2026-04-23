import { query } from '@/lib/db'
import type { DBInvoice } from '@/types'

// ─── Generate invoice record ───────────────────────────────
export async function createInvoice({
  userId,
  paymentId,
  amount,
}: {
  userId: string
  paymentId: string
  amount: number
}): Promise<DBInvoice> {
  const [invoice] = await query<DBInvoice>(
    `INSERT INTO invoices (user_id, payment_id, amount, status)
     VALUES ($1, $2, $3, 'issued')
     RETURNING *`,
    [userId, paymentId, amount]
  )
  return invoice
}

// ─── Update invoice with PDF URL ───────────────────────────
export async function updateInvoicePdf(invoiceId: string, pdfUrl: string): Promise<void> {
  await query(
    'UPDATE invoices SET pdf_url = $1, updated_at = NOW() WHERE id = $2',
    [pdfUrl, invoiceId]
  )
}

// ─── Link invoice to enrollment ────────────────────────────
export async function linkInvoiceToEnrollment(enrollmentId: string, invoiceId: string): Promise<void> {
  await query(
    'UPDATE enrollments SET invoice_id = $1, updated_at = NOW() WHERE id = $2',
    [invoiceId, enrollmentId]
  )
}

// ─── Get user invoices ─────────────────────────────────────
export async function getUserInvoices(userId: string): Promise<DBInvoice[]> {
  return query<DBInvoice>(
    `SELECT i.*, p.razorpay_order_id, p.razorpay_payment_id, p.currency
     FROM invoices i
     LEFT JOIN payments p ON p.id = i.payment_id
     WHERE i.user_id = $1
     ORDER BY i.created_at DESC`,
    [userId]
  )
}

// ─── Generate PDF invoice (server-side) ────────────────────
export async function generateInvoicePdf({
  invoiceId,
  userName,
  userEmail,
  productTitle,
  amount,
  currency,
  razorpayPaymentId,
  issuedAt,
}: {
  invoiceId: string
  userName: string
  userEmail: string
  productTitle: string
  amount: number
  currency: string
  razorpayPaymentId: string
  issuedAt: Date
}): Promise<Buffer> {
  // Dynamic import to avoid bundling issues
  const PDFDocument = (await import('pdfkit')).default

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // ─── Header
    doc.fontSize(24).font('Helvetica-Bold').text('NSTC', 50, 50)
    doc.fontSize(10).font('Helvetica').fillColor('#71717a')
      .text('National Science & Technology Centre', 50, 80)
    doc.fillColor('#000000')

    // ─── Invoice Title
    doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' })
    doc.fontSize(10).font('Helvetica').fillColor('#71717a')
      .text(`Invoice ID: ${invoiceId.slice(0, 8).toUpperCase()}`, 400, 80, { align: 'right' })
      .text(`Date: ${issuedAt.toLocaleDateString('en-IN')}`, 400, 95, { align: 'right' })
    doc.fillColor('#000000')

    // ─── Divider
    doc.moveTo(50, 130).lineTo(545, 130).stroke('#e4e4e7')

    // ─── Bill To
    doc.fontSize(10).font('Helvetica-Bold').text('BILLED TO', 50, 150)
    doc.fontSize(11).font('Helvetica').text(userName, 50, 168).text(userEmail, 50, 183)

    // ─── Payment Info
    doc.fontSize(10).font('Helvetica-Bold').text('PAYMENT REFERENCE', 350, 150)
    doc.fontSize(10).font('Helvetica')
      .text(`Razorpay ID: ${razorpayPaymentId}`, 350, 168)
      .text(`Method: Online Payment`, 350, 183)

    // ─── Line items
    doc.moveTo(50, 230).lineTo(545, 230).stroke('#e4e4e7')
    doc.fontSize(10).font('Helvetica-Bold')
      .text('DESCRIPTION', 50, 240)
      .text('AMOUNT', 460, 240)
    doc.moveTo(50, 258).lineTo(545, 258).stroke('#e4e4e7')

    doc.fontSize(11).font('Helvetica').text(productTitle, 50, 270)
    doc.fontSize(11).font('Helvetica-Bold')
      .text(`${currency} ${amount.toLocaleString('en-IN')}`, 460, 270)

    // ─── Total
    doc.moveTo(350, 310).lineTo(545, 310).stroke('#e4e4e7')
    doc.fontSize(12).font('Helvetica-Bold').text('TOTAL', 350, 322)
    doc.fontSize(14).font('Helvetica-Bold')
      .text(`${currency} ${amount.toLocaleString('en-IN')}`, 430, 320)

    // ─── Footer
    doc.fontSize(9).font('Helvetica').fillColor('#71717a')
      .text('Thank you for learning with NSTC.', 50, 720, { align: 'center', width: 495 })
      .text('For support: support@nstc.in', 50, 735, { align: 'center', width: 495 })
    doc.fillColor('#000')

    doc.end()
  })
}
