/**
* | output |
* | --- |
* | "Ticket placed on hold" |
*
* @param {Ticket_Toast_HeldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_held: ((inputs?: Ticket_Toast_HeldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_HeldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_HeldInputs = {};
