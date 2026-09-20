/**
* | output |
* | --- |
* | "Take and reply to tickets in your queues" |
*
* @param {Vol_Access_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_access_tickets: ((inputs?: Vol_Access_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Access_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Access_TicketsInputs = {};
