/**
* | output |
* | --- |
* | "{Ticket} placed on hold" |
*
* @param {Ticket_Toast_HeldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_held: ((inputs: Ticket_Toast_HeldInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_HeldInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_HeldInputs = {
    Ticket: NonNullable<unknown>;
};
