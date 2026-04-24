import { getPayload } from 'payload'
import config from '@payload-config'

export async function getPublicPayload() {
  return getPayload({ config })
}
