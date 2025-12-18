import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Pin the Turbopack root so env loading does not jump to sibling directories with other lockfiles
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
