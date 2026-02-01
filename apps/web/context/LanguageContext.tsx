'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import en from '../dictionaries/en.json';
import es from '../dictionaries/es.json';
import zh from '../dictionaries/zh.json';

type Language = 'en' | 'es' | 'zh';

type Dictionary = typeof en;

const dictionaries = {
    en,
    es,
    zh,
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
        if (saved && ['en', 'es', 'zh'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
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
