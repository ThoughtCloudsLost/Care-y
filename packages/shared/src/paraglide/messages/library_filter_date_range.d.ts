/**
* | output |
* | --- |
* | "Date" |
*
* @param {Library_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_date_range: ((inputs?: Library_Filter_Date_RangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Filter_Date_RangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Filter_Date_RangeInputs = {};
