/**
* | output |
* | --- |
* | "Ticket created" |
*
* @param {Ticket_New_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_success: ((inputs?: Ticket_New_SuccessInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_SuccessInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_SuccessInputs = {};
