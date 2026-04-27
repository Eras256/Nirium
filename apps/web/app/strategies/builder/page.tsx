'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuilderRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/treasury');
    }, [router]);
    return null;
}
