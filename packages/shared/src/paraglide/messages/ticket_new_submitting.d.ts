/**
* | output |
* | --- |
* | "Encrypting and saving..." |
*
* @param {Ticket_New_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_submitting: ((inputs?: Ticket_New_SubmittingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_SubmittingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_SubmittingInputs = {};
