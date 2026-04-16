/**
* | output |
* | --- |
* | "No articles match this filter" |
*
* @param {Library_Empty_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_empty_filter: ((inputs?: Library_Empty_FilterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Empty_FilterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Empty_FilterInputs = {};
