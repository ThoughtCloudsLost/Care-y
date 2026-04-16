/**
* | output |
* | --- |
* | "Loading search index..." |
*
* @param {Library_Search_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_loading: ((inputs?: Library_Search_LoadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_LoadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_LoadingInputs = {};
