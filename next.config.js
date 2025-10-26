/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'pisces.bbystatic.com' },
      { protocol: 'https', hostname: 'c1.neweggimages.com' },
    ],
  },
};

module.exports = nextConfig;
