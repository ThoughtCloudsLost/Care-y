/**
* | output |
* | --- |
* | "Submit" |
*
* @param {Ticket_Close_Submit_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_close_submit_continue: ((inputs?: Ticket_Close_Submit_ContinueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Close_Submit_ContinueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Close_Submit_ContinueInputs = {};
