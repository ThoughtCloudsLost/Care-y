/**
* | output |
* | --- |
* | "Low" |
*
* @param {Tickets_Filter_Priority_LowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority_low: ((inputs?: Tickets_Filter_Priority_LowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Priority_LowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Priority_LowInputs = {};
