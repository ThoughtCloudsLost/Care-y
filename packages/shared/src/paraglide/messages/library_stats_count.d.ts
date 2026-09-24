/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Stats_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_stats_count: ((inputs: Library_Stats_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Stats_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Stats_CountInputs = {
    count: NonNullable<unknown>;
};
