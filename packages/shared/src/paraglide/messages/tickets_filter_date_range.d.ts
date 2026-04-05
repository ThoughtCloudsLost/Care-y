/**
* | output |
* | --- |
* | "Date" |
*
* @param {Tickets_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_range: ((inputs?: Tickets_Filter_Date_RangeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Date_RangeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Date_RangeInputs = {};
