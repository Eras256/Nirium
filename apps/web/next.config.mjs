/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    productionBrowserSourceMaps: false, // Blindaje contra inspección de código fuente en producción
    poweredByHeader: false, // Ocultar el header X-Powered-By por seguridad

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production', // Elimina todos los console.* en producción
    },


    // Transpile three.js ecosystem packages
    transpilePackages: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
    ],

    // Silence linting/ts errors during Vercel builds
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    webpack: (config, { isServer }) => {
        // GLSL shader support
        config.module.rules.push({
            test: /\.(glsl|vs|fs|vert|frag)$/,
            type: 'asset/source',
        });

        // Fix: prevent Node.js server-only modules from breaking browser bundles
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                os: false,
                crypto: false,
                stream: false,
                buffer: false,
                net: false,
                tls: false,
                child_process: false,
            };
        }

        return config;
    },
};

export default nextConfig;
