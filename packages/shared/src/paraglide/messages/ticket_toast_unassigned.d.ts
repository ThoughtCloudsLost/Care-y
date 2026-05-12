/**
* | output |
* | --- |
* | "{Ticket} unassigned" |
*
* @param {Ticket_Toast_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_unassigned: ((inputs: Ticket_Toast_UnassignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_UnassignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_UnassignedInputs = {
    Ticket: NonNullable<unknown>;
};
