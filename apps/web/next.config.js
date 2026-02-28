/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['three'],
    eslint: {
        ignoreDuringBuilds: true,
    },

};

module.exports = nextConfig;
