'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

// Dynamic import for 3D background (client-side only)
const NeuralCanvas = dynamic(
  () => import('@/components/3d/NeuralCanvas').then((mod) => mod.NeuralCanvas),
  { ssr: false }
);

const featurePillars = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Market Vortex',
    subtitle: 'GPGPU Engine',
    description: '16,384 GPU-accelerated particles visualizing real-time liquidity flows. Data transformed into a living neural field.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Neural ZK-Privacy',
    subtitle: 'Groth16 SNARKs',
    description: 'Protocol 25 native privacy. Prove solvency and execute trades without exposing institutional wallet history.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 011 1V4z" />
      </svg>
    ),
    title: 'Agentic Economy',
    subtitle: 'x402 Protocol',
    description: 'An autonomous layer for AI-to-AI transactions. Machine discovery, negotiation, and settlement on Stellar.',
  },
];

const technologies = [
  { name: 'Protocol 25', desc: 'Advanced state archival & BN254 precompiles.' },
  { name: 'Soroban Rust', desc: 'Secure, high-performance WASM smart contracts.' },
  { name: 'ZK-SNARKs', desc: 'Groth16 zero-knowledge proofs for privacy.' },
  { name: 'Three.js GPGPU', desc: 'Complex physics simulations running on the GPU.' },
  { name: 'x402 Standard', desc: 'Defining the future of machine payments.' },
  { name: 'Stellar SCP', desc: 'Sustainable, sub-5-second finality consensus.' },
];

const stats = [
  { value: '16K+', label: 'Visual Particles' },
  { value: 'Groth16', label: 'ZK-Privacy' },
  { value: '< 3s', label: 'Finality' },
  { value: 'x402', label: 'Agent Optimized' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#02040A] text-white overflow-x-hidden selection:bg-cyan-500/30">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 opacity-100 pointer-events-none">
        <NeuralCanvas intensity={1.5} />
      </div>

      <GlassNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-44 pb-32 px-6 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center max-w-6xl mx-auto"
        >
          {/* Version Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 mb-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold">
              Nirium v2.5 Online
            </span>
            <span className="w-1 h-3 border-r border-white/20 mx-1"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
              Stellar Mainnet Ready
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-10 leading-[0.9]">
            The Neural <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">
              Liquidity Layer.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto mb-14 leading-relaxed tracking-tight">
            Nirium merges the power of Stellar Protocol 25 with an immersive GPGPU interface and institutional-grade ZK-Privacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/dashboard">
              <GlassButton size="lg" className="bg-white text-black hover:bg-gray-100 min-w-[200px] border-none">
                Enter Console
              </GlassButton>
            </Link>
            <Link href="/lab">
              <GlassButton size="lg" className="bg-white/5 hover:bg-white/10 border-white/10 text-white min-w-[200px]">
                Neural Lab
              </GlassButton>
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Stats Divider */}
      <section className="relative z-10 border-y border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-500">{stat.value}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neural Pillars (Features) */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-28">
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-cyan-400 mb-6 font-bold">
              Core Architecture
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
              The Three Pillars of Nirium
            </h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {featurePillars.map((pillar, i) => (
              <GlassCard
                key={i}
                className="group p-10 border border-white/5 bg-black/40 hover:bg-black/60 transition-all duration-700 relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[80px] group-hover:bg-cyan-500/20 transition-all duration-700" />

                <div className="relative z-10">
                  <div className="w-14 h-14 mb-8 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400/50 transition-all duration-500">
                    {pillar.icon}
                  </div>
                  <div className="mb-6">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold mb-1 block">
                      {pillar.subtitle}
                    </span>
                    <h4 className="text-2xl font-bold text-white">{pillar.title}</h4>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-light text-lg">
                    {pillar.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Tech Stack */}
      <section className="relative z-10 py-40 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-purple-400 mb-6 font-bold">
                Under The Hood
              </h2>
              <h3 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tighter leading-tight">
                Engineered for <br />the Agentic Era.
              </h3>
              <p className="text-xl text-gray-400 font-light mb-12 leading-relaxed">
                Nirium leverages the most advanced standards in the Stellar ecosystem, optimized for high-frequency data and machine interaction.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {technologies.map((tech, i) => (
                  <div key={i} className="flex flex-col gap-1 p-4 rounded-xl border border-white/5 bg-black/20">
                    <span className="text-white font-semibold text-sm">{tech.name}</span>
                    <span className="text-gray-500 text-xs">{tech.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-[120px]" />
              <GlassCard className="relative p-8 border-white/10 aspect-video flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="text-8xl mb-4">🌪️</div>
                  <div className="text-gray-400 font-mono text-sm animate-pulse">SYSTEM_STATUS: NEURAL_ENGINE_ACTIVE</div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-10 tracking-tighter">
              Ready to transcend <br />static finance?
            </h2>
            <p className="text-2xl text-gray-400 font-light mb-14 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet and experience the first neural-native liquidity layer on Stellar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/dashboard">
                <GlassButton size="lg" className="bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-400 min-w-[220px]">
                  Launch Dashboard
                </GlassButton>
              </Link>
              <Link href="/docs">
                <GlassButton size="lg" className="bg-white/5 hover:bg-white/10 border-white/10 text-white min-w-[220px]">
                  Read Whitepaper
                </GlassButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-20 px-6 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-white">N</div>
                <span className="text-2xl font-bold tracking-tighter uppercase">Nirium</span>
              </div>
              <p className="text-gray-500 max-w-sm mx-auto md:mx-0 leading-relaxed">
                The future of liquidity is neural. Built for the Stellar ecosystem and the agentic economy.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Protocol</h4>
              <ul className="text-gray-500 space-y-4 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Stellar Network</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Soroban Contracts</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">ZK-Verifier</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">x402 Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Architects</h4>
              <ul className="text-gray-500 space-y-4 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Vaiosx</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">M0nsxx</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Maux</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-6">
            <span>© 2026 Nirium Neural Systems. All rights reserved.</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Privacy</a>
              <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Terms</a>
              <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Status</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
