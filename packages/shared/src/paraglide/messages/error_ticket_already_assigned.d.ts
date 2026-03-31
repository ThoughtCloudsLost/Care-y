/**
* | output |
* | --- |
* | "Ticket is already assigned." |
*
* @param {Error_Ticket_Already_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_already_assigned: ((inputs?: Error_Ticket_Already_AssignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Already_AssignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Already_AssignedInputs = {};
