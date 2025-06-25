/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '', // kosongkan jika tidak ada port, atau isi sesuai kebutuhan
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;