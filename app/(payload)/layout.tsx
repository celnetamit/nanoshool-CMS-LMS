import type { ReactNode } from 'react'
import '@payloadcms/next/css'
import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import { importMap } from './admin/importMap'

const configPromise = Promise.resolve(config)

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

export default function Layout({ children }: { children: ReactNode }) {
  return RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction,
  })
}
