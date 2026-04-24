import config from '@/payload.config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

const configPromise = Promise.resolve(config)

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({
    config: configPromise,
    params,
    searchParams,
  })

const Page = ({ params, searchParams }: Args) =>
  RootPage({
    config: configPromise,
    importMap,
    params,
    searchParams,
  })

export default Page
