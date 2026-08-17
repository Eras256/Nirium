'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import en from '../dictionaries/en.json';
import es from '../dictionaries/es.json';

type Language = 'en' | 'es';

type Dictionary = typeof en;

const dictionaries = {
    en,
    es,
};

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Dictionary;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('nirium_lang') as Language;
        if (saved && ['en', 'es'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        const allowed: Language[] = ['en', 'es'];
        if (!allowed.includes(lang)) return;
        setLanguage(lang);
        localStorage.setItem('nirium_lang', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: dictionaries[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
