/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['primereact'],
    images: {
      domains: ['your-image-domain.com'], // Replace with your actual image domain
    },
    // Enable static optimization
    reactStrictMode: true,
    // Configure PrimeReact
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
      return config;
    },
  }
  
  module.exports = nextConfig