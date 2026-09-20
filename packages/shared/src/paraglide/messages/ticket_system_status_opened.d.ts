/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Ticket_System_Status_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_status_opened: ((inputs?: Ticket_System_Status_OpenedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_System_Status_OpenedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_System_Status_OpenedInputs = {};
