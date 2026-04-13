/**
* | output |
* | --- |
* | "Call via browser" |
*
* @param {Ticket_Call_BrowserInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_browser: ((inputs?: Ticket_Call_BrowserInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Call_BrowserInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Call_BrowserInputs = {};
