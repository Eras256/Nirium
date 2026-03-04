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

        return config;
    },

    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
