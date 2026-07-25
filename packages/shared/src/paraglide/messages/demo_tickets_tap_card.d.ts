/**
* | output |
* | --- |
* | "Opening a ticket" |
*
* @param {Demo_Tickets_Tap_CardInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_tap_card: ((inputs?: Demo_Tickets_Tap_CardInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_Tap_CardInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_Tap_CardInputs = {};
