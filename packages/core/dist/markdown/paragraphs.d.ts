/** Structural editing stays within a run of complete top-level paragraphs. */
import { type MdSrc } from './contracts.js';
export interface ParagraphSource {
    blockPath: string;
    src: MdSrc;
    html: string;
}
export declare function paragraphSourcesMatch(body: string, sources: readonly ParagraphSource[]): boolean;
export declare function serializeParagraphs(body: string, sources: readonly ParagraphSource[], paragraphs: readonly string[], allowedClasses?: Record<string, readonly string[]>): {
    md: string;
    paragraphs: string[];
    src: MdSrc;
};
//# sourceMappingURL=paragraphs.d.ts.map