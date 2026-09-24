/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Tickets_Filter_Priority_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority_urgent: ((inputs?: Tickets_Filter_Priority_UrgentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Priority_UrgentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Priority_UrgentInputs = {};
