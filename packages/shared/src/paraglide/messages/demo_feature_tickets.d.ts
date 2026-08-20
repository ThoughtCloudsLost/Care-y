/**
* | output |
* | --- |
* | "Tickets" |
*
* @param {Demo_Feature_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_feature_tickets: ((inputs?: Demo_Feature_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Feature_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Feature_TicketsInputs = {};
