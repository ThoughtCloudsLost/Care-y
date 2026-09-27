/**
* | output |
* | --- |
* | "{count} categories" |
*
* @param {Library_Filter_Summary_Categories_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_summary_categories_other: ((inputs: Library_Filter_Summary_Categories_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_Summary_Categories_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_Summary_Categories_OtherInputs = {
    count: NonNullable<unknown>;
};
