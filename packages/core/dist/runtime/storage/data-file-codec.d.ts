/**
 * JSON data files under the content root. Three shapes:
 *
 * - `array`: Astro `file()` loader form, objects with a string `id`.
 * - `object`: Astro `file()` loader form, an object of entries keyed by id.
 * - `single`: any other object (a site settings file imported directly). The
 *   whole file is one entry whose id is the file's name.
 *
 * Entry data excludes the `id` of the array form (it is the entry's address,
 * not an editable field). Updates replace one entry in place and keep the
 * file's shape, entry order, and key order, and change only the text of the
 * values that differ (see `json-splice.ts`), so hand formatting survives.
 */
type Data = Record<string, unknown>;
export type DataFile = {
    shape: "array";
    items: Data[];
    indent: string | number;
    source: string;
} | {
    shape: "object";
    entries: Record<string, Data>;
    indent: string | number;
    source: string;
} | {
    shape: "single";
    name: string;
    data: Data;
    indent: string | number;
    source: string;
};
export type DataFileShape = DataFile["shape"];
/** The shape of a parsed data file's value, or null when it is unsupported. */
export declare function dataFileShape(value: unknown): DataFileShape | null;
/**
 * Where a property path inside a data file's value is stored: the entry id and
 * the field path within it. Null for the structure itself (the array, an item,
 * an array item's `id`).
 */
export declare function dataFileBinding(shape: DataFileShape, name: string, value: unknown, path: readonly string[]): {
    id: string;
    field: string;
} | null;
/** Parses a data file, or returns null when it is not a supported shape. */
export declare function parseDataFile(source: string, name: string): DataFile | null;
export declare function dataFileIds(file: DataFile): string[];
export declare function readDataEntry(file: DataFile, id: string): Data | null;
/** The file contents after setting (or, with `data === null`, removing) one entry. */
export declare function writeDataEntry(file: DataFile, id: string, data: Data | null): string;
export {};
//# sourceMappingURL=data-file-codec.d.ts.map