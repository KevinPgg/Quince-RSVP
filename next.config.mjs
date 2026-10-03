/** @type {import('next').NextConfig} */

// Las fotos del álbum y el retrato viven en Supabase Storage.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

const nextConfig = {
  images: {
    remotePatterns: supabase
      ? [{ protocol: 'https', hostname: supabase, pathname: '/storage/v1/object/public/fotos/**' }]
      : [],
  },
  experimental: {
    // El navegador reduce la foto antes de mandarla; 4 MB es margen,
    // y queda bajo el límite de 4.5 MB de las funciones de Vercel.
    serverActions: { bodySizeLimit: '4mb' },
  },
  // La invitacion no debe indexarse en buscadores.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}
export default nextConfig
