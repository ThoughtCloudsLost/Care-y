/**
* | output |
* | --- |
* | "Search loaded {tickets} and articles" |
*
* @param {Search_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_hint: ((inputs: Search_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_HintInputs = {
    tickets: NonNullable<unknown>;
};
