/**
* | output |
* | --- |
* | "The {ticket} for this {client} changed while you were writing. Please try again." |
*
* @param {Error_Ticket_Create_Target_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_create_target_changed: ((inputs: Error_Ticket_Create_Target_ChangedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Create_Target_ChangedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Create_Target_ChangedInputs = {
    ticket: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
