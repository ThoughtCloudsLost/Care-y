/**
* | output |
* | --- |
* | "Cannot assign a closed {ticket}." |
*
* @param {Error_Cannot_Assign_Closed_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_assign_closed_ticket: ((inputs: Error_Cannot_Assign_Closed_TicketInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Cannot_Assign_Closed_TicketInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Cannot_Assign_Closed_TicketInputs = {
    ticket: NonNullable<unknown>;
};
