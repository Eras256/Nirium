'use client';
import { motion } from 'framer-motion';
import Navbar from "@/components/layout/Navbar";
import FiatRamp from "@/components/layout/FiatRamp";
import { SectionBrandLogo } from "@/components/ui/SectionBrandLogo";
import { useLanguage } from "../../context/LanguageContext";

export default function RampPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden relative flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex flex-col relative pt-32 sm:pt-40 md:pt-48 lg:pt-56">
                {/* Background FX */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] mix-blend-multiply z-10" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto w-full px-6 flex-1 flex flex-col justify-center pb-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <SectionBrandLogo />
                            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                                <span>🏦</span>
                                <span className="text-sm font-semibold text-emerald-400">{t.ramp.header.badge}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mt-6 tracking-tight bg-gradient-to-r from-emerald-200 via-white to-teal-400 bg-clip-text text-transparent">
                            {t.ramp.header.title}
                        </h1>
                        <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            {t.ramp.header.subtitle}
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-md mx-auto w-full"
                    >
                        <FiatRamp />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
