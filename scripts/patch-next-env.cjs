try {
  const nextEnv = require('@next/env')

  if (nextEnv && typeof nextEnv === 'object' && !('default' in nextEnv)) {
    nextEnv.default = nextEnv
  }
} catch (error) {
  console.warn('[patch-next-env] Unable to patch @next/env interop:', error?.message || error)
}
