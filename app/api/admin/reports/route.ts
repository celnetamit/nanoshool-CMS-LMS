import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'enrollments' // 'enrollments' or 'payments'

  try {
    let rows: any[] = []
    let csvHeader = ''

    if (type === 'enrollments') {
      rows = await query(
        `SELECT e.id, u.name AS user_name, u.email AS user_email,
                p.title AS program, d.name AS domain,
                e.access_status, e.payment_status,
                e.moodle_enrollment_status, e.created_at
         FROM enrollments e
         JOIN users u ON u.id = e.user_id
         JOIN products p ON p.id = e.product_id
         JOIN domains d ON d.id = p.domain_id
         ORDER BY e.created_at DESC`, []
      )
      csvHeader = 'Enrollment ID,User Name,User Email,Program,Domain,Access Status,Payment Status,Moodle Synced,Created At\n'
    } else if (type === 'payments') {
      rows = await query(
        `SELECT pay.id, u.name AS user_name, u.email AS user_email,
                pay.amount, pay.currency, pay.status,
                pay.razorpay_order_id, pay.razorpay_payment_id, pay.created_at
         FROM payments pay
         JOIN users u ON u.id = pay.user_id
         ORDER BY pay.created_at DESC`, []
      )
      csvHeader = 'Payment ID,User Name,User Email,Amount,Currency,Status,Order ID,Payment ID,Created At\n'
    }

    const csvRows = rows.map(r => 
      Object.values(r).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    )
    
    const csvContent = csvHeader + csvRows.join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_report_${new Date().toISOString().slice(0,10)}.csv"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
