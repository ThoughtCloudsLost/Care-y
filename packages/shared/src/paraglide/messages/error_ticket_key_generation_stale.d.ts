/**
* | output |
* | --- |
* | "This {ticket} was updated elsewhere. Close and reopen the editor to retry." |
*
* @param {Error_Ticket_Key_Generation_StaleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_key_generation_stale: ((inputs: Error_Ticket_Key_Generation_StaleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Key_Generation_StaleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Key_Generation_StaleInputs = {
    ticket: NonNullable<unknown>;
};
