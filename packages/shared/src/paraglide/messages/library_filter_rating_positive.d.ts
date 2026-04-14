/**
* | output |
* | --- |
* | "Positive" |
*
* @param {Library_Filter_Rating_PositiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_rating_positive: ((inputs?: Library_Filter_Rating_PositiveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_Rating_PositiveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_Rating_PositiveInputs = {};
