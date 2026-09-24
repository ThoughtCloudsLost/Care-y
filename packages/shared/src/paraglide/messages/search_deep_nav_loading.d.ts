/**
* | output |
* | --- |
* | "Loading {count}..." |
*
* @param {Search_Deep_Nav_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_deep_nav_loading: ((inputs: Search_Deep_Nav_LoadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Deep_Nav_LoadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Deep_Nav_LoadingInputs = {
    count: NonNullable<unknown>;
};
