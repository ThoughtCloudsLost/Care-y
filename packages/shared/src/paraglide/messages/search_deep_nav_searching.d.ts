/**
* | output |
* | --- |
* | "{searched}/{total}" |
*
* @param {Search_Deep_Nav_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_searching: ((inputs: Search_Deep_Nav_SearchingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Deep_Nav_SearchingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Deep_Nav_SearchingInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
