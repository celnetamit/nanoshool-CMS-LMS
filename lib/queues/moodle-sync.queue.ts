/**
 * Moodle Sync Retry Queue using BullMQ + Redis
 * Use this queue for all Moodle operations that might fail.
 */

import { Queue, Worker, Job } from 'bullmq'
import { redis } from '@/lib/redis'
import { syncUserEnrollment, unenrollUserFromCourse, getCourseCompletion } from '@/services/moodle.service'
import { markMoodleEnrolled, markCompleted } from '@/services/enrollment.service'
import { query } from '@/lib/db'

// ─── Queue Definition ──────────────────────────────────────
export const moodleSyncQueue = new Queue('moodle-sync', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

// ─── Job Types ──────────────────────────────────────────────
export type MoodleSyncJob =
  | {
      type: 'enroll-user'
      enrollmentId: string
      userId: string
      userEmail: string
      userName: string
      moodleCourseId: string
    }
  | {
      type: 'unenroll-user'
      moodleUserId: number
      moodleCourseId: string
    }
  | {
      type: 'check-completion'
      enrollmentId: string
      userId: string
      productId: string
      moodleUserId: number
      moodleCourseId: string
    }

// ─── Enqueue a sync job ────────────────────────────────────
export async function enqueueMoodleSync(job: MoodleSyncJob): Promise<void> {
  await moodleSyncQueue.add(job.type, job)
}

// ─── Worker (run in a separate process or server startup) ──
export function startMoodleSyncWorker(): Worker {
  const worker = new Worker<MoodleSyncJob>(
    'moodle-sync',
    async (job: Job<MoodleSyncJob>) => {
      const data = job.data

      if (data.type === 'enroll-user') {
        const moodleUserId = await syncUserEnrollment({
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          moodleCourseId: data.moodleCourseId,
        })
        await markMoodleEnrolled(data.enrollmentId)
        await query('UPDATE users SET moodle_user_id = $1 WHERE id = $2', [String(moodleUserId), data.userId])
        console.log(`[Moodle] Enrolled user ${data.userId} in course ${data.moodleCourseId}`)
      }

      if (data.type === 'unenroll-user') {
        await unenrollUserFromCourse({
          moodleUserId: data.moodleUserId,
          moodleCourseId: data.moodleCourseId,
        })
        console.log(`[Moodle] Unenrolled moodle user ${data.moodleUserId} from course ${data.moodleCourseId}`)
      }

      if (data.type === 'check-completion') {
        const { completed } = await getCourseCompletion({
          moodleUserId: data.moodleUserId,
          moodleCourseId: data.moodleCourseId,
        })
        if (completed) {
          await markCompleted(data.userId, data.productId)
          console.log(`[Moodle] Completion marked for user ${data.userId}, product ${data.productId}`)
        }
      }
    },
    {
      connection: redis,
      concurrency: 5,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[Moodle Queue] Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message)
  })

  worker.on('completed', (job) => {
    console.log(`[Moodle Queue] Job ${job.id} completed`)
  })

  return worker
}
