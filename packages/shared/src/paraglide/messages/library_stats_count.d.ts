/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Stats_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_stats_count: ((inputs: Library_Stats_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Stats_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Stats_CountInputs = {
    count: NonNullable<unknown>;
};
