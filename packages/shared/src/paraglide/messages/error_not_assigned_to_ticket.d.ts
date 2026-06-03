/**
* | output |
* | --- |
* | "You are not assigned to this {ticket}." |
*
* @param {Error_Not_Assigned_To_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_not_assigned_to_ticket: ((inputs: Error_Not_Assigned_To_TicketInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Not_Assigned_To_TicketInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Not_Assigned_To_TicketInputs = {
    ticket: NonNullable<unknown>;
};
