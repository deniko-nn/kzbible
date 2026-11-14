import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// 301-редиректы со старых адресов WordPress (создаётся командой npm run import:wp)
const redirectsFile = path.resolve(dirname, 'redirects.json')

const nextConfig: NextConfig = {
  async redirects() {
    if (!fs.existsSync(redirectsFile)) return []
    const list: { from: string; to: string }[] = JSON.parse(fs.readFileSync(redirectsFile, 'utf8'))
    return list
      .filter((r) => r.from && r.from !== '/' && r.from !== r.to)
      .map((r) => ({ source: r.from.replace(/\/$/, '') || '/', destination: r.to, permanent: true }))
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
