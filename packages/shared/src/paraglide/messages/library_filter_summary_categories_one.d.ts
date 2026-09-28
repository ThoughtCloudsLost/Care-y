/**
* | output |
* | --- |
* | "{count} category" |
*
* @param {Library_Filter_Summary_Categories_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_summary_categories_one: ((inputs: Library_Filter_Summary_Categories_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_Summary_Categories_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_Summary_Categories_OneInputs = {
    count: NonNullable<unknown>;
};
