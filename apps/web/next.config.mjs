/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Transpile three.js ecosystem packages
    transpilePackages: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
    ],

    // Configure webpack for GLSL shader imports
    // Configure webpack for GLSL shader imports and WASM
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(glsl|vs|fs|vert|frag)$/,
            type: 'asset/source',
        });

        // This is critical for snarkjs wasm to load from public folder properly without webpack interfering
        config.resolve.fallback = { fs: false, readline: false };

        // Enable asyncWebAssembly for packages that might need it
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        return config;
    },

    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
