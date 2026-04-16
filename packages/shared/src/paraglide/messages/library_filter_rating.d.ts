/**
* | output |
* | --- |
* | "Rating" |
*
* @param {Library_Filter_RatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating: ((inputs?: Library_Filter_RatingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_RatingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_RatingInputs = {};
