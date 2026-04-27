/**
* | output |
* | --- |
* | "Submit" |
*
* @param {Ticket_Close_Submit_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_close_submit_continue: ((inputs?: Ticket_Close_Submit_ContinueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Close_Submit_ContinueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Close_Submit_ContinueInputs = {};
