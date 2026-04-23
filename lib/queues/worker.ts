/**
 * Standalone BullMQ worker process.
 * Run: npm run worker:moodle
 */

import { startMoodleSyncWorker } from './moodle-sync.queue'

const worker = startMoodleSyncWorker()

console.log('[Worker] Moodle sync worker started')

process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down gracefully...')
  await worker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await worker.close()
  process.exit(0)
})
