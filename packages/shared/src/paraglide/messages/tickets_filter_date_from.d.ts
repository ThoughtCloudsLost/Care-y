/**
* | output |
* | --- |
* | "From" |
*
* @param {Tickets_Filter_Date_FromInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_from: ((inputs?: Tickets_Filter_Date_FromInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Date_FromInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Date_FromInputs = {};
