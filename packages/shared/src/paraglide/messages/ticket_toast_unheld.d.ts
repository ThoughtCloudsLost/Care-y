/**
* | output |
* | --- |
* | "{Ticket} removed from hold" |
*
* @param {Ticket_Toast_UnheldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_unheld: ((inputs: Ticket_Toast_UnheldInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_UnheldInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_UnheldInputs = {
    Ticket: NonNullable<unknown>;
};
