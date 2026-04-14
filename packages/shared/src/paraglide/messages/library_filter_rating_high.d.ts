/**
* | output |
* | --- |
* | "Highly rated" |
*
* @param {Library_Filter_Rating_HighInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_high: ((inputs?: Library_Filter_Rating_HighInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_Rating_HighInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_Rating_HighInputs = {};
