/** @type {import('next').NextConfig} */

// Allow next/image to optimize media served from our hosts. Content images are
// currently rendered with plain <img>, but configuring these patterns lets us
// adopt next/image without further config. Add your CloudFront/custom domain via
// NEXT_PUBLIC_MEDIA_HOST (hostname only, e.g. "cdn.curatedlodges.com").
const remotePatterns = [
  { protocol: 'https', hostname: '**.amazonaws.com' },
  { protocol: 'https', hostname: '**.cloudfront.net' },
  { protocol: 'https', hostname: 'images.unsplash.com' },
]

if (process.env.NEXT_PUBLIC_MEDIA_HOST) {
  remotePatterns.push({ protocol: 'https', hostname: process.env.NEXT_PUBLIC_MEDIA_HOST })
}

const nextConfig = {
  images: {
    remotePatterns,
  },
}

module.exports = nextConfig
