/**
* | output |
* | --- |
* | "Author" |
*
* @param {Library_Filter_AuthorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_author: ((inputs?: Library_Filter_AuthorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_AuthorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_AuthorInputs = {};
