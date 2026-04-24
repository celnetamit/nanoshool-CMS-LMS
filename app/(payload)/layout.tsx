import type { ReactNode } from 'react'
import config from '@/payload.config'
import { RootLayout } from '@payloadcms/next/layouts'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'

const configPromise = Promise.resolve(config)

async function serverFunction(...args: Parameters<typeof handleServerFunctions>) {
  'use server'
  return handleServerFunctions(...args)
}

export default function Layout({ children }: { children: ReactNode }) {
  return RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction,
  })
}
