/**
* | output |
* | --- |
* | "{searched}/{total}" |
*
* @param {Search_Full_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_progress: ((inputs: Search_Full_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_ProgressInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
