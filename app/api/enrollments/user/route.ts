import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserEnrollments } from '@/services/enrollment.service'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const enrollments = await getUserEnrollments(session.user.id)
  return NextResponse.json({ enrollments })
}
