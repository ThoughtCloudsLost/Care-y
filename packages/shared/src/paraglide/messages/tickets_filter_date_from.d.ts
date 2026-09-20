/**
* | output |
* | --- |
* | "From" |
*
* @param {Tickets_Filter_Date_FromInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_from: ((inputs?: Tickets_Filter_Date_FromInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Date_FromInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Date_FromInputs = {};
