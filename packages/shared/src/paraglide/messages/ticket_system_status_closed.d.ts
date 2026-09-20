/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Ticket_System_Status_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_status_closed: ((inputs?: Ticket_System_Status_ClosedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Status_ClosedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Status_ClosedInputs = {};
