/**
* | output |
* | --- |
* | "Any rating" |
*
* @param {Library_Filter_Rating_AnyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_any: ((inputs?: Library_Filter_Rating_AnyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_Rating_AnyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_Rating_AnyInputs = {};
