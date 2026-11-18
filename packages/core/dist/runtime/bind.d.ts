/**
 * Explicit inline binding per ADR-004.
 *
 * Usage in .astro:
 *   const e = bindEntry({ collection: 'pages', id: 'home' })
 *   <h1 {...e('hero.title')}>{hero.title}</h1>
 */
export declare function bindEntry(entry: {
    collection: string;
    id: string;
}): (field: string, options?: {
    rich?: boolean;
}) => Record<string, string>;
//# sourceMappingURL=bind.d.ts.map