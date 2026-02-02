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

const features = [
  {
    icon: 'global',
    title: 'Global Payments',
    description:
      'Settlement in seconds for a fraction of a cent. Enable borderless transactions for your institution.',
    link: '#payments',
  },
  {
    icon: 'token',
    title: 'Asset Tokenization',
    description:
      'Represent real-world assets on-chain. From real estate to securities, digitized and programmable.',
    link: '#tokenization',
  },
  {
    icon: 'ramp',
    title: 'On/Off Ramps',
    description:
      'Seamless conversion between fiat and digital assets through a global network of anchors.',
    link: '#ramps',
  },
];

const benefits = [
  {
    title: 'Speed & Scale',
    description: 'Process thousands of transactions per second with 3-5 second finality.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
  },
  {
    title: 'Low Cost',
    description: 'Transactions cost fractions of a cent (0.00001 XLM), enabling micro-payments.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    title: 'Compliance',
    description: 'Built-in tools for KYC/AML and asset control (SEP-08, SEP-10).',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    title: 'Sustainable',
    description: 'One of the most eco-friendly blockchains, using the SCP consensus mechanism.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect',
    description: 'Integrate your wallet (Freighter, Lobstr) or custodial solution seamlessly.',
  },
  {
    number: '02',
    title: 'Verify',
    description: 'Complete institutional onboarding with automated KYC/KYB checks.',
  },
  {
    number: '03',
    title: 'Transact',
    description: 'Access global liquidity, issue assets, or build programmable payments.',
  },
];

const technologies = [
  { name: 'Stellar Protocol 25', desc: 'Latest network upgrade enabling advanced state archiving.' },
  { name: 'Soroban Contracts', desc: 'High-performance Rust-based smart contracts.' },
  { name: 'State Archival', desc: 'Efficient long-term data storage solutions.' },
  { name: 'Horizon API', desc: 'Robust RESTful API for network interaction.' },
  { name: 'SEP Standards', desc: 'Interoperable standards (SEP-10, SEP-24, SEP-31).' },
  { name: 'Classic Operations', desc: 'Native operations for payments and asset management.' },
];

const stats = [
  { value: '$127M+', label: 'Volume Processed' },
  { value: '< 3s', label: 'Settlement Time' },
  { value: '0.00001 XLM', label: 'Avg Cost' },
  { value: '180+', label: 'Countries Served' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#050508] text-white overflow-x-hidden selection:bg-[#D4AF37]/20">
      {/* 3D Background - Non-invasive */}
      <div className="fixed inset-0 z-0 opacity-100 pointer-events-none">
        <NeuralCanvas />
      </div>

      <GlassNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
              Powered by Stellar
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-8 leading-[1.1]">
            Financial Infrastructure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 font-medium">
              for the Digital Age.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            Scalable, secure, and compliant blockchain solutions for payments, tokenization, and digital asset management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-white text-black font-medium rounded-sm hover:bg-gray-100 transition-colors text-sm uppercase tracking-wide">
                Start Building
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm hover:bg-white/5 transition-colors text-sm uppercase tracking-wide">
                Contact Sales
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Banner */}
      <section className="relative z-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-light text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">
              Why Nirium
            </h2>
            <h3 className="text-3xl md:text-4xl font-light text-white">
              Built for Institutional Scale
            </h3>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="group p-6 border border-white/10 bg-[#0A0B14] hover:bg-[#11121c] transition-all duration-300 rounded-2xl shadow-lg relative overflow-hidden z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-[#A08020]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300 bg-[#D4AF37]/20 w-12 h-12 rounded-xl flex items-center justify-center border border-[#D4AF37]/20">
                    {benefit.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{benefit.title}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed group-hover:text-white/90 transition-colors">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases (Solutions) Section */}
      <section className="relative z-10 py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">
              Solutions
            </h2>
            <h3 className="text-4xl md:text-5xl font-light text-white">
              Core Applications
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <GlassCard
                key={i}
                className="group p-8 border border-white/5 bg-black/40 hover:bg-black/60 transition-all duration-500"
              >
                <div className="w-12 h-12 mb-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37] group-hover:scale-110 transition-transform duration-500">
                  {feature.icon === 'global' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                  {feature.icon === 'token' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  )}
                  {feature.icon === 'ramp' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  )}
                </div>
                <h4 className="text-xl font-medium text-white mb-3">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed font-light mb-6">
                  {feature.description}
                </p>
                <div className="flex items-center text-[#D4AF37] text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Learn more
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works (Steps) */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">
              Get Started
            </h2>
            <h3 className="text-3xl md:text-4xl font-light text-white">
              Launch in Three Steps
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-[20%] left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>

            {steps.map((step, i) => (
              <div key={i} className="relative z-10 text-center group p-8 rounded-2xl bg-[#0A0B14] border border-white/10 shadow-lg hover:border-[#D4AF37]/30 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#11121c] border border-white/20 flex items-center justify-center text-xl font-mono text-[#D4AF37] group-hover:scale-110 group-hover:border-[#D4AF37]/50 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 relative z-20">
                  {step.number}
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">{step.title}</h4>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies & Protocols */}
      <section className="relative z-10 py-32 px-6 bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-3 font-semibold">
                Under the Hood
              </h2>
              <h3 className="text-3xl md:text-4xl font-light text-white">
                Technologies & Protocols
              </h3>
            </div>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed text-right md:text-left">
              Our platform leverages the most advanced standards in the Stellar ecosystem to ensure performance, security, and interoperability.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech, i) => (
              <div key={i} className="p-5 border border-white/10 bg-[#0A0B14] hover:bg-[#11121c] transition-all duration-300 rounded-xl shadow-lg group">
                <div className="text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform duration-300 p-2 bg-[#D4AF37]/20 rounded-lg w-fit">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h4 className="font-semibold text-white text-sm mb-2">{tech.name}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust/Ecosystem Section */}
      {/* Trust/Ecosystem Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0A0B14] border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-20 transform -skew-x-12" />

            <p className="text-center text-sm text-gray-400 uppercase tracking-widest mb-10 font-medium relative z-10">
              Trusted by builders across the Stellar Ecosystem
            </p>

            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 relative z-10">
              {['MoneyGram', 'Circle', 'Franklin Templeton', 'Bitso', 'Coinbase'].map((partner) => (
                <div key={partner} className="text-xl md:text-2xl font-bold text-gray-500 hover:text-white transition-all duration-300 cursor-default hover:scale-105">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-8">
            Build the future of finance.
          </h2>
          <p className="text-xl text-gray-400 font-light mb-12 max-w-2xl mx-auto">
            Join the network that processes billions in transactions daily with 99.99% uptime.
          </p>
          <Link href="/dashboard">
            <GlassButton size="lg" className="bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border-[#D4AF37]/30 text-[#D4AF37] min-w-[200px]">
              Enter Platform
            </GlassButton>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-12 px-6 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <span>© 2026 Nirium Inc. All rights reserved.</span>
            <span className="hidden md:inline text-gray-800">|</span>
            <span className="text-gray-500">Made by Vaiosx, M0nsxx & Maux</span>
          </div>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Compliance</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
