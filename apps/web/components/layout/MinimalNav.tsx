'use client';

// Minimal top bar for standalone pages (e.g. /pitch, /pitch-pro) that opt
// out of the full app chrome via ChromeGate — just the language selector
// and the light/dark toggle, same components as the rest of the site, no
// logo/links/sidebar. Purely visual here: these pages don't consume `t.*`
// from the dictionaries, so switching language doesn't retranslate the
// page content — that's a deliberate choice, not a bug.
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function MinimalNav() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="w-full flex justify-end px-4 sm:px-6 pt-6">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-colors">
                    <Globe size={13} className="text-white/40" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as "en" | "es")}
                        className="bg-transparent text-[10px] text-white/60 font-bold focus:outline-none cursor-pointer uppercase tracking-widest"
                    >
                        <option value="en" className="bg-black text-white">English</option>
                        <option value="es" className="bg-black text-white">Español</option>
                    </select>
                </div>
                <ThemeToggle />
            </div>
        </div>
    );
}
