/**
* | output |
* | --- |
* | "Phone number is required for new clients" |
*
* @param {Ticket_New_Error_Phone_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_phone_required: ((inputs?: Ticket_New_Error_Phone_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Error_Phone_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Error_Phone_RequiredInputs = {};
