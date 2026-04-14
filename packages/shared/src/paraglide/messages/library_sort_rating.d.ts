/**
* | output |
* | --- |
* | "Rating" |
*
* @param {Library_Sort_RatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_rating: ((inputs?: Library_Sort_RatingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Sort_RatingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Sort_RatingInputs = {};
