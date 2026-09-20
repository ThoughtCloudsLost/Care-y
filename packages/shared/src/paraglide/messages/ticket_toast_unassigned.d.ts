/**
* | output |
* | --- |
* | "{Ticket} unassigned" |
*
* @param {Ticket_Toast_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_unassigned: ((inputs: Ticket_Toast_UnassignedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_UnassignedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_UnassignedInputs = {
    Ticket: NonNullable<unknown>;
};
