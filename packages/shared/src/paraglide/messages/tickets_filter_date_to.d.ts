/**
* | output |
* | --- |
* | "To" |
*
* @param {Tickets_Filter_Date_ToInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_to: ((inputs?: Tickets_Filter_Date_ToInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Date_ToInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Date_ToInputs = {};
