// Blog post registry — ordering + non-translatable metadata only.
// Translatable text (title, excerpt, tag, body) lives in dictionaries under
// `blog.posts.<slug>` so it switches with the language selector.
// To publish: add an entry here + the matching `blog.posts.<slug>` block in
// en/es.json + a page under app/(app)/blog/<slug>/page.tsx.

export interface BlogPostMeta {
    slug: string;
    date: string;        // ISO date — formatted per-locale at render time
    readMinutes: number;
}

export const posts: BlogPostMeta[] = [
    {
        slug: "bbva-open-deal-room",
        date: "2026-05-21",
        readMinutes: 4,
    },
];
