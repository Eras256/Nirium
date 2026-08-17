"use client";

import { motion } from "framer-motion";

export function SectionBrandLogo({ size = "w-32 sm:w-40", className = "" }: { size?: string, className?: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`flex justify-center mb-10 ${className}`}
        >
            <div className="relative group">
                <div className="absolute inset-0 bg-stellar-teal/10 blur-[80px] rounded-full group-hover:bg-stellar-teal/20 transition-all duration-1000"></div>
                <img 
                    src="/brand/logo.png" 
                    alt="Nirium Logo" 
                    className={`${size} h-auto object-contain drop-shadow-[0_0_25px_rgba(45,235,232,0.3)] dark:drop-shadow-[0_0_25px_rgba(45,235,232,0.3)] hover:drop-shadow-[0_0_40px_rgba(45,235,232,0.5)] transition-all duration-700`}
                />
            </div>
        </motion.div>
    );
}
