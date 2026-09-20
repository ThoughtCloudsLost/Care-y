/**
* | output |
* | --- |
* | "Placed on hold" |
*
* @param {Ticket_System_Hold_PlacedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_hold_placed: ((inputs?: Ticket_System_Hold_PlacedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Hold_PlacedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Hold_PlacedInputs = {};
