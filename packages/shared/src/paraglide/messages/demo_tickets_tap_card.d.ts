/**
* | output |
* | --- |
* | "Opening a ticket" |
*
* @param {Demo_Tickets_Tap_CardInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_tap_card: ((inputs?: Demo_Tickets_Tap_CardInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_Tap_CardInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_Tap_CardInputs = {};
