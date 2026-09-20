/**
* | output |
* | --- |
* | "Status" |
*
* @param {Tickets_Filter_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_status: ((inputs?: Tickets_Filter_StatusInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_StatusInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_StatusInputs = {};
