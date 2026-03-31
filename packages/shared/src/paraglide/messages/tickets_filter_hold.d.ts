/**
* | output |
* | --- |
* | "On Hold" |
*
* @param {Tickets_Filter_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_hold: ((inputs?: Tickets_Filter_HoldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_HoldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_HoldInputs = {};
