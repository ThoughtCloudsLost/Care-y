/**
* | output |
* | --- |
* | "Create Ticket" |
*
* @param {Ticket_New_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_submit: ((inputs?: Ticket_New_SubmitInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_SubmitInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_SubmitInputs = {};
