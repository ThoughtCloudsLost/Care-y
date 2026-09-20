/**
* | output |
* | --- |
* | "On Hold" |
*
* @param {Tickets_Filter_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_hold: ((inputs?: Tickets_Filter_HoldInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_HoldInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_HoldInputs = {};
