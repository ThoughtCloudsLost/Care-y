/**
* | output |
* | --- |
* | "{percent}% helpful" |
*
* @param {Library_Search_Rating_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_rating_label: ((inputs: Library_Search_Rating_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_Rating_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_Rating_LabelInputs = {
    percent: NonNullable<unknown>;
};
