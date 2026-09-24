/**
* | output |
* | --- |
* | "{percent}% helpful" |
*
* @param {Library_Search_Rating_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_search_rating_label: ((inputs: Library_Search_Rating_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_Rating_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_Rating_LabelInputs = {
    percent: NonNullable<unknown>;
};
