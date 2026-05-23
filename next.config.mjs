import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'picsum.photos', 'via.placeholder.com', 'placehold.co'],
  },
}

export default nextConfig
