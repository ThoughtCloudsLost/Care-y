/**
* | output |
* | --- |
* | "Date range" |
*
* @param {Logs_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_date_range: ((inputs?: Logs_Filter_Date_RangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Filter_Date_RangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Filter_Date_RangeInputs = {};
