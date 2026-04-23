import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined
}

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
      // Stop retrying after 3 attempts during build/SSG
      if (times > 3) return null
      const delay = Math.min(times * 100, 3000)
      return delay
    },
  })

  // Prevent unhandled error events from crashing the process
  // (e.g. when Redis is unavailable during Next.js static generation)
  client.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Redis] Connection error (suppressed):', err.message)
    }
  })

  return client
}

const redis: Redis = global._redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  global._redis = redis
}

export { redis }

// ─── Helpers ───────────────────────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis.get(key)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 300
): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key)
}
